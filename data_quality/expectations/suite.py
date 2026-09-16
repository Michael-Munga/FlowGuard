"""FlowGuard Great Expectations Suite.

Validates schema constraints, column nullability, numerical boundaries,
referential set inclusion, and temporal rules across the 20 source CSV datasets.
"""

from typing import Dict, Any, List, Tuple
import pandas as pd
from great_expectations.dataset import PandasDataset


VALID_DEPOT_IDS = ["nairobi", "mombasa", "nakuru", "eldoret", "kisumu"]
VALID_OMC_IDS = ["vivo", "totalenergies", "rubis", "ola", "lakeoil", "hass", "petrocity"]
VALID_PRODUCT_IDS = ["PMS", "AGO", "DPK", "JET-A1"]


class FlowGuardQualitySuite:
    """Great Expectations suite for validating FlowGuard synthetic data."""

    def __init__(self, datasets: Dict[str, pd.DataFrame]):
        self.datasets = datasets
        self.results: Dict[str, Any] = {}

    def run_all_checks(self) -> Dict[str, Any]:
        """Execute all Great Expectations checks across all loaded tables."""
        suite_summary = {
            "total_expectations": 0,
            "passed_expectations": 0,
            "failed_expectations": 0,
            "table_results": {},
        }

        # 1. Depots Master Validation
        if "01_depots.csv" in self.datasets:
            ds = PandasDataset(self.datasets["01_depots.csv"])
            checks = [
                ds.expect_table_column_count_to_equal(8),
                ds.expect_column_values_to_not_be_null("depot_id"),
                ds.expect_column_values_to_be_unique("depot_id"),
                ds.expect_column_values_to_be_in_set("depot_id", VALID_DEPOT_IDS),
                ds.expect_column_values_to_be_between("baseline_turnaround_min", min_value=15, max_value=120),
            ]
            self._record_results(suite_summary, "01_depots.csv", checks)

        # 2. OMCs Master Validation
        if "02_omcs.csv" in self.datasets:
            ds = PandasDataset(self.datasets["02_omcs.csv"])
            checks = [
                ds.expect_table_column_count_to_equal(7),
                ds.expect_column_values_to_not_be_null("omc_id"),
                ds.expect_column_values_to_be_unique("omc_id"),
                ds.expect_column_values_to_be_in_set("omc_id", VALID_OMC_IDS),
                ds.expect_column_values_to_be_in_set("primary_depot_id", VALID_DEPOT_IDS),
            ]
            self._record_results(suite_summary, "02_omcs.csv", checks)

        # 3. Products Master Validation
        if "03_products.csv" in self.datasets:
            ds = PandasDataset(self.datasets["03_products.csv"])
            checks = [
                ds.expect_table_column_count_to_equal(7),
                ds.expect_column_values_to_not_be_null("product_id"),
                ds.expect_column_values_to_be_unique("product_id"),
                ds.expect_column_values_to_be_in_set("product_id", VALID_PRODUCT_IDS),
            ]
            self._record_results(suite_summary, "03_products.csv", checks)

        # 4. Trucks Master Validation
        if "04_trucks.csv" in self.datasets:
            ds = PandasDataset(self.datasets["04_trucks.csv"])
            checks = [
                ds.expect_column_values_to_not_be_null("truck_id"),
                ds.expect_column_values_to_be_unique("truck_id"),
                ds.expect_column_values_to_be_between("capacity_litres", min_value=10000, max_value=60000),
                ds.expect_column_values_to_not_be_null("driver_name"),
            ]
            self._record_results(suite_summary, "04_trucks.csv", checks)

        # 5. Loading Positions Validation
        if "10_loading_positions.csv" in self.datasets:
            ds = PandasDataset(self.datasets["10_loading_positions.csv"])
            checks = [
                ds.expect_column_values_to_not_be_null("loading_position_id"),
                ds.expect_column_values_to_be_unique("loading_position_id"),
                ds.expect_column_values_to_be_in_set("depot_id", VALID_DEPOT_IDS),
            ]
            self._record_results(suite_summary, "10_loading_positions.csv", checks)

        # 6. Loading Orders Validation (Expect failures due to intentional anomalies!)
        if "05_loading_orders.csv" in self.datasets:
            ds = PandasDataset(self.datasets["05_loading_orders.csv"])
            checks = [
                ds.expect_column_values_to_not_be_null("order_id"),
                ds.expect_column_values_to_be_unique("order_id"),  # Anomaly test: duplicates present
                ds.expect_column_values_to_be_in_set("depot_id", VALID_DEPOT_IDS),  # Anomaly test: unknown depot FKs
                ds.expect_column_values_to_be_in_set("omc_id", VALID_OMC_IDS),  # Anomaly test: unknown OMC FKs
                ds.expect_column_values_to_be_between("ordered_quantity_litres", min_value=1, max_value=100000),  # Anomaly test: negative & outliers
            ]
            self._record_results(suite_summary, "05_loading_orders.csv", checks)

        # 7. Gate Events Validation
        if "06_gate_events.csv" in self.datasets:
            ds = PandasDataset(self.datasets["06_gate_events.csv"])
            checks = [
                ds.expect_column_values_to_not_be_null("gate_event_id"),
                ds.expect_column_values_to_be_unique("gate_event_id"),
                ds.expect_column_values_to_be_in_set("depot_id", VALID_DEPOT_IDS),
                ds.expect_column_values_to_not_be_null("event_timestamp"),
            ]
            self._record_results(suite_summary, "06_gate_events.csv", checks)

        # 8. Staging Events Validation (Expect failures due to negative durations)
        if "08_staging_events.csv" in self.datasets:
            ds = PandasDataset(self.datasets["08_staging_events.csv"])
            checks = [
                ds.expect_column_values_to_not_be_null("staging_id"),
                ds.expect_column_values_to_be_between("wait_duration_minutes", min_value=0.0, max_value=300.0),
            ]
            self._record_results(suite_summary, "08_staging_events.csv", checks)

        # 9. Loading Events Validation (Expect failures due to negative durations)
        if "09_loading_events.csv" in self.datasets:
            ds = PandasDataset(self.datasets["09_loading_events.csv"])
            checks = [
                ds.expect_column_values_to_not_be_null("loading_event_id"),
                ds.expect_column_values_to_be_between("loading_duration_minutes", min_value=0.0, max_value=240.0),
            ]
            self._record_results(suite_summary, "09_loading_events.csv", checks)

        # 10. Decisions & 8-Stage Pipeline Validation
        if "16_decisions.csv" in self.datasets:
            ds = PandasDataset(self.datasets["16_decisions.csv"])
            checks = [
                ds.expect_column_values_to_not_be_null("decision_id"),
                ds.expect_column_values_to_be_unique("decision_id"),
                ds.expect_column_values_to_be_in_set("autonomy_level", ["L1_ADVISORY", "L2_AUTO_EXECUTABLE", "L3_APPROVAL_REQUIRED", "L1_RECOMMENDATION", "L3_SUPERVISED_APPROVAL"]),
            ]
            self._record_results(suite_summary, "16_decisions.csv", checks)

        if "17_decision_stages.csv" in self.datasets:
            ds = PandasDataset(self.datasets["17_decision_stages.csv"])
            checks = [
                ds.expect_column_values_to_not_be_null("stage_id"),
                ds.expect_column_values_to_be_between("stage_sequence", min_value=1, max_value=8),
                ds.expect_column_values_to_be_in_set("stage_name", ["SIGNAL", "PREDICT", "DIAGNOSE", "OPTIMIZE", "DECIDE", "EXECUTE", "VERIFY", "LOG"]),
            ]
            self._record_results(suite_summary, "17_decision_stages.csv", checks)

        return suite_summary

    def _record_results(self, suite_summary: Dict[str, Any], table_name: str, check_results: List[Any]):
        """Helper to tally expectations and collect failure details."""
        table_entry = {
            "checks_run": len(check_results),
            "passed": sum(1 for c in check_results if c.success),
            "failed": sum(1 for c in check_results if not c.success),
            "expectations": [],
        }

        for c in check_results:
            suite_summary["total_expectations"] += 1
            if c.success:
                suite_summary["passed_expectations"] += 1
            else:
                suite_summary["failed_expectations"] += 1

            expectation_type = c.expectation_config.expectation_type if hasattr(c, "expectation_config") else "unknown"
            kwargs = c.expectation_config.kwargs if hasattr(c, "expectation_config") else {}
            table_entry["expectations"].append({
                "type": expectation_type,
                "column": kwargs.get("column", "table_level"),
                "success": bool(c.success),
                "unexpected_count": c.result.get("unexpected_count", 0) if hasattr(c, "result") else 0,
                "unexpected_percent": c.result.get("unexpected_percent", 0.0) if hasattr(c, "result") else 0.0,
            })

        suite_summary["table_results"][table_name] = table_entry
