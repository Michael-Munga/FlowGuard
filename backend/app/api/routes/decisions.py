"""Autonomous decisions and 8-stage pipeline API routes."""

from typing import Optional
from fastapi import APIRouter, Depends, Query, Path
from backend.app.api.deps import get_decision_service
from backend.app.services.decision_service import DecisionService
from backend.app.schemas.common import PaginatedResponse
from backend.app.schemas.decision import (
    DecisionSummary,
    DecisionTraceResponse,
    AutonomyStatsResponse,
)

router = APIRouter(prefix="/decisions", tags=["Autonomous Control"])


@router.get(
    "",
    response_model=PaginatedResponse[DecisionSummary],
    summary="List paginated autonomous decisions",
)
def list_decisions(
    depot_id: Optional[str] = Query(None, description="Optional filter by depot ID"),
    limit: int = Query(20, ge=1, le=100, description="Items per page (default: 20, max: 100)"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    service: DecisionService = Depends(get_decision_service),
) -> PaginatedResponse[DecisionSummary]:
    """Retrieve bounded list of evaluated autonomous interventions."""
    return service.list_decisions(depot_id=depot_id, limit=limit, offset=offset)


@router.get(
    "/stats/autonomy",
    response_model=AutonomyStatsResponse,
    summary="Get autonomy level distribution and savings stats",
)
def get_autonomy_stats(
    service: DecisionService = Depends(get_decision_service),
) -> AutonomyStatsResponse:
    """Retrieve autonomy level distribution (L1/L2/L3) and verified savings."""
    return service.get_autonomy_stats()


@router.get(
    "/{decision_id}/trace",
    response_model=DecisionTraceResponse,
    summary="Get full 8-stage decision trace and audit seal",
)
def get_decision_trace(
    decision_id: str = Path(..., description="Decision identifier (e.g. DEC-0142)"),
    service: DecisionService = Depends(get_decision_service),
) -> DecisionTraceResponse:
    """Retrieve end-to-end 8-stage reasoning trace, actuation result, and cryptographic audit hash."""
    return service.get_decision_trace(decision_id)
