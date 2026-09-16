"""All FlowGuard database models exported for Alembic and repository access."""

from backend.app.db.base import Base, SourceTraceabilityMixin
from backend.app.db.models.depot import Depot, OMC, Product
from backend.app.db.models.truck import Truck, LoadingPosition
from backend.app.db.models.loading_order import LoadingOrder
from backend.app.db.models.gate_event import GateEvent
from backend.app.db.models.validation_event import ValidationEvent
from backend.app.db.models.staging_event import StagingEvent
from backend.app.db.models.loading_event import LoadingEvent
from backend.app.db.models.equipment_event import EquipmentEvent
from backend.app.db.models.product_readiness import ProductReadinessEvent
from backend.app.db.models.arrival_signal import ArrivalSignal
from backend.app.db.models.notification import Notification
from backend.app.db.models.risk_event import RiskEvent
from backend.app.db.models.decision import Decision
from backend.app.db.models.decision_stage import DecisionStage
from backend.app.db.models.autonomous_action import AutonomousAction
from backend.app.db.models.verification_event import VerificationEvent
from backend.app.db.models.audit_event import AuditEvent
from backend.app.db.models.etl_run import ETLRun
from backend.app.db.models.quarantine import QuarantineRecord
from backend.app.db.models.current_state import (
    CurrentDepotState,
    CurrentLoadingPositionState,
    CurrentOrderState,
)

__all__ = [
    "Base",
    "SourceTraceabilityMixin",
    "Depot",
    "OMC",
    "Product",
    "Truck",
    "LoadingPosition",
    "LoadingOrder",
    "GateEvent",
    "ValidationEvent",
    "StagingEvent",
    "LoadingEvent",
    "EquipmentEvent",
    "ProductReadinessEvent",
    "ArrivalSignal",
    "Notification",
    "RiskEvent",
    "Decision",
    "DecisionStage",
    "AutonomousAction",
    "VerificationEvent",
    "AuditEvent",
    "ETLRun",
    "QuarantineRecord",
    "CurrentDepotState",
    "CurrentLoadingPositionState",
    "CurrentOrderState",
]
