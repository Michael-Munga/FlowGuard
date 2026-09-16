"""Cryptographic audit ledger model."""

from sqlalchemy import Column, String, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, SourceTraceabilityMixin


class AuditEvent(Base, SourceTraceabilityMixin):
    """Immutable audit entry with SHA-256 integrity hash for autonomous actions."""
    __tablename__ = "audit_events"

    audit_event_id = Column(String(32), primary_key=True)
    decision_id = Column(String(32), ForeignKey("decisions.decision_id"), nullable=False)
    action_id = Column(String(32), ForeignKey("autonomous_actions.action_id"), nullable=False)
    audit_timestamp = Column(DateTime(timezone=True), nullable=False)
    actor = Column(String(64), nullable=False)
    event_type = Column(String(64), nullable=False)
    control_state = Column(String(32), nullable=False)
    audit_reference_sha256 = Column(String(64), nullable=False)
    verification_digest = Column(Text, nullable=False)

    # Relationships
    decision = relationship("Decision", back_populates="audits")
    action = relationship("AutonomousAction", back_populates="audit_events")

    __table_args__ = (
        Index("ix_audit_events_decision_time", "decision_id", "audit_timestamp"),
        Index("ix_audit_events_sha256", "audit_reference_sha256"),
    )
