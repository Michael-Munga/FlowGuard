"""Pre-loading compliance check and document clearance event model."""

from sqlalchemy import Column, String, Numeric, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, SourceTraceabilityMixin


class ValidationEvent(Base, SourceTraceabilityMixin):
    """EPRA, customs, calibration, and electronic manifest validation check."""
    __tablename__ = "validation_events"

    validation_id = Column(String(32), primary_key=True)
    order_id = Column(String(32), ForeignKey("loading_orders.order_id"), nullable=False)
    depot_id = Column(String(32), ForeignKey("depots.depot_id"), nullable=False)
    validation_start = Column(DateTime(timezone=True), nullable=False)
    validation_end = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Numeric(6, 2), nullable=False)
    validation_outcome = Column(String(32), nullable=False)  # APPROVED, REJECTED, FLAGGED
    customs_status = Column(String(64), nullable=False)
    electronic_manifest_matched = Column(Boolean, nullable=False, default=True)
    exception_reason = Column(String(255), nullable=True)

    # Relationships
    order = relationship("LoadingOrder", back_populates="validation_events")

    __table_args__ = (
        Index("ix_validation_order_id", "order_id"),
        Index("ix_validation_depot_outcome", "depot_id", "validation_outcome"),
        Index("ix_validation_start_time", "depot_id", "validation_start"),
    )
