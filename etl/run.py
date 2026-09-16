"""FlowGuard ETL Pipeline Runner.

Orchestrates:
1. Source discovery and schema validation
2. Great Expectations quality suite execution
3. Row-level anomaly isolation and quarantine routing
4. Idempotent bulk loading into PostgreSQL canonical schema
5. Audit run tracking and report generation
"""

import sys
import os
import json
import uuid
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any
import pandas as pd

# Add repo root to sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.app.config import settings
from backend.app.db.session import SessionLocal
from backend.app.db.models import (
    Depot,
    OMC,
    Product,
    Truck,
    LoadingPosition,
    LoadingOrder,
    GateEvent,
    ValidationEvent,
    StagingEvent,
    LoadingEvent,
    EquipmentEvent,
    ProductReadinessEvent,
    ArrivalSignal,
    Notification,
    RiskEvent,
    Decision,
    DecisionStage,
    AutonomousAction,
    VerificationEvent,
    AuditEvent,
)
from data_quality.expectations.suite import FlowGuardQualitySuite
from etl.config import REQUIRED_CSV_FILES
from etl.quarantine.manager import QuarantineManager
from etl.validators.business_rules import BusinessRuleValidator
from etl.transformers.cleaners import DataCleaner
from etl.loaders.database_loader import DatabaseLoader

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("flowguard.etl")


def run_pipeline() -> int:
    """Execute the full FlowGuard ETL pipeline. Returns exit code (0 for success)."""
    run_id = f"ETL-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
    start_time = datetime.utcnow()
    logger.info("================================================================================")
    logger.info("STARTING KPC FLOWGUARD ETL PIPELINE — RUN ID: %s", run_id)
    logger.info("Source Directory: %s", settings.source_data_path)
    logger.info("Quarantine Directory: %s", settings.quarantine_path)
    logger.info("Database Target: %s", settings.DATABASE_URL.split("@")[-1])
    logger.info("================================================================================")

    # 1. Verify Source Files Exist
    source_dir = settings.source_data_path
    if not source_dir.exists():
        logger.error("Source directory %s does not exist!", source_dir)
        return 1

    missing_files = [f for f in REQUIRED_CSV_FILES if not (source_dir / f).exists()]
    if missing_files:
        logger.error("Missing required source CSV files: %s", missing_files)
        return 1

    logger.info("All 20 required CSV source files discovered.")

    # 2. Read All Datasets into Memory
    raw_dfs: Dict[str, pd.DataFrame] = {}
    total_rows_read = 0
    for f in REQUIRED_CSV_FILES:
        path = source_dir / f
        df = pd.read_csv(path)
        raw_dfs[f] = df
        total_rows_read += len(df)
        logger.debug("Read %s: %d rows", f, len(df))

    logger.info("Successfully read %d total records across 20 source tables.", total_rows_read)

    # 3. Setup Database Session & Record Run Start
    session = SessionLocal()
    loader = DatabaseLoader(session=session, run_id=run_id)
    loader.record_run_start(source_version="v1.0-synthetic-97d", rows_read=total_rows_read)

    try:
        # 4. Run Great Expectations Suite
        logger.info("Running Great Expectations Quality Suite...")
        ge_suite = FlowGuardQualitySuite(datasets=raw_dfs)
        ge_results = ge_suite.run_all_checks()
        logger.info(
            "Great Expectations complete: %d expectations evaluated (%d passed, %d flagged).",
            ge_results["total_expectations"],
            ge_results["passed_expectations"],
            ge_results["failed_expectations"],
        )

        # Save GE Report
        reports_dir = settings.reports_path
        reports_dir.mkdir(parents=True, exist_ok=True)
        ge_report_path = reports_dir / "great_expectations_report.json"
        with open(ge_report_path, "w") as f:
            json.dump(ge_results, f, indent=2)

        # 5. Row-Level Validation & Anomaly Quarantine
        logger.info("Executing row-level business rule validation and anomaly separation...")
        qm = QuarantineManager(quarantine_dir=settings.quarantine_path, run_id=run_id)
        validator = BusinessRuleValidator(quarantine_mgr=qm)

        valid_depots_df = validator.validate_depots(raw_dfs["01_depots.csv"])
        valid_omcs_df = validator.validate_omcs(raw_dfs["02_omcs.csv"])
        valid_products_df = validator.validate_products(raw_dfs["03_products.csv"])
        valid_trucks_df = validator.validate_trucks(raw_dfs["04_trucks.csv"])
        valid_positions_df = validator.validate_loading_positions(raw_dfs["10_loading_positions.csv"])

        valid_orders_df = validator.validate_loading_orders(raw_dfs["05_loading_orders.csv"])
        valid_gate_df = validator.validate_gate_events(raw_dfs["06_gate_events.csv"])
        valid_val_df = validator.validate_validation_events(raw_dfs["07_validation_events.csv"])
        valid_staging_df = validator.validate_staging_events(raw_dfs["08_staging_events.csv"])
        valid_loading_df = validator.validate_loading_events(raw_dfs["09_loading_events.csv"])

        valid_eq_df = validator.validate_equipment_events(raw_dfs["11_equipment_events.csv"])
        valid_readiness_df = validator.validate_product_readiness(raw_dfs["12_product_readiness_events.csv"])
        valid_signals_df = validator.validate_arrival_signals(raw_dfs["13_arrival_signals.csv"])
        valid_notifs_df = validator.validate_notifications(raw_dfs["14_notifications.csv"])
        valid_risks_df = validator.validate_risk_events(raw_dfs["15_risk_events.csv"])

        valid_decisions_df = validator.validate_decisions(raw_dfs["16_decisions.csv"])
        valid_stages_df = validator.validate_decision_stages(raw_dfs["17_decision_stages.csv"])
        valid_actions_df = validator.validate_autonomous_actions(raw_dfs["18_autonomous_actions.csv"])
        valid_verifs_df = validator.validate_verification_events(raw_dfs["19_verification_events.csv"])
        valid_audits_df = validator.validate_audit_events(raw_dfs["20_audit_events.csv"])

        total_quarantined = qm.get_count()
        logger.info("Validation finished. Quarantined records isolated: %d", total_quarantined)

        # 6. Clean & Transform Valid Records
        logger.info("Transforming and cleaning validated records...")
        clean_depots = DataCleaner.clean_dataframe(valid_depots_df)
        clean_omcs = DataCleaner.clean_dataframe(valid_omcs_df)
        clean_products = DataCleaner.clean_dataframe(valid_products_df, bool_cols=["is_hazardous_priority"])
        clean_trucks = DataCleaner.clean_dataframe(valid_trucks_df)
        clean_positions = DataCleaner.clean_dataframe(valid_positions_df, bool_cols=["has_dual_arm", "is_high_velocity"])

        clean_orders = DataCleaner.clean_dataframe(
            valid_orders_df,
            datetime_cols=["order_registered_time", "expected_arrival_time", "scheduled_window_start", "scheduled_window_end"]
        )
        clean_gate = DataCleaner.clean_dataframe(valid_gate_df, datetime_cols=["event_timestamp"])
        clean_val = DataCleaner.clean_dataframe(
            valid_val_df,
            datetime_cols=["validation_start", "validation_end"],
            bool_cols=["electronic_manifest_matched"]
        )
        clean_staging = DataCleaner.clean_dataframe(valid_staging_df, datetime_cols=["queue_entry_time", "queue_exit_time"])
        clean_loading = DataCleaner.clean_dataframe(
            valid_loading_df,
            datetime_cols=["loading_start", "loading_end"],
            bool_cols=["dual_arm_used"]
        )

        clean_eq = DataCleaner.clean_dataframe(valid_eq_df, datetime_cols=["event_timestamp", "resolved_timestamp"])
        clean_readiness = DataCleaner.clean_dataframe(valid_readiness_df, datetime_cols=["event_timestamp", "resolved_timestamp"])
        clean_signals = DataCleaner.clean_dataframe(
            valid_signals_df,
            datetime_cols=["signal_timestamp", "predicted_arrival_window_start", "predicted_arrival_window_end"]
        )
        clean_notifs = DataCleaner.clean_dataframe(
            valid_notifs_df,
            datetime_cols=["timestamp", "acknowledged_at"],
            bool_cols=["requires_acknowledgement", "is_acknowledged"]
        )
        clean_risks = DataCleaner.clean_dataframe(valid_risks_df, datetime_cols=["detected_at"])

        clean_decisions = DataCleaner.clean_dataframe(valid_decisions_df, datetime_cols=["decision_timestamp"])
        clean_stages = DataCleaner.clean_dataframe(valid_stages_df, datetime_cols=["stage_timestamp"])
        clean_actions = DataCleaner.clean_dataframe(valid_actions_df, datetime_cols=["dispatched_at"])
        clean_verifs = DataCleaner.clean_dataframe(valid_verifs_df, datetime_cols=["verified_at"])
        clean_audits = DataCleaner.clean_dataframe(valid_audits_df, datetime_cols=["audit_timestamp"])

        # 7. Truncate Canonical Tables for Idempotent Reloading
        loader.truncate_canonical_tables()

        # 8. Bulk Load in Strict Topological Dependency Order
        logger.info("Loading validated entities into PostgreSQL...")
        load_summary: Dict[str, int] = {}
        load_summary["depots"] = loader.bulk_load("depots", Depot, clean_depots)
        load_summary["omcs"] = loader.bulk_load("omcs", OMC, clean_omcs)
        load_summary["products"] = loader.bulk_load("products", Product, clean_products)
        load_summary["trucks"] = loader.bulk_load("trucks", Truck, clean_trucks)
        load_summary["loading_positions"] = loader.bulk_load("loading_positions", LoadingPosition, clean_positions)

        load_summary["loading_orders"] = loader.bulk_load("loading_orders", LoadingOrder, clean_orders)
        load_summary["gate_events"] = loader.bulk_load("gate_events", GateEvent, clean_gate)
        load_summary["validation_events"] = loader.bulk_load("validation_events", ValidationEvent, clean_val)
        load_summary["staging_events"] = loader.bulk_load("staging_events", StagingEvent, clean_staging)
        load_summary["loading_events"] = loader.bulk_load("loading_events", LoadingEvent, clean_loading)

        load_summary["equipment_events"] = loader.bulk_load("equipment_events", EquipmentEvent, clean_eq)
        load_summary["product_readiness_events"] = loader.bulk_load("product_readiness_events", ProductReadinessEvent, clean_readiness)
        load_summary["arrival_signals"] = loader.bulk_load("arrival_signals", ArrivalSignal, clean_signals)
        load_summary["notifications"] = loader.bulk_load("notifications", Notification, clean_notifs)
        load_summary["risk_events"] = loader.bulk_load("risk_events", RiskEvent, clean_risks)

        load_summary["decisions"] = loader.bulk_load("decisions", Decision, clean_decisions)
        load_summary["decision_stages"] = loader.bulk_load("decision_stages", DecisionStage, clean_stages)
        load_summary["autonomous_actions"] = loader.bulk_load("autonomous_actions", AutonomousAction, clean_actions)
        load_summary["verification_events"] = loader.bulk_load("verification_events", VerificationEvent, clean_verifs)
        load_summary["audit_events"] = loader.bulk_load("audit_events", AuditEvent, clean_audits)

        session.commit()
        total_rows_loaded = sum(load_summary.values())
        logger.info("Successfully loaded %d records into PostgreSQL across 20 canonical tables.", total_rows_loaded)

        # 9. Persist Quarantine Records to Disk and PostgreSQL
        qm.persist_to_disk()
        qm.persist_to_db(session)
        session.commit()
        logger.info("Persisted %d quarantined items to disk and quarantine_records table.", total_quarantined)

        # 10. Record Run Completion
        duration_sec = (datetime.utcnow() - start_time).total_seconds()
        run_summary_text = (
            f"ETL run {run_id} completed successfully in {duration_sec:.2f}s. "
            f"Read: {total_rows_read}, Loaded: {total_rows_loaded}, Quarantined: {total_quarantined}."
        )
        loader.record_run_completion(
            rows_loaded=total_rows_loaded,
            rows_quarantined=total_quarantined,
            error_count=total_quarantined,
            status="SUCCESS",
            summary=run_summary_text,
        )

        # 11. Write Run Reports
        run_report = {
            "run_id": run_id,
            "status": "SUCCESS",
            "start_time": start_time.isoformat(),
            "end_time": datetime.utcnow().isoformat(),
            "duration_seconds": round(duration_sec, 2),
            "rows_read": total_rows_read,
            "rows_loaded": total_rows_loaded,
            "rows_quarantined": total_quarantined,
            "table_load_counts": load_summary,
            "great_expectations_summary": {
                "total_expectations": ge_results["total_expectations"],
                "passed": ge_results["passed_expectations"],
                "flagged": ge_results["failed_expectations"],
            },
        }
        with open(reports_dir / "etl_run_report.json", "w") as f:
            json.dump(run_report, f, indent=2)

        # Write markdown summary
        md_report = f"""# FlowGuard ETL Execution Report

- **Run ID**: `{run_id}`
- **Status**: `SUCCESS`
- **Execution Date**: `{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}`
- **Duration**: `{duration_sec:.2f} seconds`
- **Rows Read from Source**: `{total_rows_read:,}`
- **Rows Ingested into PostgreSQL**: `{total_rows_loaded:,}`
- **Rows Quarantined**: `{total_quarantined:,}`
- **Dataset Ingestion Quality Rate**: `{(total_rows_loaded / total_rows_read * 100):.2f}%`

## Table Ingestion Breakdown

| Table | Loaded Records | Status |
|:---|---:|:---|
"""
        for tbl, count in load_summary.items():
            md_report += f"| `{tbl}` | {count:,} | OK |\n"

        with open(reports_dir / "etl_run_report.md", "w") as f:
            f.write(md_report)

        logger.info("================================================================================")
        logger.info("ETL RUN COMPLETE: %s", run_summary_text)
        logger.info("================================================================================")
        return 0

    except Exception as e:
        logger.exception("ETL pipeline failed with error: %s", str(e))
        session.rollback()
        loader.record_run_completion(
            rows_loaded=0,
            rows_quarantined=0,
            error_count=1,
            status="FAILED",
            summary=f"ETL pipeline crashed: {str(e)}",
        )
        return 1
    finally:
        session.close()


if __name__ == "__main__":
    sys.exit(run_pipeline())
