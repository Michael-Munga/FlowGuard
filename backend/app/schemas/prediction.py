"""Pydantic schemas for FlowGuard Machine Learning Predictions and Risk Scoring."""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class FeatureContribution(BaseModel):
    """Explainable feature contribution metadata."""
    feature_name: str = Field(..., description="Operational feature identifier")
    feature_value: str = Field(..., description="Observed value for this order")
    importance_weight: float = Field(..., description="Global feature importance weight")


class PredictionWindow(BaseModel):
    """Uncertainty margin and temporal prediction window."""
    window_start: Optional[str] = Field(None, description="Early bound of predicted window (ISO 8601)")
    window_end: Optional[str] = Field(None, description="Late bound of predicted window (ISO 8601)")
    margin_minutes: float = Field(..., description="Uncertainty margin in minutes")
    min_duration_minutes: Optional[float] = Field(None, description="Lower duration bound in minutes")
    max_duration_minutes: Optional[float] = Field(None, description="Upper duration bound in minutes")


class ArrivalPredictionResponse(BaseModel):
    """Payload for Order Arrival Prediction."""
    order_id: str = Field(..., description="Unique Loading Order identifier")
    status: str = Field(..., description="Prediction status: PREDICTION_AVAILABLE, PREDICTION_UNAVAILABLE, MODEL_UNAVAILABLE")
    reason: Optional[str] = Field(None, description="Failure reason if prediction unavailable")
    depot_id: Optional[str] = Field(None, description="Destination KPC depot identifier")
    omc_id: Optional[str] = Field(None, description="Ordering Oil Marketing Company")
    reference_time: Optional[str] = Field(None, description="Reference baseline timestamp")
    predicted_arrival_time: Optional[str] = Field(None, description="Predicted gate arrival timestamp (ISO 8601)")
    predicted_duration_minutes: Optional[float] = Field(None, description="Predicted minutes until gate arrival")
    prediction_window: Optional[PredictionWindow] = Field(None, description="Confidence interval and arrival window")
    confidence_pct: Optional[float] = Field(None, description="Prediction confidence score (0-100%)")
    baseline_duration_minutes: Optional[float] = Field(None, description="Planned scheduling lead time baseline")
    lead_time_variance_minutes: Optional[float] = Field(None, description="Predicted variance vs planned booking")
    top_features: List[FeatureContribution] = Field(default_factory=list, description="Top contributing feature signals")
    model_version: str = Field(default="v1.0.0", description="Model version tag")


class TurnaroundPredictionResponse(BaseModel):
    """Payload for Depot Turnaround Prediction."""
    order_id: str = Field(..., description="Unique Loading Order identifier")
    status: str = Field(..., description="Prediction status: PREDICTION_AVAILABLE, PREDICTION_UNAVAILABLE, MODEL_UNAVAILABLE")
    reason: Optional[str] = Field(None, description="Failure reason if prediction unavailable")
    depot_id: Optional[str] = Field(None, description="KPC terminal depot identifier")
    omc_id: Optional[str] = Field(None, description="Ordering Oil Marketing Company")
    product_id: Optional[str] = Field(None, description="Product grade")
    predicted_turnaround_minutes: Optional[float] = Field(None, description="Predicted Gate-In to Gate-Out duration")
    baseline_turnaround_minutes: Optional[float] = Field(None, description="KPC standard depot target turnaround")
    turnaround_delta_minutes: Optional[float] = Field(None, description="Predicted inflation above depot target")
    prediction_window: Optional[PredictionWindow] = Field(None, description="Duration prediction bounds")
    confidence_pct: Optional[float] = Field(None, description="Model confidence score")
    depot_active_trucks: Optional[int] = Field(None, description="Concurrent tankers inside depot at prediction time")
    bay_utilization_ratio: Optional[float] = Field(None, description="Depot bay capacity utilization ratio")
    top_features: List[FeatureContribution] = Field(default_factory=list, description="Top contributing feature signals")
    model_version: str = Field(default="v1.0.0", description="Model version tag")


class GateOutPredictionResponse(BaseModel):
    """Payload for Predicted Gate-Out timing."""
    order_id: str = Field(..., description="Unique Loading Order identifier")
    status: str = Field(..., description="Prediction status: PREDICTION_AVAILABLE, COMPLETED, PREDICTION_UNAVAILABLE")
    reason: Optional[str] = Field(None, description="Failure reason if prediction unavailable")
    operational_phase: Optional[str] = Field(None, description="Current operational state: IN_TRANSIT, INSIDE_DEPOT, GATED_OUT")
    depot_id: Optional[str] = Field(None, description="KPC terminal depot identifier")
    reference_arrival_time: Optional[str] = Field(None, description="Arrival timestamp used (actual or predicted)")
    predicted_turnaround_minutes: Optional[float] = Field(None, description="Predicted turnaround duration")
    predicted_gate_out_time: Optional[str] = Field(None, description="Predicted Gate-Out completion timestamp")
    actual_gate_out_time: Optional[str] = Field(None, description="Actual Gate-Out timestamp if order already finished")
    prediction_window: Optional[PredictionWindow] = Field(None, description="Estimated Gate-Out window")
    confidence_pct: Optional[float] = Field(None, description="Confidence percentage")
    calculation_formula: Optional[str] = Field(None, description="Formula applied (Arrival + Turnaround vs Gate-In + Turnaround)")
    message: Optional[str] = Field(None, description="Operational notes")
    model_version: str = Field(default="v1.0.0", description="Model version tag")


class OrderRiskResponse(BaseModel):
    """Payload for Order Operational Risk Scoring."""
    order_id: str = Field(..., description="Unique Loading Order identifier")
    status: str = Field(..., description="Assessment status: ASSESSMENT_AVAILABLE, PREDICTION_UNAVAILABLE")
    reason: Optional[str] = Field(None, description="Failure reason if unavailable")
    depot_id: Optional[str] = Field(None, description="KPC terminal depot identifier")
    depot_name: Optional[str] = Field(None, description="KPC terminal name")
    omc_id: Optional[str] = Field(None, description="Ordering Oil Marketing Company")
    risk_score: float = Field(..., description="Operational risk exposure score (0 - 100)")
    risk_level: str = Field(..., description="Operational risk tier: LOW, MEDIUM, HIGH, CRITICAL")
    risk_reasons: List[str] = Field(default_factory=list, description="Measurable underlying causal factors")
    predicted_turnaround_minutes: Optional[float] = Field(None, description="Predicted turnaround duration")
    predicted_gate_out_time: Optional[str] = Field(None, description="Predicted Gate-Out timestamp")
    bay_utilization_ratio: Optional[float] = Field(None, description="Depot bay capacity utilization ratio")
    assessed_at: str = Field(..., description="Assessment timestamp (ISO 8601)")
    model_version: str = Field(default="v1.0.0", description="Model version tag")


class DepotRiskResponse(BaseModel):
    """Payload for Depot Aggregated Operational Risk Profile."""
    depot_id: str = Field(..., description="KPC terminal depot identifier")
    depot_name: Optional[str] = Field(None, description="KPC terminal name")
    status: str = Field(..., description="Assessment status: ASSESSMENT_AVAILABLE, PREDICTION_UNAVAILABLE")
    reason: Optional[str] = Field(None, description="Failure reason if unavailable")
    risk_score: Optional[float] = Field(None, description="Depot operational risk exposure score (0 - 100)")
    risk_level: Optional[str] = Field(None, description="Operational risk tier: LOW, MEDIUM, HIGH, CRITICAL")
    active_orders_count: Optional[int] = Field(None, description="Total uncompleted orders for this depot")
    active_trucks_in_depot: Optional[int] = Field(None, description="Physical tankers inside terminal")
    total_positions: Optional[int] = Field(None, description="Total loading bays available")
    bay_utilization_ratio: Optional[float] = Field(None, description="Depot bay capacity utilization ratio")
    risk_reasons: List[str] = Field(default_factory=list, description="Measurable underlying causal factors")
    assessed_at: Optional[str] = Field(None, description="Assessment timestamp (ISO 8601)")
    model_version: str = Field(default="v1.0.0", description="Model version tag")
