"""Prediction and Risk Intelligence Service Layer.

Orchestrates ML feature extraction, model inference, gate-out synthesis, and operational risk scoring.
"""

import logging
from typing import Dict, Any
from sqlalchemy import Engine

from backend.app.schemas.prediction import (
    ArrivalPredictionResponse,
    TurnaroundPredictionResponse,
    GateOutPredictionResponse,
    OrderRiskResponse,
    DepotRiskResponse,
)
from backend.ml.inference.arrival_predictor import ArrivalPredictor
from backend.ml.inference.turnaround_predictor import TurnaroundPredictor
from backend.ml.inference.gate_out_predictor import GateOutPredictor
from backend.ml.inference.risk_scorer import RiskScorer

logger = logging.getLogger("flowguard.services.prediction")


class PredictionService:
    """High-level service coordinating online ML inference and risk intelligence."""

    def __init__(self, engine: Engine):
        self.engine = engine
        self.arrival_predictor = ArrivalPredictor(engine)
        self.turnaround_predictor = TurnaroundPredictor(engine)
        self.gate_out_predictor = GateOutPredictor(engine)
        self.risk_scorer = RiskScorer(engine)

    def get_arrival_prediction(self, order_id: str) -> ArrivalPredictionResponse:
        """Fetch real-time arrival prediction for an order."""
        res = self.arrival_predictor.predict_arrival(order_id)
        return ArrivalPredictionResponse(**res)

    def get_turnaround_prediction(self, order_id: str) -> TurnaroundPredictionResponse:
        """Fetch real-time turnaround prediction for an order."""
        res = self.turnaround_predictor.predict_turnaround(order_id)
        return TurnaroundPredictionResponse(**res)

    def get_gate_out_prediction(self, order_id: str) -> GateOutPredictionResponse:
        """Fetch predicted Gate-Out completion for an order."""
        res = self.gate_out_predictor.predict_gate_out(order_id)
        return GateOutPredictionResponse(**res)

    def get_order_risk_score(self, order_id: str) -> OrderRiskResponse:
        """Fetch synthesized operational risk scoring for an order."""
        res = self.risk_scorer.assess_order_risk(order_id)
        return OrderRiskResponse(**res)

    def get_depot_risk_score(self, depot_id: str) -> DepotRiskResponse:
        """Fetch aggregate operational risk profile for a KPC depot."""
        res = self.risk_scorer.assess_depot_risk(depot_id)
        return DepotRiskResponse(**res)
