"""Yard staging queue progression and deconfliction event model."""

from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, SourceTraceabilityMixin


class StagingEvent(Base, SourceTraceabilityMixin):
    """Yard marshalling and staging area queue duration event."""
    __tablename__ = "staging_events"

    staging_id = Column(String(32), primary_key=True)
    order_id = Column(String(32), ForeignKey("loading_orders.order_id"), nullable=False)
    depot_id = Column(String(32), ForeignKey("depots.depot_id"), nullable=False)
    staging_area_id = Column(String(64), nullable=False)
    queue_entry_time = Column(DateTime(timezone=True), nullable=False)
    queue_exit_time = Column(DateTime(timezone=True), nullable=True)
    wait_duration_minutes = Column(Numeric(6, 2), nullable=True)
    queue_reason = Column(String(128), nullable=False)
    initial_predicted_wait_min = Column(Numeric(6, 2), nullable=True)

    # Relationships
    order = relationship("LoadingOrder", back_populates="staging_events")

    __table_args__ = (
        Index("ix_staging_order_id", "order_id"),
        Index("ix_staging_depot_entry", "depot_id", "queue_entry_time"),
        Index("ix_staging_area_depot", "depot_id", "staging_area_id"),
    )
