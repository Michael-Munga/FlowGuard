"""Network and Executive KPI schemas."""

from pydantic import BaseModel, Field


class NetworkKpisResponse(BaseModel):
    """Network Command Centre high-level KPIs."""
    total_throughput_m3: float
    total_orders: int
    completed_orders: int
    avg_loading_duration_mins: float
    active_risks_count: int
    exposure_at_risk_kes: float
    total_realized_savings_kes: float


class ExecutiveMetricsResponse(BaseModel):
    """Executive Control Plane metrics summary."""
    network_kpis: NetworkKpisResponse
    depot_count: int = 5
    omc_count: int = 7
    fleet_size: int = 750
    system_autonomy_ratio: float
