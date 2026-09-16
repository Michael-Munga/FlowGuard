"""Real-time online inference service for KPC Tanker Arrival Prediction."""

from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
import pandas as pd
from sqlalchemy import Engine

from backend.ml.inference.loader import ModelLoader
from backend.ml.datasets.extractor import extract_order_features_for_arrival
from backend.ml.features.definitions import ARRIVAL_ALL_FEATURES


class ArrivalPredictor:
    """Online arrival inference engine using cached XGBoost pipeline."""

    def __init__(self, engine: Engine):
        self.engine = engine

    def predict_arrival(self, order_id: str) -> Dict[str, Any]:
        """Generate arrival prediction, time window, confidence, and feature contributions."""
        features_df = extract_order_features_for_arrival(self.engine, order_id)
        if features_df is None or features_df.empty:
            return {
                "order_id": order_id,
                "status": "PREDICTION_UNAVAILABLE",
                "reason": f"Order with identifier '{order_id}' was not found in operational database.",
                "model_version": "v1.0.0",
            }

        try:
            pipeline, metadata = ModelLoader.get_arrival_model()
        except Exception as e:
            return {
                "order_id": order_id,
                "status": "MODEL_UNAVAILABLE",
                "reason": f"Arrival prediction model artifact unavailable: {str(e)}",
                "model_version": "unavailable",
            }

        # Check required fields
        row = features_df.iloc[0]
        ref_time = row["reference_time"]
        planned_lead = float(row["planned_lead_time_min"])
        signal_quality = str(row["signal_quality"])

        # Predict minutes to arrival
        X = features_df[ARRIVAL_ALL_FEATURES]
        pred_duration = float(pipeline.predict(X)[0])
        pred_duration = max(5.0, round(pred_duration, 1))

        # Ensure datetime is timezone-aware
        if pd.isna(ref_time):
            ref_time = datetime.now(timezone.utc)
        elif isinstance(ref_time, pd.Timestamp):
            ref_time = ref_time.to_pydatetime()
        if ref_time.tzinfo is None:
            ref_time = ref_time.replace(tzinfo=timezone.utc)

        pred_arrival_time = ref_time + timedelta(minutes=pred_duration)

        # Dynamic confidence based on telematics sensor quality
        if signal_quality == "HIGH":
            confidence = 88.0
            margin_min = 10.0
        elif signal_quality == "MEDIUM":
            confidence = 78.0
            margin_min = 14.0
        elif signal_quality == "LOW":
            confidence = 68.0
            margin_min = 18.0
        else:
            confidence = 62.0
            margin_min = 20.0

        window_start = pred_arrival_time - timedelta(minutes=margin_min)
        window_end = pred_arrival_time + timedelta(minutes=margin_min)

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
            "reference_time": ref_time.isoformat(),
            "predicted_arrival_time": pred_arrival_time.isoformat(),
            "predicted_duration_minutes": pred_duration,
            "prediction_window": {
                "window_start": window_start.isoformat(),
                "window_end": window_end.isoformat(),
                "margin_minutes": margin_min,
            },
            "confidence_pct": confidence,
            "baseline_duration_minutes": round(planned_lead, 1),
            "lead_time_variance_minutes": round(pred_duration - planned_lead, 1),
            "top_features": top_features,
            "model_version": metadata.get("model_version", "v1.0.0"),
        }
