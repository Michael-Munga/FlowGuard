"""Tests for SQLAlchemy database models, constraints, and index definitions."""

from sqlalchemy import inspect
from backend.app.db.models import (
    Base,
    Depot,
    OMC,
    Product,
    Truck,
    LoadingPosition,
    LoadingOrder,
    GateEvent,
    RiskEvent,
    Decision,
    DecisionStage,
    AutonomousAction,
    VerificationEvent,
    AuditEvent,
    ETLRun,
    QuarantineRecord,
)


def test_metadata_tables_count():
    """Verify all 25 tables (22 core + 3 operational projection) are defined in declarative metadata."""
    assert len(Base.metadata.tables) == 25


def test_loading_orders_foreign_keys():
    """Verify loading_orders table has required foreign keys."""
    table = Base.metadata.tables["loading_orders"]
    fk_targets = {fk.target_fullname for fk in table.foreign_keys}

    assert "depots.depot_id" in fk_targets
    assert "omcs.omc_id" in fk_targets
    assert "products.product_id" in fk_targets
    assert "trucks.truck_id" in fk_targets


def test_loading_orders_indexes():
    """Verify loading_orders has composite and partial indexes configured."""
    table = Base.metadata.tables["loading_orders"]
    index_names = {idx.name for idx in table.indexes}

    assert "ix_orders_depot_status" in index_names
    assert "ix_orders_omc_status" in index_names
    assert "ix_orders_depot_registered" in index_names
    assert "ix_orders_truck_registered" in index_names
    assert "ix_orders_active_depot" in index_names


def test_risk_events_indexes():
    """Verify risk_events has composite and partial index configured."""
    table = Base.metadata.tables["risk_events"]
    index_names = {idx.name for idx in table.indexes}

    assert "ix_risk_events_depot_status_time" in index_names
    assert "ix_active_risks_partial" in index_names


def test_decision_stages_indexes():
    """Verify decision_stages has composite sequence index."""
    table = Base.metadata.tables["decision_stages"]
    index_names = {idx.name for idx in table.indexes}

    assert "ix_decision_stages_decision_seq" in index_names
