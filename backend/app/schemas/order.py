"""Loading order and milestone lifecycle event schemas."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class MilestoneArrivalSignal(BaseModel):
    distance_km: Optional[float] = None
    confidence_pct: Optional[float] = None


class MilestoneGateEvent(BaseModel):
    event_type: str
    timestamp: str
    lane: str


class MilestoneValidation(BaseModel):
    outcome: str
    duration_minutes: float
    customs_status: str


class MilestoneStaging(BaseModel):
    area: str
    wait_duration_minutes: Optional[float] = None
    reason: Optional[str] = None


class MilestoneLoading(BaseModel):
    position_id: str
    actual_litres: Optional[float] = None
    duration_minutes: Optional[float] = None
    avg_flow_rate_lpm: Optional[float] = None
    dual_arm_used: bool = False


class OrderMilestones(BaseModel):
    arrival_signal: Optional[MilestoneArrivalSignal] = None
    gate_events: List[MilestoneGateEvent] = Field(default_factory=list)
    validation: Optional[MilestoneValidation] = None
    staging: Optional[MilestoneStaging] = None
    loading: Optional[MilestoneLoading] = None


class OrderSummary(BaseModel):
    """Summarized loading order for list views."""
    order_id: str
    omc_id: str
    depot_id: str
    truck_id: str
    product_id: str
    ordered_quantity_litres: float
    order_registered_time: str
    expected_arrival_time: str
    order_status: str


class OrderDetailResponse(BaseModel):
    """Complete loading order with milestone progression trail."""
    order_id: str
    omc_id: str
    omc_name: Optional[str] = None
    depot_id: str
    depot_name: Optional[str] = None
    truck_id: str
    truck_registration: Optional[str] = None
    driver_name: Optional[str] = None
    product_id: str
    product_name: Optional[str] = None
    ordered_quantity_litres: float
    order_registered_time: str
    expected_arrival_time: str
    order_status: str
    milestones: OrderMilestones


class OmcSummaryResponse(BaseModel):
    """OMC collection progress summary."""
    omc_id: str
    total_orders: int
    status_counts: Dict[str, int]
    completed: int
    in_progress: int
