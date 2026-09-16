"""FastAPI dependency injection providers."""

from fastapi import Depends
from sqlalchemy.orm import Session
from backend.app.db.session import get_db, engine
from backend.app.services.depot_service import DepotService
from backend.app.services.order_service import OrderService
from backend.app.services.risk_service import RiskService
from backend.app.services.decision_service import DecisionService
from backend.app.services.metrics_service import MetricsService
from backend.app.services.prediction_service import PredictionService
from backend.app.services.optimization_service import OptimizationService


def get_depot_service(db: Session = Depends(get_db)) -> DepotService:
    return DepotService(db)


def get_order_service(db: Session = Depends(get_db)) -> OrderService:
    return OrderService(db)


def get_risk_service(db: Session = Depends(get_db)) -> RiskService:
    return RiskService(db)


def get_decision_service(db: Session = Depends(get_db)) -> DecisionService:
    return DecisionService(db)


def get_metrics_service(db: Session = Depends(get_db)) -> MetricsService:
    return MetricsService(db)


def get_prediction_service() -> PredictionService:
    return PredictionService(engine)


def get_optimization_service(
    db: Session = Depends(get_db),
    prediction_service: PredictionService = Depends(get_prediction_service),
) -> OptimizationService:
    return OptimizationService(db, prediction_service)
