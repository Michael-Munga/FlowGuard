"""Training script for FlowGuard Turnaround Prediction Model (XGBoost vs Baseline)."""

import os
import json
from datetime import datetime, timezone
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
import xgboost as xgb
import joblib

from backend.app.db.session import engine
from backend.ml.datasets.extractor import extract_turnaround_dataset
from backend.ml.training.split import chronological_split, TRAIN_SPLIT_CUTOFF, VAL_SPLIT_CUTOFF
from backend.ml.features.definitions import TURNAROUND_ALL_FEATURES, TURNAROUND_TARGET
from backend.ml.features.preprocessor import create_turnaround_preprocessor
from backend.ml.evaluation.metrics import calculate_regression_metrics

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../models/turnaround"))
MODEL_PATH = os.path.join(MODEL_DIR, "turnaround_model_v1.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "metadata.json")


def train_turnaround_model(save_artifacts: bool = True) -> dict:
    """Train, evaluate, and persist the Turnaround Prediction model."""
    print("=" * 70)
    print("FLOWGUARD ML: TRAINING TURNAROUND PREDICTION MODEL")
    print("=" * 70)

    # 1. Extract canonical data
    print("1. Extracting canonical historical records from PostgreSQL...")
    df = extract_turnaround_dataset(engine)
    print(f"   Extracted {len(df):,} completed turnaround lifecycles.")

    # 2. Chronological split
    print("2. Performing chronological train/val/test split...")
    train_df, val_df, test_df = chronological_split(df, time_column="order_registered_time")
    print(f"   Train split: {len(train_df):,} records (< {TRAIN_SPLIT_CUTOFF})")
    print(f"   Validation:  {len(val_df):,} records ({TRAIN_SPLIT_CUTOFF} to {VAL_SPLIT_CUTOFF})")
    print(f"   Test split:  {len(test_df):,} records (>= {VAL_SPLIT_CUTOFF})")

    X_train = train_df[TURNAROUND_ALL_FEATURES]
    y_train = train_df[TURNAROUND_TARGET]
    X_val = val_df[TURNAROUND_ALL_FEATURES]
    y_val = val_df[TURNAROUND_TARGET]
    X_test = test_df[TURNAROUND_ALL_FEATURES]
    y_test = test_df[TURNAROUND_TARGET]

    # 3. Evaluate Baseline (Depot Standard Baseline Turnaround)
    print("3. Evaluating Operational Baseline Model (Static KPC Depot Target)...")
    baseline_pred_test = test_df["depot_baseline_turnaround_min"].values
    baseline_metrics = calculate_regression_metrics(y_test, baseline_pred_test, is_turnaround=True)
    print(f"   Baseline Test MAE:             {baseline_metrics['mae']:.2f} min")
    print(f"   Baseline Test RMSE:            {baseline_metrics['rmse']:.2f} min")
    print(f"   Baseline Test MedAE:           {baseline_metrics['medae']:.2f} min")
    print(f"   Baseline % Within 5 min:       {baseline_metrics['pct_within_5min']}%")
    print(f"   Baseline % Within 10 min:      {baseline_metrics['pct_within_10min']}%")
    print(f"   Baseline % Within 15 min:      {baseline_metrics['pct_within_15min']}%")

    # 4. Train XGBoost Pipeline
    print("4. Training XGBoost Regressor Pipeline...")
    preprocessor = create_turnaround_preprocessor()
    regressor = xgb.XGBRegressor(
        n_estimators=180,
        max_depth=5,
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
    model_metrics = calculate_regression_metrics(y_test, ml_pred_test, is_turnaround=True)
    print(f"   ML Model Test MAE:             {model_metrics['mae']:.2f} min")
    print(f"   ML Model Test RMSE:            {model_metrics['rmse']:.2f} min")
    print(f"   ML Model Test MedAE:           {model_metrics['medae']:.2f} min")
    print(f"   ML Model % Within 5 min:       {model_metrics['pct_within_5min']}%")
    print(f"   ML Model % Within 10 min:      {model_metrics['pct_within_10min']}%")
    print(f"   ML Model % Within 15 min:      {model_metrics['pct_within_15min']}%")

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
            "model_name": "flowguard_turnaround_predictor",
            "model_version": "v1.0.0",
            "algorithm": "XGBoost (XGBRegressor Pipeline)",
            "target": TURNAROUND_TARGET,
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
            "features": TURNAROUND_ALL_FEATURES,
            "baseline_metrics": baseline_metrics,
            "model_metrics": model_metrics,
            "mae_reduction_pct": mae_reduction_pct,
            "top_features": top_features,
        }

        with open(METADATA_PATH, "w") as f:
            json.dump(metadata, f, indent=2)
        print(f"   Metadata saved to: {METADATA_PATH}")

    print("=" * 70)
    print("TURNAROUND MODEL TRAINING COMPLETE")
    print("=" * 70)
    return {
        "baseline_metrics": baseline_metrics,
        "model_metrics": model_metrics,
        "mae_reduction_pct": mae_reduction_pct,
        "top_features": top_features,
    }


if __name__ == "__main__":
    train_turnaround_model(save_artifacts=True)
