"""API routes for FlowGuard ML Predictions and Operational Risk Intelligence."""

from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.api.deps import get_prediction_service
from backend.app.services.prediction_service import PredictionService
from backend.app.schemas.prediction import (
    ArrivalPredictionResponse,
    TurnaroundPredictionResponse,
    GateOutPredictionResponse,
    OrderRiskResponse,
    DepotRiskResponse,
)

router = APIRouter(prefix="/predictions", tags=["Predictions & Risk Intelligence"])


@router.get(
    "/orders/{order_id}/arrival",
    response_model=ArrivalPredictionResponse,
    summary="Get ML Arrival Prediction for an Order",
    description="Predicts estimated arrival time, duration, confidence window, and feature importances based on pre-arrival features.",
)
def get_order_arrival_prediction(
    order_id: str,
    prediction_service: PredictionService = Depends(get_prediction_service),
) -> ArrivalPredictionResponse:
    res = prediction_service.get_arrival_prediction(order_id)
    if res.status == "PREDICTION_UNAVAILABLE" and "not found" in (res.reason or "").lower():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_id}' was not found in the operational database.",
        )
    return res


@router.get(
    "/orders/{order_id}/turnaround",
    response_model=TurnaroundPredictionResponse,
    summary="Get ML Turnaround Prediction for an Order",
    description="Predicts Gate-In to Gate-Out loading turnaround duration, variance vs depot baseline, and confidence window.",
)
def get_order_turnaround_prediction(
    order_id: str,
    prediction_service: PredictionService = Depends(get_prediction_service),
) -> TurnaroundPredictionResponse:
    res = prediction_service.get_turnaround_prediction(order_id)
    if res.status == "PREDICTION_UNAVAILABLE" and "not found" in (res.reason or "").lower():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_id}' was not found in the operational database.",
        )
    return res


@router.get(
    "/orders/{order_id}/gate-out",
    response_model=GateOutPredictionResponse,
    summary="Get Predicted Gate-Out Timing for an Order",
    description="Calculates Predicted Gate-Out = Predicted Arrival + Predicted Turnaround (or Actual Gate-In + Turnaround).",
)
def get_order_gate_out_prediction(
    order_id: str,
    prediction_service: PredictionService = Depends(get_prediction_service),
) -> GateOutPredictionResponse:
    res = prediction_service.get_gate_out_prediction(order_id)
    if res.status == "PREDICTION_UNAVAILABLE" and "not found" in (res.reason or "").lower():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_id}' was not found in the operational database.",
        )
    return res


@router.get(
    "/orders/{order_id}/risk",
    response_model=OrderRiskResponse,
    summary="Get Operational Risk Scoring for an Order",
    description="Synthesizes arrival delay, turnaround inflation, and depot concurrency into an explainable 0-100 risk score.",
)
def get_order_risk_score(
    order_id: str,
    prediction_service: PredictionService = Depends(get_prediction_service),
) -> OrderRiskResponse:
    res = prediction_service.get_order_risk_score(order_id)
    if res.status == "PREDICTION_UNAVAILABLE" and "not found" in (res.reason or "").lower():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_id}' was not found in the operational database.",
        )
    return res


@router.get(
    "/depots/{depot_id}/risk",
    response_model=DepotRiskResponse,
    summary="Get Aggregated Operational Risk for a Depot",
    description="Evaluates depot-wide operational congestion, staging queue concurrency, and overall loading risk profile.",
)
def get_depot_risk_score(
    depot_id: str,
    prediction_service: PredictionService = Depends(get_prediction_service),
) -> DepotRiskResponse:
    res = prediction_service.get_depot_risk_score(depot_id)
    if res.status == "PREDICTION_UNAVAILABLE" and "not found" in (res.reason or "").lower():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Depot '{depot_id}' was not found in the operational database.",
        )
    return res
