"""Autonomous subsystem control action execution model."""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, SourceTraceabilityMixin


class AutonomousAction(Base, SourceTraceabilityMixin):
    """Subsystem actuation command dispatched to terminal hardware gateways."""
    __tablename__ = "autonomous_actions"

    action_id = Column(String(32), primary_key=True)
    decision_id = Column(String(32), ForeignKey("decisions.decision_id"), nullable=False)
    depot_id = Column(String(32), ForeignKey("depots.depot_id"), nullable=False)
    action_type = Column(String(64), nullable=False)
    control_state = Column(String(32), nullable=False)  # DISPATCHED, ACKNOWLEDGED, VERIFIED
    target_device_interface = Column(String(128), nullable=False)
    dispatched_at = Column(DateTime(timezone=True), nullable=False)
    ack_latency_ms = Column(Integer, nullable=False, default=0)
    execution_result = Column(String(64), nullable=False)

    # Relationships
    decision = relationship("Decision", back_populates="actions")
    verification_events = relationship("VerificationEvent", back_populates="action")
    audit_events = relationship("AuditEvent", back_populates="action")

    __table_args__ = (
        Index("ix_autonomous_actions_depot_state", "depot_id", "control_state"),
        Index("ix_autonomous_actions_decision_id", "decision_id"),
    )
