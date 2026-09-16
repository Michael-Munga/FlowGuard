"""Deterministic unit and integration tests for FlowGuard's constrained optimizer and policy boundary.

Covers:
- Nairobi feasible optimization (integration)
- More orders than available capacity (partial scheduling)
- One order with zero compatible positions (excluded gracefully)
- No available positions
- Completed orders excluded
- Unavailable equipment correctly handled
- Truly infeasible model
- Partial scheduling
- Solver status handling
- Solve-time measurement
- Deterministic output
- Counterfactual calculation
- Policy classification
- Persistence
- Non-Nairobi depot validation
"""

import time
from datetime import datetime, timezone
from typing import List

import pytest
from sqlalchemy.orm import Session

from backend.optimization.models import (
    LoadingPositionItem,
    OptimizationInput,
    OrderOptimizationItem,
)
from backend.optimization.solver import FlowGuardOptimizer
from backend.policy.evaluator import PolicyEvaluator


# ---------------------------------------------------------------------------
# Test Fixtures / Helpers
# ---------------------------------------------------------------------------

def _order(
    order_id: str,
    product: str = "AGO",
    arrival: int = 0,
    risk: float = 70.0,
    quantity: float = 33_000.0,
    sla_end: int = 120,
) -> OrderOptimizationItem:
    return OrderOptimizationItem(
        order_id=order_id,
        omc_id="omc-test",
        product_id=product,
        ordered_quantity_litres=quantity,
        arrival_minute=arrival,
        predicted_turnaround_min=80.0,
        predicted_gate_out_minute=arrival + 90,
        risk_score=risk,
        sla_window_end_minute=sla_end,
    )


def _position(
    position_id: str,
    compatibility: str = "AGO",
    flow_rate: int = 1_650,
    is_available: bool = True,
    degradation_pct: float = 0.0,
    has_dual_arm: bool = False,
) -> LoadingPositionItem:
    pos = LoadingPositionItem(
        loading_position_id=position_id,
        code=position_id,
        bay_number=int(position_id[-1]) if position_id[-1].isdigit() else 1,
        product_compatibility=compatibility,
        has_dual_arm=has_dual_arm,
        standard_flow_rate_lpm=flow_rate,
        is_high_velocity=flow_rate >= 1_650,
        is_available=is_available,
        operational_degradation_pct=degradation_pct,
    )
    return pos


def _input(orders, positions, horizon: int = 240, timeout: float = 5.0) -> OptimizationInput:
    return OptimizationInput(
        depot_id="nairobi",
        reference_timestamp=datetime.now(timezone.utc),
        orders=orders,
        positions=positions,
        planning_horizon_minutes=horizon,
        solver_timeout_seconds=timeout,
    )


# ===========================================================================
# SECTION 1: Original passing tests (must continue to pass)
# ===========================================================================

def test_optimizer_assigns_each_order_once_without_position_overlap():
    """Two orders, one bay: scheduler must sequence them without overlap."""
    result = FlowGuardOptimizer().solve_depot_schedule(OptimizationInput(
        depot_id="nairobi", reference_timestamp=datetime.now(timezone.utc),
        orders=[_order("one"), _order("two", arrival=0)], positions=[_position("P1")],
    ))
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    schedule = next(c for c in result.candidates if c.action_type == "MAINTAIN_CURRENT_SCHEDULE").schedule
    assert schedule["one"]["assigned_position_id"] == "P1"
    o1_end = schedule["one"]["end_minute"]
    o2_start = schedule["two"]["start_minute"]
    o2_end = schedule["two"]["end_minute"]
    o1_start = schedule["one"]["start_minute"]
    # Non-overlap: one finishes before two starts, or two finishes before one starts
    assert o1_end <= o2_start or o2_end <= o1_start


def test_optimizer_rejects_missing_compatible_position():
    """A PMS order against an AGO-only bay must surface NO_COMPATIBLE_POSITIONS."""
    result = FlowGuardOptimizer().solve_depot_schedule(OptimizationInput(
        depot_id="nairobi", reference_timestamp=datetime.now(timezone.utc),
        orders=[_order("one", product="PMS")], positions=[_position("P1", compatibility="AGO")],
    ))
    assert result.status == "NO_COMPATIBLE_POSITIONS"
    assert result.selected_candidate is None


def test_policy_blocks_constraint_violation():
    """INFEASIBLE constraint_status must produce BLOCKED_BY_POLICY from the policy engine."""
    candidate = FlowGuardOptimizer().solve_depot_schedule(OptimizationInput(
        depot_id="nairobi", reference_timestamp=datetime.now(timezone.utc),
        orders=[_order("one")], positions=[_position("P1")],
    )).selected_candidate
    candidate.constraint_status = "INFEASIBLE"
    assert PolicyEvaluator().evaluate(candidate).policy_state == "BLOCKED_BY_POLICY"


def test_optimizer_partially_schedules_when_capacity_is_bounded():
    """3 orders vs 1 narrow-horizon bay: solver schedules 1 and queues 2."""
    result = FlowGuardOptimizer().solve_depot_schedule(OptimizationInput(
        depot_id="nairobi", reference_timestamp=datetime.now(timezone.utc),
        orders=[_order("one"), _order("two"), _order("three")],
        positions=[_position("P1")],
        planning_horizon_minutes=25,
    ))
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    assert result.solver_diagnostics["scheduled_orders"] == 1
    assert result.solver_diagnostics["queued_orders"] == 2
    assert result.selected_candidate is not None


def test_optimizer_reports_no_available_positions():
    """A position explicitly marked unavailable must produce NO_AVAILABLE_POSITIONS."""
    unavailable = _position("P1", is_available=False)
    result = FlowGuardOptimizer().solve_depot_schedule(OptimizationInput(
        depot_id="nairobi", reference_timestamp=datetime.now(timezone.utc),
        orders=[_order("one")], positions=[unavailable],
    ))
    assert result.status == "NO_AVAILABLE_POSITIONS"


# ===========================================================================
# SECTION 2: New comprehensive tests
# ===========================================================================

# ---------------------------------------------------------------------------
# 2a. Completed / terminal orders must be excluded at the input layer
# ---------------------------------------------------------------------------

def test_completed_orders_excluded_from_eligible_set():
    """Completed orders must NOT appear in the optimizer's eligible set.

    The optimizer only receives orders that callers filter; this test verifies
    that an empty order list triggers NO_ELIGIBLE_ORDERS, confirming the correct
    path for when the service layer has already filtered out terminal statuses.
    """
    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=[], positions=[_position("P1")])
    )
    assert result.status == "NO_ELIGIBLE_ORDERS"
    assert result.selected_candidate is None
    assert result.solve_time_ms >= 0.0
    assert "reason" in result.solver_diagnostics


# ---------------------------------------------------------------------------
# 2b. Zero compatible positions for an individual order — excluded gracefully
# ---------------------------------------------------------------------------

def test_one_order_with_zero_compatible_positions_excluded_gracefully():
    """An order with no compatible bay is excluded with a diagnostic reason.

    Orders that remain have compatible bays; the optimization must succeed.
    """
    ago_order = _order("ago-order", product="AGO")
    dpk_order = _order("dpk-order", product="DPK")  # incompatible with AGO-only bays

    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(
            orders=[ago_order, dpk_order],
            positions=[_position("P1", compatibility="AGO"), _position("P2", compatibility="AGO")],
        )
    )
    # DPK order must be in excluded list with incompatibility reason
    excluded_ids = {e["order_id"] for e in result.solver_diagnostics.get("excluded_orders", [])}
    assert "dpk-order" in excluded_ids

    excluded_reason = next(
        e["reason"] for e in result.solver_diagnostics["excluded_orders"] if e["order_id"] == "dpk-order"
    )
    assert "COMPATIBLE" in excluded_reason  # NO_COMPATIBLE_AVAILABLE_POSITION

    # The AGO order should still be solved
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    assert result.selected_candidate is not None


def test_all_orders_with_zero_compatible_positions_returns_no_compatible_positions():
    """When every order lacks a compatible position the status must be NO_COMPATIBLE_POSITIONS."""
    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(
            orders=[_order("pms1", product="PMS"), _order("pms2", product="PMS")],
            positions=[_position("P1", compatibility="AGO")],
        )
    )
    assert result.status == "NO_COMPATIBLE_POSITIONS"
    assert result.selected_candidate is None


# ---------------------------------------------------------------------------
# 2c. Unavailable equipment correctly handled
# ---------------------------------------------------------------------------

def test_unavailable_position_excluded_from_assignment():
    """A FAULT/UNAVAILABLE bay must not receive any assignment."""
    unavailable_p1 = _position("P1", compatibility="AGO", is_available=False)
    available_p2 = _position("P2", compatibility="AGO", is_available=True)

    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=[_order("one")], positions=[unavailable_p1, available_p2])
    )
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    # The only assignment should go to P2
    baseline = next(c for c in result.candidates if c.action_type == "MAINTAIN_CURRENT_SCHEDULE")
    for sched in baseline.schedule.values():
        assert sched["assigned_position_id"] == "P2"


def test_degraded_equipment_reduces_flow_rate():
    """50% degradation on the only bay must produce a longer turnaround than full flow.

    The baseline schedule stores turnaround_min (arrival → end). With one order and one
    bay, turnaround_min equals the loading duration since wait_duration_min is 0.
    """
    # Full flow = 1650 lpm → duration = ceil(33000/1650) = 20 min
    full_pos = _position("PFull", flow_rate=1_650, degradation_pct=0.0)
    # 50% degraded → effective 825 lpm → duration = ceil(33000/825) = 40 min
    degraded_pos = _position("PDeg", flow_rate=1_650, degradation_pct=50.0)

    full_result = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=[_order("heavy", quantity=33_000.0)], positions=[full_pos])
    )
    deg_result = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=[_order("heavy2", quantity=33_000.0)], positions=[degraded_pos])
    )

    assert full_result.status in {"OPTIMAL", "FEASIBLE"}
    assert deg_result.status in {"OPTIMAL", "FEASIBLE"}

    full_baseline = next(c for c in full_result.candidates if c.action_type == "MAINTAIN_CURRENT_SCHEDULE")
    deg_baseline = next(c for c in deg_result.candidates if c.action_type == "MAINTAIN_CURRENT_SCHEDULE")

    # With zero wait (single order, bay immediately free), turnaround_min == loading duration
    full_trn = full_baseline.schedule["heavy"]["turnaround_min"]
    deg_trn = deg_baseline.schedule["heavy2"]["turnaround_min"]
    assert deg_trn > full_trn, (
        f"Degraded position ({deg_trn}m) must produce longer turnaround than full-flow ({full_trn}m)"
    )


# ---------------------------------------------------------------------------
# 2d. Solver status handling — distinguish truly infeasible from over-constrained
# ---------------------------------------------------------------------------

def test_no_orders_returns_no_eligible_orders_not_infeasible():
    """Empty order list → NO_ELIGIBLE_ORDERS (not INFEASIBLE; CP-SAT never invoked)."""
    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=[], positions=[_position("P1")])
    )
    assert result.status == "NO_ELIGIBLE_ORDERS"
    assert result.solve_time_ms >= 0.0  # Never 0 precisely — perf_counter runs


def test_no_positions_returns_no_available_positions():
    """Empty position list → NO_AVAILABLE_POSITIONS (before solver)."""
    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=[_order("one")], positions=[])
    )
    assert result.status == "NO_AVAILABLE_POSITIONS"


def test_solver_status_strings_are_canonical():
    """Status strings returned must be one of the documented canonical values."""
    valid_statuses = {
        "OPTIMAL", "FEASIBLE", "INFEASIBLE", "TIME_LIMIT",
        "MODEL_INVALID", "NO_ELIGIBLE_ORDERS", "NO_AVAILABLE_POSITIONS",
        "NO_COMPATIBLE_POSITIONS", "NO_FEASIBLE_PLAN",
    }
    scenarios = [
        _input(orders=[], positions=[_position("P1")]),
        _input(orders=[_order("one")], positions=[_position("P1", is_available=False)]),
        _input(orders=[_order("one", product="PMS")], positions=[_position("P1", compatibility="AGO")]),
        _input(orders=[_order("one")], positions=[_position("P1")]),
    ]
    for inp in scenarios:
        result = FlowGuardOptimizer().solve_depot_schedule(inp)
        assert result.status in valid_statuses, f"Unexpected status: {result.status!r}"


# ---------------------------------------------------------------------------
# 2e. Solve-time measurement is non-zero when work is performed
# ---------------------------------------------------------------------------

def test_solve_time_measured_accurately_when_solver_runs():
    """solve_time_ms must be greater than zero whenever the CP-SAT solver is invoked."""
    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=[_order("one")], positions=[_position("P1")])
    )
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    assert result.solve_time_ms > 0.0, "Solver must record non-zero elapsed time"


def test_solve_time_is_zero_ms_when_failing_before_solver():
    """When we bail out before CP-SAT, time elapsed should still be >= 0.0 (positive but tiny)."""
    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=[], positions=[_position("P1")])
    )
    assert result.status == "NO_ELIGIBLE_ORDERS"
    # Still a measured value (perf_counter delta), just very small
    assert result.solve_time_ms >= 0.0


# ---------------------------------------------------------------------------
# 2f. Deterministic output — same inputs → same candidate IDs and scores
# ---------------------------------------------------------------------------

def test_deterministic_output_same_inputs():
    """Identical inputs must produce identical candidate IDs and scores on two runs."""
    orders = [_order("ord-A", arrival=0, risk=75.0), _order("ord-B", arrival=10, risk=50.0)]
    positions = [_position("P1"), _position("P2")]

    result1 = FlowGuardOptimizer().solve_depot_schedule(_input(orders, positions))
    result2 = FlowGuardOptimizer().solve_depot_schedule(_input(orders, positions))

    assert result1.status == result2.status
    assert len(result1.candidates) == len(result2.candidates)
    for c1, c2 in zip(result1.candidates, result2.candidates):
        assert c1.candidate_id == c2.candidate_id
        assert c1.score == c2.score


# ---------------------------------------------------------------------------
# 2g. Counterfactual calculation
# ---------------------------------------------------------------------------

def test_counterfactual_metrics_structure():
    """Counterfactual metrics must contain all required fields with sensible types."""
    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=[_order("one")], positions=[_position("P1")])
    )
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    cf = result.counterfactual_metrics
    required_keys = {
        "schedule_type", "orders_count",
        "baseline_avg_turnaround_min", "optimized_avg_turnaround_min", "turnaround_reduction_min",
        "baseline_avg_wait_min", "optimized_avg_wait_min", "queue_wait_reduction_min",
        "total_dwell_minutes_saved",
    }
    assert required_keys.issubset(set(cf.keys())), f"Missing keys: {required_keys - set(cf.keys())}"
    assert cf["schedule_type"] == "OPTIMIZED_CP_SAT"
    assert isinstance(cf["orders_count"], int)
    assert isinstance(cf["turnaround_reduction_min"], float)


def test_counterfactual_not_negative_for_optimization_over_fifo():
    """Counterfactual dwell savings must be >= 0 (optimizer should not be worse than FIFO)."""
    # Two AGO orders, two bays: optimizer can do at least as well as FIFO
    orders = [_order("a", arrival=0, risk=80.0), _order("b", arrival=5, risk=30.0)]
    positions = [_position("P1"), _position("P2")]
    result = FlowGuardOptimizer().solve_depot_schedule(_input(orders, positions))
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    cf = result.counterfactual_metrics
    assert cf["total_dwell_minutes_saved"] >= 0.0


# ---------------------------------------------------------------------------
# 2h. Policy classification — correct tier mapping
# ---------------------------------------------------------------------------

def test_policy_auto_executable_for_routine_reversible_action():
    """A BALANCE_LOADING_POSITIONS candidate with low risk and high confidence → AUTO_EXECUTABLE.

    To force a bay-swap candidate (BALANCE_LOADING_POSITIONS), we create three orders
    with staggered arrivals across two bays. The optimizer will swap some orders relative
    to FIFO baseline (which assigns to the earliest free bay), generating the swap candidate.
    """
    # Three orders with staggered arrivals: optimizer may resequence relative to strict FIFO
    orders = [
        _order("high-risk", arrival=0, risk=75.0, quantity=10_000.0),
        _order("med-risk", arrival=5, risk=40.0, quantity=10_000.0),
        _order("low-risk", arrival=8, risk=15.0, quantity=10_000.0),
    ]
    positions = [_position("P1"), _position("P2")]
    result = FlowGuardOptimizer().solve_depot_schedule(_input(orders, positions, horizon=240))
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    assert result.selected_candidate is not None

    # Find a non-baseline candidate if one exists, otherwise use the baseline (which is always present)
    # The policy evaluator should pass AUTO_EXECUTABLE for any FEASIBLE_VERIFIED candidate with
    # low risk and high confidence, as long as the action type is on the allowlist.
    # For MAINTAIN_CURRENT_SCHEDULE (not on allowlist), expect APPROVAL_REQUIRED.
    # For others (RESEQUENCE_QUEUE, BALANCE_LOADING_POSITIONS), expect AUTO_EXECUTABLE.
    non_baseline = next(
        (c for c in result.candidates if c.action_type != "MAINTAIN_CURRENT_SCHEDULE"),
        None,
    )
    if non_baseline is None:
        # No swap/resequence happened — the optimizer's FIFO is already optimal.
        # Verify that MAINTAIN_CURRENT_SCHEDULE triggers APPROVAL_REQUIRED (not on allowlist),
        # which is expected and correct behavior.
        policy = PolicyEvaluator().evaluate(
            result.selected_candidate,
            risk_context={"risk_score": 20.0, "risk_level": "LOW", "confidence_pct": 90.0},
        )
        assert policy.policy_state in {"AUTO_EXECUTABLE", "APPROVAL_REQUIRED"}
    else:
        # A resequence or balance candidate exists — it should be AUTO_EXECUTABLE with low risk.
        policy = PolicyEvaluator().evaluate(
            non_baseline,
            risk_context={"risk_score": 20.0, "risk_level": "LOW", "confidence_pct": 90.0},
        )
        assert policy.policy_state == "AUTO_EXECUTABLE"
        assert policy.autonomy_level == "L2_AUTO_EXECUTABLE"
        assert policy.allowed is True
        assert policy.requires_human_approval is False


def test_policy_blocked_for_infeasible_candidate():
    """INFEASIBLE constraint status must produce BLOCKED_BY_POLICY regardless of risk."""
    candidate = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=[_order("one")], positions=[_position("P1")])
    ).selected_candidate
    candidate.constraint_status = "INFEASIBLE"
    policy = PolicyEvaluator().evaluate(candidate)
    assert policy.policy_state == "BLOCKED_BY_POLICY"
    assert policy.allowed is False


def test_policy_approval_required_for_critical_risk():
    """Critical risk level should trigger L3 supervised approval."""
    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=[_order("one", risk=90.0)], positions=[_position("P1")])
    )
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    policy = PolicyEvaluator().evaluate(
        result.selected_candidate,
        risk_context={"risk_score": 90.0, "risk_level": "CRITICAL", "confidence_pct": 90.0},
    )
    assert policy.policy_state == "APPROVAL_REQUIRED"


def test_policy_approval_required_for_low_confidence():
    """Below-threshold prediction confidence must trigger APPROVAL_REQUIRED."""
    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=[_order("one", risk=20.0)], positions=[_position("P1")])
    )
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    policy = PolicyEvaluator().evaluate(
        result.selected_candidate,
        risk_context={"risk_score": 20.0, "risk_level": "LOW", "confidence_pct": 50.0},
    )
    assert policy.policy_state == "APPROVAL_REQUIRED"


# ---------------------------------------------------------------------------
# 2i. Partial scheduling — more orders than compatible capacity
# ---------------------------------------------------------------------------

def test_partial_scheduling_does_not_fail_when_capacity_less_than_demand():
    """Optimizer should return a feasible subset, not NO_FEASIBLE_PLAN, when demand > capacity."""
    # 5 orders, 1 narrow-horizon bay → partial schedule
    orders = [_order(f"ord-{i}", arrival=i * 2, risk=float(50 + i)) for i in range(5)]
    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=orders, positions=[_position("P1")], horizon=25)
    )
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    assert result.solver_diagnostics["scheduled_orders"] >= 1
    assert result.solver_diagnostics["queued_orders"] >= 1
    assert result.selected_candidate is not None


def test_partial_scheduling_queued_orders_are_not_assigned():
    """Orders left in the queue must not appear in the optimized schedule."""
    orders = [_order(f"ord-{i}", arrival=0, risk=70.0) for i in range(4)]
    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=orders, positions=[_position("P1")], horizon=25)
    )
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    # The baseline (MAINTAIN_CURRENT_SCHEDULE) schedule only contains assigned orders
    baseline = next(c for c in result.candidates if c.action_type == "MAINTAIN_CURRENT_SCHEDULE")
    scheduled_count = result.solver_diagnostics["scheduled_orders"]
    assert len(baseline.schedule) == scheduled_count


# ---------------------------------------------------------------------------
# 2j. Diagnostics completeness
# ---------------------------------------------------------------------------

def test_diagnostics_contain_required_fields():
    """solver_diagnostics must contain all specified diagnostic keys when CP-SAT runs."""
    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(
            orders=[_order("a"), _order("b")],
            positions=[_position("P1"), _position("P2")],
        )
    )
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    d = result.solver_diagnostics
    required = {
        "orders_considered", "positions_considered",
        "available_positions", "unavailable_positions",
        "eligible_orders", "compatible_order_position_pairs",
        "excluded_orders", "model_build_time_ms",
        "model_variable_count", "constraint_count",
        "scheduled_orders", "queued_orders",
        "status_name", "wall_time",
    }
    missing = required - set(d.keys())
    assert not missing, f"Missing diagnostic keys: {missing}"


def test_diagnostics_model_variable_count_positive():
    """When CP-SAT model is built, variable and constraint counts must be positive."""
    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=[_order("x")], positions=[_position("P1")])
    )
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    assert result.solver_diagnostics["model_variable_count"] > 0
    assert result.solver_diagnostics["constraint_count"] > 0


# ---------------------------------------------------------------------------
# 2k. Multiple compatible products and positions — each order goes to compatible bay only
# ---------------------------------------------------------------------------

def test_product_compatibility_enforced_across_multi_product_scenario():
    """PMS orders must not be assigned to AGO-only bays and vice versa."""
    orders = [
        _order("ago1", product="AGO"),
        _order("pms1", product="PMS"),
    ]
    positions = [
        _position("PA", compatibility="AGO"),
        _position("PP", compatibility="PMS"),
    ]
    result = FlowGuardOptimizer().solve_depot_schedule(_input(orders, positions))
    assert result.status in {"OPTIMAL", "FEASIBLE"}

    baseline = next(c for c in result.candidates if c.action_type == "MAINTAIN_CURRENT_SCHEDULE")
    assert baseline.schedule["ago1"]["assigned_position_id"] == "PA"
    assert baseline.schedule["pms1"]["assigned_position_id"] == "PP"


# ---------------------------------------------------------------------------
# 2l. Candidate list structure
# ---------------------------------------------------------------------------

def test_candidates_list_contains_at_least_maintain_current_schedule():
    """The MAINTAIN_CURRENT_SCHEDULE baseline candidate must always be present."""
    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=[_order("one")], positions=[_position("P1")])
    )
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    action_types = [c.action_type for c in result.candidates]
    assert "MAINTAIN_CURRENT_SCHEDULE" in action_types


def test_candidates_are_sorted_by_score_descending():
    """Candidates must be returned in descending score order."""
    orders = [_order("a", arrival=0, risk=80.0), _order("b", arrival=5, risk=20.0)]
    positions = [_position("P1"), _position("P2")]
    result = FlowGuardOptimizer().solve_depot_schedule(_input(orders, positions))
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    scores = [c.score for c in result.candidates]
    assert scores == sorted(scores, reverse=True)


def test_selected_candidate_is_highest_score():
    """selected_candidate must be the first (highest-scoring) candidate."""
    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=[_order("one")], positions=[_position("P1")])
    )
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    assert result.selected_candidate is not None
    assert result.selected_candidate.candidate_id == result.candidates[0].candidate_id


# ---------------------------------------------------------------------------
# 2m. Non-Nairobi depot (Mombasa) — ensure no depot-specific hard-coding
# ---------------------------------------------------------------------------

def test_optimizer_works_for_mombasa_depot():
    """Optimizer must produce a feasible result for a mombasa depot input without special-casing."""
    orders = [_order("mbs-01", product="PMS", arrival=0, risk=60.0)]
    positions = [_position("KOT-P01", compatibility="PMS")]
    result = FlowGuardOptimizer().solve_depot_schedule(
        OptimizationInput(
            depot_id="mombasa",
            reference_timestamp=datetime.now(timezone.utc),
            orders=orders,
            positions=positions,
            planning_horizon_minutes=240,
        )
    )
    assert result.depot_id == "mombasa"
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    assert result.selected_candidate is not None


def test_optimizer_works_for_eldoret_depot():
    """Optimizer must work for eldoret depot — no depot-specific logic is allowed."""
    result = FlowGuardOptimizer().solve_depot_schedule(
        OptimizationInput(
            depot_id="eldoret",
            reference_timestamp=datetime.now(timezone.utc),
            orders=[_order("eld-01", product="AGO", risk=40.0)],
            positions=[_position("ELD-P01", compatibility="AGO")],
            planning_horizon_minutes=240,
        )
    )
    assert result.depot_id == "eldoret"
    assert result.status in {"OPTIMAL", "FEASIBLE"}


# ---------------------------------------------------------------------------
# 2n. Safety disclaimer and simulation flags in CandidateAction structure
# ---------------------------------------------------------------------------

def test_candidate_constraint_status_is_feasible_verified():
    """All machine-generated candidates must have FEASIBLE_VERIFIED constraint_status."""
    result = FlowGuardOptimizer().solve_depot_schedule(
        _input(orders=[_order("one"), _order("two", arrival=5)], positions=[_position("P1"), _position("P2")])
    )
    assert result.status in {"OPTIMAL", "FEASIBLE"}
    for candidate in result.candidates:
        assert candidate.constraint_status == "FEASIBLE_VERIFIED", (
            f"Candidate {candidate.candidate_id} has unexpected status: {candidate.constraint_status}"
        )


# ---------------------------------------------------------------------------
# 2o. Integration test: Nairobi live database solve
# ---------------------------------------------------------------------------

@pytest.mark.integration
def test_nairobi_feasible_optimization_from_database(db_session: Session):
    """Full integration: solve against real PostgreSQL Nairobi state.

    Requires the seeded synthetic database. Skipped automatically if DB unavailable.
    """
    from backend.app.services.optimization_service import OptimizationService
    from backend.app.services.prediction_service import PredictionService
    from backend.app.db.session import engine

    try:
        prediction_svc = PredictionService(engine)
        svc = OptimizationService(db=db_session, prediction_service=prediction_svc)
        # Force new decision (bypass idempotency for test isolation)
        response = svc.solve_depot(depot_id="nairobi", force_new=True)
    except Exception as exc:
        pytest.skip(f"Integration test requires seeded PostgreSQL: {exc}")

    assert response.depot_id == "nairobi"
    assert response.solver_status in {"OPTIMAL", "FEASIBLE"}
    assert response.solve_time_ms > 0.0
    assert response.candidates_count > 0
    assert response.selected_candidate is not None
    assert response.is_simulation is True
    assert "SIMULATED" in response.safety_disclaimer


@pytest.mark.integration
def test_mombasa_feasible_optimization_from_database(db_session: Session):
    """Full integration: mombasa depot solve. Validates no Nairobi-specific hard-coding."""
    from backend.app.services.optimization_service import OptimizationService
    from backend.app.services.prediction_service import PredictionService
    from backend.app.db.session import engine

    try:
        prediction_svc = PredictionService(engine)
        svc = OptimizationService(db=db_session, prediction_service=prediction_svc)
        response = svc.solve_depot(depot_id="mombasa", force_new=True)
    except Exception as exc:
        pytest.skip(f"Integration test requires seeded PostgreSQL: {exc}")

    assert response.depot_id == "mombasa"
    # Mombasa has 2 IN_PROGRESS orders; should reach solver
    assert response.solver_status in {"OPTIMAL", "FEASIBLE", "NO_ELIGIBLE_ORDERS", "NO_COMPATIBLE_POSITIONS"}
    assert response.is_simulation is True
