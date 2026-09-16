"""Depot operations and live status API routes."""

from typing import List
from fastapi import APIRouter, Depends, Path
from backend.app.api.deps import get_depot_service
from backend.app.services.depot_service import DepotService
from backend.app.schemas.depot import (
    DepotSummary,
    DepotLiveStateResponse,
    DepotForecastResponse,
)

router = APIRouter(prefix="/depots", tags=["Depot Operations"])


@router.get("", response_model=List[DepotSummary], summary="List all KPC pipeline depots")
def list_depots(
    service: DepotService = Depends(get_depot_service),
) -> List[DepotSummary]:
    """Retrieve master metadata for all 5 KPC bulk petroleum depots."""
    return service.list_depots()


@router.get(
    "/{depot_id}/live",
    response_model=DepotLiveStateResponse,
    summary="Get live operational state for a depot",
)
def get_depot_live_state(
    depot_id: str = Path(..., description="Depot identifier (e.g. nairobi, mombasa)"),
    service: DepotService = Depends(get_depot_service),
) -> DepotLiveStateResponse:
    """Retrieve live gantry bay occupancy, queue depth, and active collection orders for a depot."""
    return service.get_depot_live_state(depot_id)


@router.get(
    "/{depot_id}/forecast",
    response_model=DepotForecastResponse,
    summary="Get predictive throughput and congestion forecast",
)
def get_depot_forecast(
    depot_id: str = Path(..., description="Depot identifier"),
    service: DepotService = Depends(get_depot_service),
) -> DepotForecastResponse:
    """Retrieve 4-hour predictive inflow, expected wait time, and congestion probability."""
    return service.get_depot_forecast(depot_id)
