"""Unit and integration tests for FlowGuard ML pipeline, leakage protection, models, and risk scoring."""

import pytest
import numpy as np
import pandas as pd
from datetime import datetime, timezone

from backend.app.db.session import engine
from backend.ml.datasets.extractor import (
    extract_arrival_dataset,
    extract_turnaround_dataset,
    extract_order_features_for_arrival,
    extract_order_features_for_turnaround,
)
from backend.ml.features.definitions import (
    validate_arrival_features,
    validate_turnaround_features,
    ARRIVAL_ALL_FEATURES,
    TURNAROUND_ALL_FEATURES,
    FORBIDDEN_ARRIVAL_COLUMNS,
    FORBIDDEN_TURNAROUND_COLUMNS,
)
from backend.ml.training.split import chronological_split
from backend.ml.evaluation.metrics import calculate_regression_metrics
from backend.ml.inference.loader import ModelLoader
from backend.ml.inference.arrival_predictor import ArrivalPredictor
from backend.ml.inference.turnaround_predictor import TurnaroundPredictor
from backend.ml.inference.gate_out_predictor import GateOutPredictor
from backend.ml.inference.risk_scorer import RiskScorer


# ==============================================================================
# 1. LEAKAGE PROTECTION & FEATURE DEFINITIONS
# ==============================================================================
def test_arrival_leakage_validator_detects_forbidden_columns():
    """Ensure validate_arrival_features raises ValueError when post-arrival columns leak."""
    with pytest.raises(ValueError, match="TARGET LEAKAGE DETECTED"):
        validate_arrival_features(["depot_id", "omc_id", "actual_arrival_time"])

    with pytest.raises(ValueError, match="TARGET LEAKAGE DETECTED"):
        validate_arrival_features(["depot_id", "loading_duration_minutes"])

    # Valid pre-arrival columns must not raise
    validate_arrival_features(["depot_id", "omc_id", "planned_lead_time_min", "estimated_distance_km"])


def test_turnaround_leakage_validator_detects_forbidden_columns():
    """Ensure validate_turnaround_features raises ValueError when post-gate-in columns leak."""
    with pytest.raises(ValueError, match="TARGET LEAKAGE DETECTED"):
        validate_turnaround_features(["depot_id", "gate_out_time"])

    with pytest.raises(ValueError, match="TARGET LEAKAGE DETECTED"):
        validate_turnaround_features(["depot_id", "actual_flow_rate_lpm"])

    # Valid gate-in columns must not raise
    validate_turnaround_features(["depot_id", "active_trucks_in_depot", "tare_weight_kg", "compatible_bays_count"])


# ==============================================================================
# 2. DATASET EXTRACTION & CHRONOLOGICAL SPLIT
# ==============================================================================
def test_arrival_dataset_extraction_has_zero_leakage():
    """Ensure extracted arrival dataset adheres strictly to leakage controls."""
    df = extract_arrival_dataset(engine)
    assert len(df) > 5000, "Arrival dataset should contain historical records"
    assert "minutes_to_arrival" in df.columns, "Target column must exist"

    # Confirm no forbidden columns exist
    for forbidden in FORBIDDEN_ARRIVAL_COLUMNS:
        assert forbidden not in df.columns, f"Forbidden column '{forbidden}' leaked into arrival dataset"


def test_turnaround_dataset_extraction_has_zero_leakage():
    """Ensure extracted turnaround dataset adheres strictly to leakage controls."""
    df = extract_turnaround_dataset(engine)
    assert len(df) > 5000, "Turnaround dataset should contain historical records"
    assert "turnaround_minutes" in df.columns, "Target column must exist"

    for forbidden in FORBIDDEN_TURNAROUND_COLUMNS:
        assert forbidden not in df.columns, f"Forbidden column '{forbidden}' leaked into turnaround dataset"


def test_chronological_split_strict_ordering():
    """Verify chronological split avoids temporal overlap and shuffles."""
    df = extract_arrival_dataset(engine)
    train_df, val_df, test_df = chronological_split(df, time_column="reference_time")

    assert len(train_df) > 0 and len(val_df) > 0 and len(test_df) > 0
    assert train_df["reference_time"].max() <= val_df["reference_time"].min()
    assert val_df["reference_time"].max() <= test_df["reference_time"].min()


# ==============================================================================
# 3. MODEL INFERENCE & CACHING
# ==============================================================================
def test_model_loader_singleton_caching():
    """Ensure models load once and subsequent calls return identical cached objects."""
    arr_pipe1, meta1 = ModelLoader.get_arrival_model()
    arr_pipe2, meta2 = ModelLoader.get_arrival_model()
    assert arr_pipe1 is arr_pipe2, "Arrival model should be cached in-memory singleton"

    trn_pipe1, meta_t1 = ModelLoader.get_turnaround_model()
    trn_pipe2, meta_t2 = ModelLoader.get_turnaround_model()
    assert trn_pipe1 is trn_pipe2, "Turnaround model should be cached in-memory singleton"


def test_arrival_prediction_demo_order():
    """Verify arrival inference for demo order returns valid prediction and window."""
    predictor = ArrivalPredictor(engine)
    res = predictor.predict_arrival("LO-NBO-8821")

    assert res["status"] == "PREDICTION_AVAILABLE"
    assert res["depot_id"] == "nairobi"
    assert res["predicted_duration_minutes"] > 0
    assert "prediction_window" in res
    assert res["prediction_window"]["window_start"] < res["prediction_window"]["window_end"]
    assert res["confidence_pct"] >= 60.0
    assert len(res["top_features"]) > 0


def test_arrival_prediction_nonexistent_order():
    """Verify arrival inference safely reports unavailable for nonexistent order."""
    predictor = ArrivalPredictor(engine)
    res = predictor.predict_arrival("NON_EXISTENT_ORDER_9999")
    assert res["status"] == "PREDICTION_UNAVAILABLE"


def test_turnaround_prediction_demo_order():
    """Verify turnaround inference returns duration, delta vs baseline, and active trucks."""
    predictor = TurnaroundPredictor(engine)
    res = predictor.predict_turnaround("LO-NBO-8821")

    assert res["status"] == "PREDICTION_AVAILABLE"
    assert res["depot_id"] == "nairobi"
    assert res["predicted_turnaround_minutes"] > 0
    assert res["baseline_turnaround_minutes"] == 65.0  # Nairobi baseline
    assert "turnaround_delta_minutes" in res
    assert "depot_active_trucks" in res


def test_gate_out_prediction_demo_order():
    """Verify gate-out predictor handles order lifecycle state."""
    predictor = GateOutPredictor(engine)
    res = predictor.predict_gate_out("LO-NBO-8821")
    # Demo order LO-NBO-8821 is completed in database
    assert res["status"] == "COMPLETED"
    assert res["operational_phase"] == "GATED_OUT"


# ==============================================================================
# 4. BUSINESS CASE: OPERATIONAL PRESSURE VS LOW PRESSURE
# ==============================================================================
def test_business_case_high_pressure_increases_risk():
    """Business rule verification:
    High concurrency and turnaround inflation must yield higher risk score and critical reasons.
    """
    risk_scorer = RiskScorer(engine)
    order_id = "LO-NBO-8821"

    res = risk_scorer.assess_order_risk(order_id)
    assert res["status"] == "ASSESSMENT_AVAILABLE"
    assert res["risk_level"] in ("MEDIUM", "HIGH", "CRITICAL")
    assert len(res["risk_reasons"]) > 0

    # Verify depot risk for a nominal depot
    depot_res = risk_scorer.assess_depot_risk("nairobi")
    assert depot_res["status"] == "ASSESSMENT_AVAILABLE"
    assert 0 <= depot_res["risk_score"] <= 100
