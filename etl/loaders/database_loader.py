"""Topological database loader executing idempotent ingestion into PostgreSQL."""

from datetime import datetime
from typing import Dict, List, Any, Type, Tuple
import logging
from sqlalchemy import text
from sqlalchemy.orm import Session
from backend.app.db.models import (
    Base,
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
    ETLRun,
)

logger = logging.getLogger("flowguard.etl.loader")

# Order of deletion (reverse topological dependency)
REVERSE_DEPENDENCY_TABLES = [
    "audit_events",
    "verification_events",
    "autonomous_actions",
    "decision_stages",
    "decisions",
    "risk_events",
    "notifications",
    "arrival_signals",
    "product_readiness_events",
    "equipment_events",
    "loading_events",
    "staging_events",
    "validation_events",
    "gate_events",
    "loading_orders",
    "loading_positions",
    "trucks",
    "products",
    "omcs",
    "depots",
]

# Forward topological dependency models
MODEL_ORDER: List[Tuple[str, Type[Base]]] = [
    ("depots", Depot),
    ("omcs", OMC),
    ("products", Product),
    ("trucks", Truck),
    ("loading_positions", LoadingPosition),
    ("loading_orders", LoadingOrder),
    ("gate_events", GateEvent),
    ("validation_events", ValidationEvent),
    ("staging_events", StagingEvent),
    ("loading_events", LoadingEvent),
    ("equipment_events", EquipmentEvent),
    ("product_readiness_events", ProductReadinessEvent),
    ("arrival_signals", ArrivalSignal),
    ("notifications", Notification),
    ("risk_events", RiskEvent),
    ("decisions", Decision),
    ("decision_stages", DecisionStage),
    ("autonomous_actions", AutonomousAction),
    ("verification_events", VerificationEvent),
    ("audit_events", AuditEvent),
]


class DatabaseLoader:
    """Handles bulk idempotent ingestion into PostgreSQL."""

    def __init__(self, session: Session, run_id: str):
        self.session = session
        self.run_id = run_id

    def truncate_canonical_tables(self):
        """Truncate all operational tables in reverse dependency order for idempotent reloading."""
        logger.info("Truncating operational tables for idempotent reload...")
        for table_name in REVERSE_DEPENDENCY_TABLES:
            self.session.execute(text(f"TRUNCATE TABLE {table_name} CASCADE;"))
        self.session.commit()

    def bulk_load(self, table_key: str, model_cls: Type[Base], records: List[Dict[str, Any]]) -> int:
        """Bulk insert records for a given model mapping with audit provenance."""
        if not records:
            return 0

        now = datetime.utcnow()
        for r in records:
            r["etl_run_id"] = self.run_id
            r["ingested_at"] = now

        # Use bulk_insert_mappings for high-throughput batch insertion
        self.session.bulk_insert_mappings(model_cls, records)
        self.session.flush()
        return len(records)

    def record_run_start(self, source_version: str, rows_read: int) -> ETLRun:
        """Create the initial etl_runs record."""
        run = ETLRun(
            run_id=self.run_id,
            start_time=datetime.utcnow(),
            status="RUNNING",
            source_version=source_version,
            rows_read=rows_read,
            rows_loaded=0,
            rows_quarantined=0,
            error_count=0,
            summary="ETL execution in progress",
        )
        self.session.add(run)
        self.session.commit()
        return run

    def record_run_completion(
        self,
        rows_loaded: int,
        rows_quarantined: int,
        error_count: int,
        status: str,
        summary: str,
    ):
        """Update etl_runs record upon pipeline termination."""
        run = self.session.query(ETLRun).filter(ETLRun.run_id == self.run_id).first()
        if run:
            run.end_time = datetime.utcnow()
            run.status = status
            run.rows_loaded = rows_loaded
            run.rows_quarantined = rows_quarantined
            run.error_count = error_count
            run.summary = summary
            self.session.commit()
