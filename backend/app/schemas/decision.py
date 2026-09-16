"""Autonomous decision and 8-stage pipeline schemas."""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class DecisionSummary(BaseModel):
    """Summarized autonomous decision."""
    decision_id: str
    depot_id: str
    decision_timestamp: str
    headline: str
    autonomy_level: str
    decision_status: str
    selected_candidate_id: Optional[str] = None
    target_orders_count: int


class DecisionStageResponse(BaseModel):
    """Discrete step within the 8-stage autonomy cycle."""
    stage_sequence: int
    stage_name: str
    stage_status: str
    stage_timestamp: str
    metric_label: Optional[str] = None
    metric_value: Optional[str] = None
    payload_summary: Optional[str] = None


class AutonomousActionResponse(BaseModel):
    """Subsystem hardware command execution."""
    action_id: str
    action_type: str
    control_state: str
    target_device_interface: str
    dispatched_at: str
    execution_result: str


class VerificationResponse(BaseModel):
    """Empirical turnaround savings audit."""
    verification_id: str
    baseline_turnaround_min: int
    achieved_turnaround_min: int
    observed_reduction_min: int
    recovery_attainment_pct: float
    exposure_protected_kes: float
    realized_savings_kes: float
    verification_status: str


class AuditResponse(BaseModel):
    """Cryptographic audit ledger record."""
    audit_event_id: str
    actor: str
    audit_reference_sha256: str
    verification_digest: str
    logged_at: str


class DecisionTraceResponse(BaseModel):
    """Full 8-stage decision trace and closed-loop verification."""
    decision_id: str
    depot_id: str
    depot_name: Optional[str] = None
    decision_timestamp: str
    headline: str
    autonomy_level: str
    decision_status: str
    selected_candidate_id: Optional[str] = None
    target_orders_count: int
    stages: List[DecisionStageResponse] = Field(default_factory=list)
    action: Optional[AutonomousActionResponse] = None
    verification: Optional[VerificationResponse] = None
    audit: Optional[AuditResponse] = None


class AutonomyStatsResponse(BaseModel):
    """Autonomy performance and ROI metrics."""
    total_decisions: int
    autonomy_distribution: Dict[str, int]
    total_realized_savings_kes: float
