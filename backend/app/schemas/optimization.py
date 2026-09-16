"""Pydantic schemas for FlowGuard Optimization and Bounded-Autonomy Decisions."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class CandidateActionResponse(BaseModel):
    """Candidate operational intervention alternative."""
    candidate_id: str
    action_type: str
    target_orders: List[str]
    target_positions: List[str]
    score: float
    expected_turnaround_change_min: float
    expected_queue_change_min: float
    expected_risk_change_pts: float
    constraint_status: str
    explanation: str


class CounterfactualMetricsResponse(BaseModel):
    """Counterfactual comparison between baseline FIFO and optimized schedule."""
    schedule_type: str = "OPTIMIZED_CP_SAT"
    orders_count: int
    baseline_avg_turnaround_min: float
    optimized_avg_turnaround_min: float
    turnaround_reduction_min: float
    baseline_avg_wait_min: float
    optimized_avg_wait_min: float
    queue_wait_reduction_min: float
    total_dwell_minutes_saved: float


class OptimizationDecisionResponse(BaseModel):
    """Domain decision record uniting ML prediction, OR-Tools optimization, and policy verdict."""
    decision_id: str
    depot_id: str
    created_at: str
    headline: str
    solver_status: str
    solve_time_ms: float
    autonomy_level: str
    policy_state: str
    decision_status: str
    selected_candidate: Optional[CandidateActionResponse] = None
    policy_rule_id: str
    policy_reasons: List[str] = Field(default_factory=list)
    counterfactual_metrics: Optional[CounterfactualMetricsResponse] = None
    execution_summary: Optional[Dict[str, Any]] = None
    candidates_count: int = 0
    optimizer_version: str = "flowguard-cp-sat-v1.0.0"
    policy_version: str = "flowguard-demo-policy-v1.0.0"
    is_simulation: bool = True
    safety_disclaimer: str = "SIMULATED_EXECUTION: Explicitly not connected to live KPC gantry/SCADA systems."


class ApprovalRequest(BaseModel):
    """Operator sign-off request for L3 supervised decisions."""
    operator_id: str = Field(default="KPC_OPERATIONAL_CONTROLLER", description="Logged operator badge ID")
    comments: Optional[str] = Field(default="Approved via FlowGuard Autonomous Control Workspace", description="Supervisor notes")


class ApprovalResponse(BaseModel):
    """Result of human supervisor authorization."""
    decision_id: str
    status: str  # SIMULATED_EXECUTED, REJECTED
    approved_by: str
    approved_at: str
    execution_result: Dict[str, Any]
    message: str
