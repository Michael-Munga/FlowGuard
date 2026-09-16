"""Network and Executive metrics API routes."""

from typing import Dict, Any
from fastapi import APIRouter, Depends, Path
from backend.app.api.deps import get_metrics_service
from backend.app.services.metrics_service import MetricsService
from backend.app.schemas.metrics import NetworkKpisResponse, ExecutiveMetricsResponse

router = APIRouter(prefix="/metrics", tags=["Operational Metrics"])


@router.get(
    "/network",
    response_model=NetworkKpisResponse,
    summary="Get real-time Network Command Centre KPIs",
)
def get_network_kpis(
    service: MetricsService = Depends(get_metrics_service),
) -> NetworkKpisResponse:
    """Retrieve national pipeline network throughput, turnaround average, and exposure."""
    return service.get_network_kpis()


@router.get(
    "/executive",
    response_model=ExecutiveMetricsResponse,
    summary="Get Executive Control Plane summary metrics",
)
def get_executive_metrics(
    service: MetricsService = Depends(get_metrics_service),
) -> ExecutiveMetricsResponse:
    """Retrieve executive KPIs, multi-depot throughput, and autonomy adoption ratio."""
    return service.get_executive_metrics()


@router.get(
    "/depots/{depot_id}/turnaround",
    response_model=Dict[str, Any],
    summary="Get depot turnaround statistics",
)
def get_depot_turnaround_summary(
    depot_id: str = Path(..., description="Depot identifier"),
    service: MetricsService = Depends(get_metrics_service),
) -> Dict[str, Any]:
    """Retrieve empirical loading duration summary (avg, min, max) for a specific depot."""
    return service.get_depot_turnaround(depot_id)
