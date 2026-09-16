"""Tests for data quality suite, anomaly detection, and Great Expectations integration."""

import pandas as pd
import pytest
from backend.app.config import settings
from data_quality.expectations.suite import FlowGuardQualitySuite
from etl.quarantine.manager import QuarantineManager
from etl.validators.business_rules import BusinessRuleValidator


def test_great_expectations_detects_intentional_anomalies():
    """Verify that Great Expectations detects intentional anomalies in orders, staging, and loading."""
    source_dir = settings.source_data_path
    dfs = {
        "01_depots.csv": pd.read_csv(source_dir / "01_depots.csv"),
        "02_omcs.csv": pd.read_csv(source_dir / "02_omcs.csv"),
        "03_products.csv": pd.read_csv(source_dir / "03_products.csv"),
        "04_trucks.csv": pd.read_csv(source_dir / "04_trucks.csv"),
        "05_loading_orders.csv": pd.read_csv(source_dir / "05_loading_orders.csv"),
        "08_staging_events.csv": pd.read_csv(source_dir / "08_staging_events.csv"),
        "09_loading_events.csv": pd.read_csv(source_dir / "09_loading_events.csv"),
        "10_loading_positions.csv": pd.read_csv(source_dir / "10_loading_positions.csv"),
        "16_decisions.csv": pd.read_csv(source_dir / "16_decisions.csv"),
        "17_decision_stages.csv": pd.read_csv(source_dir / "17_decision_stages.csv"),
    }

    suite = FlowGuardQualitySuite(dfs)
    summary = suite.run_all_checks()

    # Master tables must pass completely
    assert summary["table_results"]["01_depots.csv"]["failed"] == 0
    assert summary["table_results"]["02_omcs.csv"]["failed"] == 0
    assert summary["table_results"]["03_products.csv"]["failed"] == 0
    assert summary["table_results"]["04_trucks.csv"]["failed"] == 0

    # Tables with intentional anomalies must be flagged
    assert summary["table_results"]["05_loading_orders.csv"]["failed"] > 0
    assert summary["table_results"]["08_staging_events.csv"]["failed"] > 0
    assert summary["table_results"]["09_loading_events.csv"]["failed"] > 0


def test_business_rule_validator_quarantines_invalid_orders(tmp_path):
    """Verify business rule validator catches and quarantines invalid orders."""
    qm = QuarantineManager(quarantine_dir=tmp_path, run_id="TEST-RUN-01")
    validator = BusinessRuleValidator(quarantine_mgr=qm)

    # Pre-populate valid foreign keys
    validator.valid_truck_ids.add("TRK-0001")

    test_orders = pd.DataFrame([
        {
            "order_id": "LO-GOOD-01",
            "omc_id": "vivo",
            "depot_id": "nairobi",
            "truck_id": "TRK-0001",
            "product_id": "AGO",
            "ordered_quantity_litres": 36000,
            "order_registered_time": "2026-09-15 08:00:00",
            "expected_arrival_time": "2026-09-15 09:00:00",
            "scheduled_window_start": "2026-09-15 08:45:00",
            "scheduled_window_end": "2026-09-15 09:30:00",
            "order_status": "REGISTERED",
            "cancellation_reason": None,
        },
        {
            # Negative quantity anomaly
            "order_id": "LO-BAD-NEG",
            "omc_id": "vivo",
            "depot_id": "nairobi",
            "truck_id": "TRK-0001",
            "product_id": "AGO",
            "ordered_quantity_litres": -5000,
            "order_registered_time": "2026-09-15 08:00:00",
            "expected_arrival_time": "2026-09-15 09:00:00",
            "scheduled_window_start": "2026-09-15 08:45:00",
            "scheduled_window_end": "2026-09-15 09:30:00",
            "order_status": "REGISTERED",
            "cancellation_reason": None,
        },
        {
            # Unknown depot FK anomaly
            "order_id": "LO-BAD-DEPOT",
            "omc_id": "vivo",
            "depot_id": "UNKNOWN_DEPOT",
            "truck_id": "TRK-0001",
            "product_id": "AGO",
            "ordered_quantity_litres": 36000,
            "order_registered_time": "2026-09-15 08:00:00",
            "expected_arrival_time": "2026-09-15 09:00:00",
            "scheduled_window_start": "2026-09-15 08:45:00",
            "scheduled_window_end": "2026-09-15 09:30:00",
            "order_status": "REGISTERED",
            "cancellation_reason": None,
        },
    ])

    valid_df = validator.validate_loading_orders(test_orders)

    assert len(valid_df) == 1
    assert valid_df.iloc[0]["order_id"] == "LO-GOOD-01"
    assert qm.get_count() == 2

    rules_triggered = [item.validation_rule for item in qm.items]
    assert "RULE_NEGATIVE_QUANTITY" in rules_triggered
    assert "RULE_UNKNOWN_FOREIGN_KEY" in rules_triggered
