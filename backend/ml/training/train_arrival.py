"""Training script for FlowGuard Arrival Prediction Model (XGBoost vs Baseline)."""

import os
import json
from datetime import datetime, timezone
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
import xgboost as xgb
import joblib

from backend.app.db.session import engine
from backend.ml.datasets.extractor import extract_arrival_dataset
from backend.ml.training.split import chronological_split, TRAIN_SPLIT_CUTOFF, VAL_SPLIT_CUTOFF
from backend.ml.features.definitions import ARRIVAL_ALL_FEATURES, ARRIVAL_TARGET
from backend.ml.features.preprocessor import create_arrival_preprocessor
from backend.ml.evaluation.metrics import calculate_regression_metrics

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../models/arrival"))
MODEL_PATH = os.path.join(MODEL_DIR, "arrival_model_v1.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "metadata.json")


def train_arrival_model(save_artifacts: bool = True) -> dict:
    """Train, evaluate, and persist the Arrival Prediction model."""
    print("=" * 70)
    print("FLOWGUARD ML: TRAINING ARRIVAL PREDICTION MODEL")
    print("=" * 70)

    # 1. Extract canonical data
    print("1. Extracting canonical historical records from PostgreSQL...")
    df = extract_arrival_dataset(engine)
    print(f"   Extracted {len(df):,} completed orders.")

    # 2. Chronological split
    print("2. Performing chronological train/val/test split...")
    train_df, val_df, test_df = chronological_split(df, time_column="reference_time")
    print(f"   Train split: {len(train_df):,} records (< {TRAIN_SPLIT_CUTOFF})")
    print(f"   Validation:  {len(val_df):,} records ({TRAIN_SPLIT_CUTOFF} to {VAL_SPLIT_CUTOFF})")
    print(f"   Test split:  {len(test_df):,} records (>= {VAL_SPLIT_CUTOFF})")

    X_train = train_df[ARRIVAL_ALL_FEATURES]
    y_train = train_df[ARRIVAL_TARGET]
    X_val = val_df[ARRIVAL_ALL_FEATURES]
    y_val = val_df[ARRIVAL_TARGET]
    X_test = test_df[ARRIVAL_ALL_FEATURES]
    y_test = test_df[ARRIVAL_TARGET]

    # 3. Evaluate Baseline (Planned Lead Time)
    print("3. Evaluating Operational Baseline Model (Planned Scheduling Lead Time)...")
    baseline_pred_test = test_df["planned_lead_time_min"].values
    baseline_metrics = calculate_regression_metrics(y_test, baseline_pred_test)
    print(f"   Baseline Test MAE:   {baseline_metrics['mae']:.2f} min")
    print(f"   Baseline Test RMSE:  {baseline_metrics['rmse']:.2f} min")
    print(f"   Baseline Test MedAE: {baseline_metrics['medae']:.2f} min")

    # 4. Train XGBoost Pipeline
    print("4. Training XGBoost Regressor Pipeline...")
    preprocessor = create_arrival_preprocessor()
    regressor = xgb.XGBRegressor(
        n_estimators=160,
        max_depth=4,
        learning_rate=0.04,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
    )

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", regressor),
    ])

    pipeline.fit(X_train, y_train)

    # 5. Evaluate on Validation & Test sets
    print("5. Evaluating ML Model on Holdout Chronological Test Set...")
    ml_pred_test = pipeline.predict(X_test)
    model_metrics = calculate_regression_metrics(y_test, ml_pred_test)
    print(f"   ML Model Test MAE:   {model_metrics['mae']:.2f} min")
    print(f"   ML Model Test RMSE:  {model_metrics['rmse']:.2f} min")
    print(f"   ML Model Test MedAE: {model_metrics['medae']:.2f} min")

    mae_reduction_pct = round((baseline_metrics["mae"] - model_metrics["mae"]) / baseline_metrics["mae"] * 100, 1)
    print(f"   Demonstrated Error Reduction vs Baseline: {mae_reduction_pct}%")

    # 6. Feature Importances
    fitted_preprocessor = pipeline.named_steps["preprocessor"]
    fitted_regressor = pipeline.named_steps["regressor"]
    feature_names = fitted_preprocessor.get_feature_names_out()
    importances = fitted_regressor.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]

    top_features = []
    for idx in sorted_idx[:8]:
        raw_name = str(feature_names[idx])
        # Clean up column transformer prefixes
        clean_name = raw_name.replace("cat__", "").replace("num__", "")
        top_features.append({
            "feature": clean_name,
            "importance": float(round(float(importances[idx]), 4)),
        })

    # 7. Persist Artifacts
    if save_artifacts:
        os.makedirs(MODEL_DIR, exist_ok=True)
        joblib.dump(pipeline, MODEL_PATH)
        print(f"   Model artifact saved to: {MODEL_PATH}")

        metadata = {
            "model_name": "flowguard_arrival_predictor",
            "model_version": "v1.0.0",
            "algorithm": "XGBoost (XGBRegressor Pipeline)",
            "target": ARRIVAL_TARGET,
            "training_timestamp": datetime.now(timezone.utc).isoformat(),
            "random_seed": 42,
            "record_counts": {
                "total": len(df),
                "train": len(train_df),
                "validation": len(val_df),
                "test": len(test_df),
            },
            "chronological_cutoffs": {
                "train_end": TRAIN_SPLIT_CUTOFF,
                "validation_end": VAL_SPLIT_CUTOFF,
            },
            "features": ARRIVAL_ALL_FEATURES,
            "baseline_metrics": baseline_metrics,
            "model_metrics": model_metrics,
            "mae_reduction_pct": mae_reduction_pct,
            "top_features": top_features,
        }

        with open(METADATA_PATH, "w") as f:
            json.dump(metadata, f, indent=2)
        print(f"   Metadata saved to: {METADATA_PATH}")

    print("=" * 70)
    print("ARRIVAL MODEL TRAINING COMPLETE")
    print("=" * 70)
    return {
        "baseline_metrics": baseline_metrics,
        "model_metrics": model_metrics,
        "mae_reduction_pct": mae_reduction_pct,
        "top_features": top_features,
    }


if __name__ == "__main__":
    train_arrival_model(save_artifacts=True)
