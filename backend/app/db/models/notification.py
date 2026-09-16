"""Operational notification and driver/OMC dispatch messaging model."""

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, SourceTraceabilityMixin


class Notification(Base, SourceTraceabilityMixin):
    """Real-time operational dispatch messages sent to drivers and OMC coordinators."""
    __tablename__ = "notifications"

    notification_id = Column(String(32), primary_key=True)
    order_id = Column(String(32), ForeignKey("loading_orders.order_id"), nullable=True)
    omc_id = Column(String(64), ForeignKey("omcs.omc_id"), nullable=False)
    depot_id = Column(String(32), ForeignKey("depots.depot_id"), nullable=False)
    recipient_role = Column(String(32), nullable=False)  # DRIVER, OMC_DISPATCHER, KPC_OPERATOR
    notification_type = Column(String(64), nullable=False)
    priority = Column(String(32), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    previous_timing = Column(String(128), nullable=True)
    new_timing = Column(String(128), nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    requires_acknowledgement = Column(Boolean, nullable=False, default=False)
    is_acknowledged = Column(Boolean, nullable=False, default=False)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    order = relationship("LoadingOrder", back_populates="notifications")
    omc = relationship("OMC", back_populates="notifications")

    __table_args__ = (
        Index("ix_notifications_omc_time", "omc_id", "timestamp"),
        Index("ix_notifications_depot_time", "depot_id", "timestamp"),
        Index("ix_notifications_order_id", "order_id"),
        Index("ix_notifications_priority", "priority"),
    )
