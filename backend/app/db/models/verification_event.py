"""Closed-loop post-action empirical verification model."""

from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, SourceTraceabilityMixin


class VerificationEvent(Base, SourceTraceabilityMixin):
    """Empirical verification record quantifying counterfactual turnaround savings and ROI."""
    __tablename__ = "verification_events"

    verification_id = Column(String(32), primary_key=True)
    decision_id = Column(String(32), ForeignKey("decisions.decision_id"), nullable=False)
    action_id = Column(String(32), ForeignKey("autonomous_actions.action_id"), nullable=False)
    verified_at = Column(DateTime(timezone=True), nullable=False)
    pre_intervention_turnaround_min = Column(Integer, nullable=False)
    post_intervention_turnaround_min = Column(Integer, nullable=False)
    expected_reduction_min = Column(Integer, nullable=False)
    observed_reduction_min = Column(Integer, nullable=False)
    recovery_attainment_pct = Column(Numeric(6, 2), nullable=False)
    verification_status = Column(String(32), nullable=False)  # VERIFIED_FULL, PARTIAL, DEGRADED
    exposure_protected_kes = Column(Numeric(14, 2), nullable=False)
    realized_savings_kes = Column(Numeric(14, 2), nullable=False)

    # Relationships
    decision = relationship("Decision", back_populates="verifications")
    action = relationship("AutonomousAction", back_populates="verification_events")

    __table_args__ = (
        Index("ix_verification_decision_id", "decision_id"),
        Index("ix_verification_action_id", "action_id"),
        Index("ix_verification_status", "verification_status"),
    )
