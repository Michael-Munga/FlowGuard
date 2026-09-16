"""Tests for ETL execution, idempotency, and run tracking in PostgreSQL."""

from sqlalchemy import select, func
from sqlalchemy.orm import Session
from backend.app.db.models import (
    Depot,
    LoadingOrder,
    GateEvent,
    Decision,
    ETLRun,
    QuarantineRecord,
)


def test_etl_run_logged(db_session: Session):
    """Verify ETL execution was recorded in etl_runs table."""
    stmt = select(ETLRun).order_by(ETLRun.start_time.desc())
    latest_run = db_session.scalars(stmt).first()

    assert latest_run is not None
    assert latest_run.status == "SUCCESS"
    assert latest_run.rows_read > 80000
    assert latest_run.rows_loaded > 80000
    assert latest_run.rows_quarantined > 0


def test_quarantine_records_stored(db_session: Session):
    """Verify quarantine records are queryable in PostgreSQL."""
    stmt = select(func.count()).select_from(QuarantineRecord)
    count = db_session.scalar(stmt)
    assert count is not None and count > 0


def test_primary_demo_records_exist(db_session: Session):
    """Verify primary Nairobi demo order LO-NBO-8821 and DEC-0142 are present."""
    order = db_session.get(LoadingOrder, "LO-NBO-8821")
    assert order is not None
    assert order.depot_id == "nairobi"
    assert order.omc_id == "vivo"
    assert order.product_id == "AGO"
    assert float(order.ordered_quantity_litres) == 36000.0

    decision = db_session.get(Decision, "DEC-0142")
    assert decision is not None
    assert decision.depot_id == "nairobi"
    assert decision.autonomy_level == "L2_AUTO_EXECUTABLE"
    assert decision.decision_status == "EXECUTED"
