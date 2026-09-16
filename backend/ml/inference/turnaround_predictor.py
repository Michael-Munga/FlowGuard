"""Real-time online inference service for KPC Depot Turnaround Prediction."""

from typing import Dict, Any, Optional
import pandas as pd
from sqlalchemy import Engine

from backend.ml.inference.loader import ModelLoader
from backend.ml.datasets.extractor import extract_order_features_for_turnaround
from backend.ml.features.definitions import TURNAROUND_ALL_FEATURES


class TurnaroundPredictor:
    """Online turnaround inference engine using cached XGBoost pipeline."""

    def __init__(self, engine: Engine):
        self.engine = engine

    def predict_turnaround(self, order_id: str) -> Dict[str, Any]:
        """Generate turnaround prediction, delta vs baseline, confidence, and feature contributions."""
        features_df = extract_order_features_for_turnaround(self.engine, order_id)
        if features_df is None or features_df.empty:
            return {
                "order_id": order_id,
                "status": "PREDICTION_UNAVAILABLE",
                "reason": f"Order with identifier '{order_id}' was not found in operational database.",
                "model_version": "v1.0.0",
            }

        try:
            pipeline, metadata = ModelLoader.get_turnaround_model()
        except Exception as e:
            return {
                "order_id": order_id,
                "status": "MODEL_UNAVAILABLE",
                "reason": f"Turnaround prediction model artifact unavailable: {str(e)}",
                "model_version": "unavailable",
            }

        row = features_df.iloc[0]
        baseline_min = float(row["depot_baseline_turnaround_min"])
        active_trucks = float(row["active_trucks_in_depot"])
        utilization = float(row["estimated_bay_utilization"])

        # Predict turnaround duration
        X = features_df[TURNAROUND_ALL_FEATURES]
        pred_duration = float(pipeline.predict(X)[0])
        pred_duration = max(30.0, round(pred_duration, 1))

        turnaround_delta = round(pred_duration - baseline_min, 1)

        # High concurrency slightly expands uncertainty margin
        margin_min = 9.0 if active_trucks <= 6 else 13.0
        confidence = 85.0 if active_trucks <= 10 else 76.0

        # Build explainability payload
        top_features_meta = metadata.get("top_features", [])
        top_features = []
        for feat in top_features_meta[:4]:
            name = feat["feature"]
            val = row.get(name, "N/A")
            top_features.append({
                "feature_name": name,
                "feature_value": str(val) if not pd.isna(val) else "N/A",
                "importance_weight": feat["importance"],
            })

        return {
            "order_id": order_id,
            "status": "PREDICTION_AVAILABLE",
            "depot_id": str(row["depot_id"]),
            "omc_id": str(row["omc_id"]),
            "product_id": str(row["product_id"]),
            "predicted_turnaround_minutes": pred_duration,
            "baseline_turnaround_minutes": baseline_min,
            "turnaround_delta_minutes": turnaround_delta,
            "prediction_window": {
                "min_duration_minutes": max(25.0, round(pred_duration - margin_min, 1)),
                "max_duration_minutes": round(pred_duration + margin_min, 1),
                "margin_minutes": margin_min,
            },
            "confidence_pct": confidence,
            "depot_active_trucks": int(active_trucks),
            "bay_utilization_ratio": round(utilization, 2),
            "top_features": top_features,
            "model_version": metadata.get("model_version", "v1.0.0"),
        }
