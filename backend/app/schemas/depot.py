"""Depot and gantry loading position API schemas."""

from typing import List, Optional
from pydantic import BaseModel, Field


class LoadingPositionResponse(BaseModel):
    """Gantry bay hardware loading position representation."""
    loading_position_id: str
    bay_number: int
    code: str
    product_compatibility: str
    has_dual_arm: bool
    standard_flow_rate_lpm: int
    is_high_velocity: bool
    status: Optional[str] = "AVAILABLE"
    flow_impact_pct: Optional[int] = 0
    effective_flow_rate_lpm: Optional[int] = None
    current_order_id: Optional[str] = None
    current_truck_registration: Optional[str] = None
    operational_notes: Optional[str] = None


class YardTruckResponse(BaseModel):
    """Operational representation of an active truck inside the terminal."""
    order_id: str
    truck_id: str
    truck_registration: str
    driver_name: str
    omc_id: str
    product_id: str
    ordered_quantity_litres: float
    current_stage: str
    stage_display: str
    time_in_stage_min: int
    allocated_position_id: Optional[str] = None
    allocated_bay_number: Optional[int] = None
    predicted_gate_out: Optional[str] = None
    predicted_turnaround_min: float
    risk_status: str
    risk_label: str
    is_active_inside: bool


class DepotSummary(BaseModel):
    """KPC depot master entity representation."""
    depot_id: str
    name: str
    code: str
    region: str
    total_positions: int
    baseline_turnaround_min: int
    operating_hours: str


class DepotLiveStateResponse(BaseModel):
    """Live operational state for a KPC depot."""
    depot_id: str
    name: str
    code: str
    region: str
    total_positions: int
    actively_loading: int
    queue_count: int
    total_active_orders: int
    bay_utilization_pct: float
    baseline_turnaround_min: int
    operating_hours: str
    trucks_inside: Optional[int] = 0
    validating_count: Optional[int] = 0
    positioned_count: Optional[int] = 0
    approaching_count: Optional[int] = 0
    available_positions: Optional[int] = 0
    occupied_positions: Optional[int] = 0
    degraded_positions: Optional[int] = 0
    unavailable_positions: Optional[int] = 0
    queue_pressure_ratio: Optional[float] = 0.0
    queue_pressure_level: Optional[str] = "NORMAL"
    congestion_level: Optional[str] = "LOW"
    current_turnaround_min: Optional[float] = 65.0
    scenario_id: Optional[str] = None
    scenario_name: Optional[str] = None
    scenario_time: Optional[str] = None
    loading_positions: List[LoadingPositionResponse] = Field(default_factory=list)
    active_trucks: List[YardTruckResponse] = Field(default_factory=list)


class DepotForecastResponse(BaseModel):
    """Predictive turnaround and inflow outlook for a depot."""
    depot_id: str
    forecast_horizon_hours: int = 4
    predicted_inflow_trucks: int
    predicted_avg_wait_min: float
    predicted_peak_window: str
    congestion_risk_level: str
    recommended_bays_active: int
