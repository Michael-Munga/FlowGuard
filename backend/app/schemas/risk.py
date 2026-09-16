"""Predictive risk and congestion event schemas."""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class RiskEventResponse(BaseModel):
    """Predictive turnaround risk event."""
    risk_event_id: str
    depot_id: str
    detected_at: str
    risk_category: str
    severity: str
    predicted_turnaround_min: int
    baseline_turnaround_min: int
    dwell_delta_min: int
    exposure_at_risk_kes: float
    primary_root_cause: str
    affected_orders_count: int
    status: str


class ActiveRisksSummaryResponse(BaseModel):
    """Network-wide active congestion risk summary."""
    total_active_risks: int
    severity_counts: Dict[str, int]
    total_exposure_at_risk_kes: float
    items: List[RiskEventResponse] = Field(default_factory=list)
