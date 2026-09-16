"""Tests for repository query layer: live state, pagination, and relational traversals."""

import pytest
from sqlalchemy.orm import Session
from backend.app.repositories import (
    DepotRepository,
    OrderRepository,
    FleetRepository,
    RiskRepository,
    DecisionRepository,
    MetricsRepository,
)


def test_depot_repository_live_state(db_session: Session):
    """Verify depot live state calculation."""
    repo = DepotRepository(db_session)
    live_state = repo.get_depot_live_state("nairobi")

    assert live_state is not None
    assert live_state["depot_id"] == "nairobi"
    assert live_state["total_positions"] > 0
    assert "queue_count" in live_state
    assert "bay_utilization_pct" in live_state


def test_order_repository_lifecycle_trace(db_session: Session):
    """Verify order repository fetches full milestone event lifecycle for LO-NBO-8821."""
    repo = OrderRepository(db_session)
    order_detail = repo.get_order_with_lifecycle("LO-NBO-8821")

    assert order_detail is not None
    assert order_detail["order_id"] == "LO-NBO-8821"
    assert order_detail["omc_id"] == "vivo"
    assert order_detail["depot_id"] == "nairobi"
    assert "milestones" in order_detail

    # Check milestone components
    milestones = order_detail["milestones"]
    assert len(milestones["gate_events"]) > 0
    assert milestones["validation"] is not None
    assert milestones["validation"]["outcome"] == "APPROVED"
    assert milestones["loading"] is not None
    assert milestones["loading"]["actual_litres"] == 36000.0


def test_order_repository_pagination(db_session: Session):
    """Verify order repository enforces bounded pagination."""
    repo = OrderRepository(db_session)
    orders_p1 = repo.list_depot_orders("nairobi", limit=10, offset=0)
    orders_p2 = repo.list_depot_orders("nairobi", limit=10, offset=10)

    assert len(orders_p1) == 10
    assert len(orders_p2) == 10
    assert orders_p1[0].order_id != orders_p2[0].order_id


def test_fleet_repository_registration_lookup(db_session: Session):
    """Verify fleet truck lookup by Kenyan plate registration."""
    repo = FleetRepository(db_session)
    truck = repo.get_by_registration("KDD 412X")

    assert truck is not None
    assert truck.truck_id == "TRK-0001"
    assert truck.driver_name == "James Mwangi"


def test_decision_repository_full_trace(db_session: Session):
    """Verify autonomous decision full trace includes all 8 stages and audit hash."""
    repo = DecisionRepository(db_session)
    trace = repo.get_decision_full_trace("DEC-0142")

    assert trace is not None
    assert trace["decision_id"] == "DEC-0142"
    assert trace["autonomy_level"] == "L2_AUTO_EXECUTABLE"
    assert len(trace["stages"]) == 8

    stage_names = [s["stage_name"] for s in trace["stages"]]
    assert stage_names == ["SIGNAL", "PREDICT", "DIAGNOSE", "OPTIMIZE", "DECIDE", "EXECUTE", "VERIFY", "LOG"]

    assert trace["verification"] is not None
    assert trace["verification"]["observed_reduction_min"] == 34
    assert trace["audit"] is not None
    assert len(trace["audit"]["audit_reference_sha256"]) == 64


def test_metrics_repository_network_kpis(db_session: Session):
    """Verify metrics repository calculates network KPIs in SQL without errors."""
    repo = MetricsRepository(db_session)
    kpis = repo.get_network_kpis()

    assert "total_throughput_m3" in kpis
    assert kpis["total_throughput_m3"] > 0
    assert "total_orders" in kpis
    assert kpis["total_orders"] > 10000
    assert "total_realized_savings_kes" in kpis
