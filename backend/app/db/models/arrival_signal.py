"""Upstream telematics arrival signals and ETA predictions model."""

from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, SourceTraceabilityMixin


class ArrivalSignal(Base, SourceTraceabilityMixin):
    """GPS telematics and ETA prediction signals received prior to gate arrival."""
    __tablename__ = "arrival_signals"

    signal_id = Column(String(32), primary_key=True)
    order_id = Column(String(32), ForeignKey("loading_orders.order_id"), nullable=False)
    signal_source = Column(String(64), nullable=False)
    signal_timestamp = Column(DateTime(timezone=True), nullable=False)
    signal_quality = Column(String(32), nullable=False)
    estimated_distance_km = Column(Numeric(6, 2), nullable=False)
    predicted_arrival_window_start = Column(DateTime(timezone=True), nullable=False)
    predicted_arrival_window_end = Column(DateTime(timezone=True), nullable=False)
    confidence_pct = Column(Numeric(5, 2), nullable=False)

    # Relationships
    order = relationship("LoadingOrder", back_populates="arrival_signals")

    __table_args__ = (
        Index("ix_arrival_signals_order_time", "order_id", "signal_timestamp"),
        Index("ix_arrival_signals_timestamp", "signal_timestamp"),
    )
