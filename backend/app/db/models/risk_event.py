"""Predictive risk and congestion detection event model."""

from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, SourceTraceabilityMixin


class RiskEvent(Base, SourceTraceabilityMixin):
    """FlowGuard predictive risk event (turnaround delay, demurrage exposure, bay congestion)."""
    __tablename__ = "risk_events"

    risk_event_id = Column(String(32), primary_key=True)
    depot_id = Column(String(32), ForeignKey("depots.depot_id"), nullable=False)
    detected_at = Column(DateTime(timezone=True), nullable=False)
    risk_category = Column(String(64), nullable=False)
    severity = Column(String(32), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    predicted_turnaround_min = Column(Integer, nullable=False)
    baseline_turnaround_min = Column(Integer, nullable=False)
    dwell_delta_min = Column(Integer, nullable=False)
    exposure_at_risk_kes = Column(Numeric(14, 2), nullable=False)
    primary_root_cause = Column(String(255), nullable=False)
    affected_orders_count = Column(Integer, nullable=False, default=1)
    status = Column(String(32), nullable=False, default="ACTIVE")  # ACTIVE, MITIGATED, RESOLVED

    # Relationships
    depot = relationship("Depot", back_populates="risk_events")
    decisions = relationship("Decision", back_populates="risk_event")

    __table_args__ = (
        Index("ix_risk_events_depot_status_time", "depot_id", "status", "detected_at"),
        Index("ix_risk_events_severity", "severity"),
        Index(
            "ix_active_risks_partial",
            "depot_id",
            "detected_at",
            postgresql_where=(status == "ACTIVE")
        ),
    )
