"""API routes for FlowGuard OR-Tools Optimization and Bounded-Autonomy Decisions."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from backend.app.api.deps import get_optimization_service
from backend.app.services.optimization_service import OptimizationService
from backend.app.schemas.optimization import (
    OptimizationDecisionResponse,
    CandidateActionResponse,
    ApprovalRequest,
    ApprovalResponse,
)

router = APIRouter(prefix="/optimization", tags=["Constrained Optimization & Bounded Autonomy"])


@router.post(
    "/depot/{depot_id}/solve",
    response_model=OptimizationDecisionResponse,
    summary="Solve Depot Schedule via Google OR-Tools and Evaluate Policy",
    description=(
        "Executes CP-SAT constrained optimization for active depot loading positions, "
        "evaluates candidate alternatives against safety policy, and dispatches simulated actuation or awaits approval."
    ),
)
def solve_depot_schedule(
    depot_id: str,
    force_new: bool = Query(default=False, description="Bypass 15-minute idempotency cache to force fresh solver execution"),
    optimization_service: OptimizationService = Depends(get_optimization_service),
) -> OptimizationDecisionResponse:
    try:
        return optimization_service.solve_depot(depot_id, force_new=force_new)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimization solver execution failed: {str(e)}",
        )


@router.get(
    "/decisions/{decision_id}",
    response_model=OptimizationDecisionResponse,
    summary="Get Optimization Decision Details and Autonomy State",
    description="Retrieves a persisted decision, including selected candidate, policy verdict, and counterfactual metrics.",
)
def get_optimization_decision(
    decision_id: str,
    optimization_service: OptimizationService = Depends(get_optimization_service),
) -> OptimizationDecisionResponse:
    try:
        return optimization_service.get_decision(decision_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/decisions/{decision_id}/candidates",
    response_model=List[CandidateActionResponse],
    summary="Get Evaluated Candidate Alternatives for a Decision",
    description="Returns all ranked candidate actions considered by OR-Tools along with expected operational impact.",
)
def get_decision_candidates(
    decision_id: str,
    optimization_service: OptimizationService = Depends(get_optimization_service),
) -> List[CandidateActionResponse]:
    try:
        return optimization_service.get_candidates_for_decision(decision_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post(
    "/decisions/{decision_id}/approve",
    response_model=ApprovalResponse,
    summary="Approve Supervised (L3) Decision",
    description=(
        "Simulates human supervisor sign-off on an AWAITING_APPROVAL decision, "
        "dispatching the approved intervention to the simulated terminal gateway."
    ),
)
def approve_decision(
    decision_id: str,
    request: ApprovalRequest = ApprovalRequest(),
    optimization_service: OptimizationService = Depends(get_optimization_service),
) -> ApprovalResponse:
    try:
        return optimization_service.approve_decision(
            decision_id=decision_id,
            operator_id=request.operator_id,
            comments=request.comments,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/depot/{depot_id}/recommendations",
    response_model=OptimizationDecisionResponse,
    summary="Get Latest Active Recommendation for a Depot",
    description="Fetches the most recent optimization recommendation for the specified KPC terminal.",
)
def get_depot_recommendations(
    depot_id: str,
    optimization_service: OptimizationService = Depends(get_optimization_service),
) -> OptimizationDecisionResponse:
    try:
        return optimization_service.solve_depot(depot_id, force_new=False)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch recommendations: {str(e)}",
        )
