"""Gantry meter loading execution event model."""

from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, SourceTraceabilityMixin


class LoadingEvent(Base, SourceTraceabilityMixin):
    """AccuLoad meter pumping execution, duration, flow rate, and dual-arm telemetry."""
    __tablename__ = "loading_events"

    loading_event_id = Column(String(32), primary_key=True)
    order_id = Column(String(32), ForeignKey("loading_orders.order_id"), nullable=False)
    depot_id = Column(String(32), ForeignKey("depots.depot_id"), nullable=False)
    loading_position_id = Column(String(32), ForeignKey("loading_positions.loading_position_id"), nullable=False)
    loading_start = Column(DateTime(timezone=True), nullable=False)
    loading_end = Column(DateTime(timezone=True), nullable=True)
    planned_quantity_litres = Column(Numeric(12, 2), nullable=False)
    actual_quantity_litres = Column(Numeric(12, 2), nullable=True)
    loading_duration_minutes = Column(Numeric(6, 2), nullable=True)
    avg_flow_rate_lpm = Column(Numeric(8, 2), nullable=True)
    dual_arm_used = Column(Boolean, nullable=False, default=False)
    loading_status = Column(String(32), nullable=False, default="COMPLETED")
    exception_reason = Column(String(255), nullable=True)

    # Relationships
    order = relationship("LoadingOrder", back_populates="loading_events")
    loading_position = relationship("LoadingPosition", back_populates="loading_events")

    __table_args__ = (
        Index("ix_loading_events_order_id", "order_id"),
        Index("ix_loading_events_depot_start", "depot_id", "loading_start"),
        Index("ix_loading_events_position_start", "loading_position_id", "loading_start"),
        Index("ix_loading_events_status", "loading_status"),
    )
