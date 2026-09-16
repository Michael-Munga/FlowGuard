"""Physical security, RFID, and weighbridge gate movements."""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, SourceTraceabilityMixin


class GateEvent(Base, SourceTraceabilityMixin):
    """Depot perimeter gate entry, tare weighing, gross weighing, and departure events."""
    __tablename__ = "gate_events"

    gate_event_id = Column(String(32), primary_key=True)
    order_id = Column(String(32), ForeignKey("loading_orders.order_id"), nullable=False)
    depot_id = Column(String(32), ForeignKey("depots.depot_id"), nullable=False)
    truck_id = Column(String(32), ForeignKey("trucks.truck_id"), nullable=False)
    event_type = Column(String(32), nullable=False)  # ARRIVAL, ENTRY_WEIGHING, EXIT_WEIGHING, DEPARTURE
    event_timestamp = Column(DateTime(timezone=True), nullable=False)
    tare_weight_kg = Column(Integer, nullable=False, default=0)
    gross_weight_kg = Column(Integer, nullable=False, default=0)
    rfid_transponder_id = Column(String(64), nullable=False)
    gate_lane = Column(String(32), nullable=False)

    # Relationships
    order = relationship("LoadingOrder", back_populates="gate_events")
    truck = relationship("Truck", back_populates="gate_events")

    __table_args__ = (
        Index("ix_gate_events_order_time", "order_id", "event_timestamp"),
        Index("ix_gate_events_depot_time", "depot_id", "event_timestamp"),
        Index("ix_gate_events_truck_time", "truck_id", "event_timestamp"),
        Index("ix_gate_events_type_time", "depot_id", "event_type", "event_timestamp"),
    )
