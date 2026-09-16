"""Autonomous decision ledger model."""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, SourceTraceabilityMixin


class Decision(Base, SourceTraceabilityMixin):
    """FlowGuard autonomous dispatch intervention and optimization decision."""
    __tablename__ = "decisions"

    decision_id = Column(String(32), primary_key=True)
    risk_event_id = Column(String(32), ForeignKey("risk_events.risk_event_id"), nullable=True)
    depot_id = Column(String(32), ForeignKey("depots.depot_id"), nullable=False)
    decision_timestamp = Column(DateTime(timezone=True), nullable=False)
    headline = Column(String(255), nullable=False)
    autonomy_level = Column(String(32), nullable=False)  # L1_RECOMMENDATION, L2_AUTO_EXECUTABLE, L3_SUPERVISED_APPROVAL
    decision_status = Column(String(32), nullable=False)  # EXECUTED, SUPERSEDED, REJECTED
    selected_candidate_id = Column(String(32), nullable=True)
    policy_rule_id = Column(String(32), nullable=True)
    target_orders_count = Column(Integer, nullable=False, default=1)

    # Relationships
    depot = relationship("Depot", back_populates="decisions")
    risk_event = relationship("RiskEvent", back_populates="decisions")
    stages = relationship("DecisionStage", back_populates="decision", cascade="all, delete-orphan")
    actions = relationship("AutonomousAction", back_populates="decision", cascade="all, delete-orphan")
    verifications = relationship("VerificationEvent", back_populates="decision")
    audits = relationship("AuditEvent", back_populates="decision")

    __table_args__ = (
        Index("ix_decisions_depot_status_time", "depot_id", "decision_status", "decision_timestamp"),
        Index("ix_decisions_autonomy_level", "autonomy_level"),
        Index("ix_decisions_risk_id", "risk_event_id"),
    )
