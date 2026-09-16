"""Predictive risk and congestion monitoring API routes."""

from typing import Optional
from fastapi import APIRouter, Depends, Query, Path
from backend.app.api.deps import get_risk_service
from backend.app.services.risk_service import RiskService
from backend.app.schemas.risk import RiskEventResponse, ActiveRisksSummaryResponse

router = APIRouter(prefix="/risks", tags=["Predictive Risks"])


@router.get(
    "/active",
    response_model=ActiveRisksSummaryResponse,
    summary="Get active turnaround and congestion risks",
)
def get_active_risks(
    depot_id: Optional[str] = Query(None, description="Optional filter by depot ID"),
    service: RiskService = Depends(get_risk_service),
) -> ActiveRisksSummaryResponse:
    """Retrieve all unresolved demurrage and turnaround risk events across the network."""
    return service.get_active_risks(depot_id=depot_id)


@router.get(
    "/{risk_id}",
    response_model=RiskEventResponse,
    summary="Get risk event details",
)
def get_risk_by_id(
    risk_id: str = Path(..., description="Risk event ID (e.g. RSK-NBO-20260915-01)"),
    service: RiskService = Depends(get_risk_service),
) -> RiskEventResponse:
    """Retrieve detailed telemetry and diagnosis for a single risk event."""
    return service.get_risk_by_id(risk_id)
