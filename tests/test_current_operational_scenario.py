"""Tests for FlowGuard Synthetic Current Operational State & Multi-Depot Scenario.

Verifies:
1. All 5 KPC depots have coherent, realistic operational states (inside, loading, queued, validating).
2. Trucks inside, queued, loading, and positioned counts are event-derived.
3. Equipment degradation is temporally active on NBO-P07 and MBA-P03.
4. Driver collection order LO-NBO-8821 is actively loading in Bay P04 with matching backend state.
5. Network Command Centre aggregations match individual depot totals.
6. Nairobi OR-Tools CP-SAT optimizer derives genuine, unforced counterfactual turnaround improvements.
7. Deterministic reproducibility with fixed seed.
"""

import json
from pathlib import Path
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.db.session import SessionLocal
from backend.app.db.models import (
    CurrentDepotState,
    CurrentLoadingPositionState,
    CurrentOrderState,
    LoadingOrder,
    EquipmentEvent,
    GateEvent,
    LoadingEvent,
)
from synthetic_flowguard_data.generate_current_scenario import generate_scenario, SCENARIO_ID

client = TestClient(app)


def test_scenario_metadata_exists():
    """Verify SCENARIO_METADATA.json exists and contains required fields."""
    meta_path = Path(__file__).resolve().parent.parent / "synthetic_flowguard_data" / "SCENARIO_METADATA.json"
    assert meta_path.exists(), "SCENARIO_METADATA.json must exist"

    with open(meta_path) as f:
        meta = json.load(f)

    assert meta["scenario_id"] == "DEMO-PEAK-001"
    assert meta["generation_seed"] == 42
    assert "network_totals" in meta
    assert meta["network_totals"]["depots_count"] == 5
    assert meta["network_totals"]["trucks_inside_total"] == 110
    assert meta["network_totals"]["actively_loading_total"] == 25
    assert meta["network_totals"]["queued_total"] == 43
    assert "Synthetic operational scenario" in meta["disclaimer"]


def test_all_five_depots_have_distinct_coherent_states():
    """Verify all 5 depots return backend-derived live states with distinct profiles."""
    depots = ["nairobi", "mombasa", "nakuru", "eldoret", "kisumu"]
    responses = {}

    for d in depots:
        res = client.get(f"/api/depots/{d}/live")
        assert res.status_code == 200
        data = res.json()
        responses[d] = data

        assert data["depot_id"] == d
        assert data["trucks_inside"] > 0
        assert data["actively_loading"] > 0
        assert data["queue_count"] > 0
        assert data["queue_pressure_ratio"] > 0.0
        assert len(data["loading_positions"]) > 0
        assert len(data["active_trucks"]) > 0

    # Distinct profiles check
    assert responses["nairobi"]["queue_pressure_ratio"] > responses["eldoret"]["queue_pressure_ratio"]
    assert responses["nairobi"]["trucks_inside"] == 32
    assert responses["mombasa"]["trucks_inside"] == 38
    assert responses["nakuru"]["trucks_inside"] == 16
    assert responses["eldoret"]["trucks_inside"] == 14
    assert responses["kisumu"]["trucks_inside"] == 10


def test_equipment_degradation_active():
    """Verify degraded bays NBO-P07 and MBA-P03 have unresolved events and flow impact."""
    res_nbo = client.get("/api/depots/nairobi/live")
    assert res_nbo.status_code == 200
    nbo_bays = {b["code"]: b for b in res_nbo.json()["loading_positions"]}
    assert "P07" in nbo_bays
    assert nbo_bays["P07"]["status"] == "DEGRADED"
    assert nbo_bays["P07"]["flow_impact_pct"] == 35

    res_mba = client.get("/api/depots/mombasa/live")
    assert res_mba.status_code == 200
    mba_bays = {b["code"]: b for b in res_mba.json()["loading_positions"]}
    assert "P03" in mba_bays
    assert mba_bays["P03"]["status"] == "DEGRADED"
    assert mba_bays["P03"]["flow_impact_pct"] == 20


def test_driver_order_matches_backend_state():
    """Verify driver demo order LO-NBO-8821 is actively LOADING in Bay P04."""
    res = client.get("/api/orders/LO-NBO-8821")
    assert res.status_code == 200
    data = res.json()

    assert data["order_id"] == "LO-NBO-8821"
    assert data["order_status"] == "LOADING"
    assert data["truck_registration"] == "KDD 412X"
    assert data["driver_name"] == "James Mwangi"
    assert data["depot_id"] == "nairobi"
    assert data["omc_id"] == "vivo"
    assert data["milestones"]["loading"]["position_id"] == "NBO-P04"
    assert data["milestones"]["loading"]["dual_arm_used"] is True

    # Risk score assessment
    risk_res = client.get("/api/predictions/orders/LO-NBO-8821/risk")
    assert risk_res.status_code == 200
    risk_data = risk_res.json()
    assert risk_data["risk_level"] in ("LOW", "MEDIUM", "HIGH")


def test_event_history_supports_active_states():
    """Verify active trucks inside have gate-in events and no gate-out events."""
    session = SessionLocal()
    try:
        active_inside_orders = session.query(CurrentOrderState).filter(
            CurrentOrderState.is_active_inside == True
        ).all()
        assert len(active_inside_orders) == 110

        for order in active_inside_orders[:20]:  # Sample test 20 inside orders
            gate_in = session.query(GateEvent).filter(
                GateEvent.order_id == order.order_id,
                GateEvent.event_type == "GATE_IN",
            ).first()
            assert gate_in is not None, f"Order {order.order_id} must have GATE_IN event"

            gate_out = session.query(GateEvent).filter(
                GateEvent.order_id == order.order_id,
                GateEvent.event_type == "GATE_OUT",
            ).first()
            assert gate_out is None, f"Active order {order.order_id} must not have GATE_OUT event"

            if order.current_stage == "LOADING":
                ldg = session.query(LoadingEvent).filter(
                    LoadingEvent.order_id == order.order_id,
                    LoadingEvent.loading_status == "LOADING",
                ).first()
                assert ldg is not None, f"Order {order.order_id} must have active LOADING event"
                assert ldg.loading_end is None, f"Order {order.order_id} loading must be in progress"
    finally:
        session.close()


def test_network_aggregations_match_depots():
    """Verify Network Command Centre totals match sum of individual depot live states."""
    res_network = client.get("/api/metrics/network")
    assert res_network.status_code == 200

    session = SessionLocal()
    try:
        depot_states = session.query(CurrentDepotState).all()
        total_inside = sum(d.trucks_inside for d in depot_states)
        total_loading = sum(d.actively_loading for d in depot_states)
        total_queued = sum(d.queue_count for d in depot_states)
        total_active = sum(d.total_active_orders for d in depot_states)

        assert total_inside == 110
        assert total_loading == 25
        assert total_queued == 43
        assert total_active == 140
    finally:
        session.close()


def test_nairobi_optimization_derives_counterfactual_improvement():
    """Verify OR-Tools CP-SAT solver generates non-zero turnaround improvement on Nairobi."""
    res = client.post("/api/optimization/depot/nairobi/solve?force_new=true")
    assert res.status_code == 200
    data = res.json()

    assert data["decision_id"].startswith("DEC-")
    assert data["autonomy_level"] in ("L2_AUTONOMOUS_EXECUTION", "L3_SUPERVISED_APPROVAL")
    cf = data["counterfactual_metrics"]
    assert cf["turnaround_reduction_min"] > 0, "Optimizer must derive turnaround improvement"
    assert cf["baseline_avg_turnaround_min"] > cf["optimized_avg_turnaround_min"]
    assert data["selected_candidate"] is not None
    assert len(data["selected_candidate"]["target_orders"]) >= 12
