"""Terminal equipment status and maintenance event model."""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, SourceTraceabilityMixin


class EquipmentEvent(Base, SourceTraceabilityMixin):
    """Loading arm, positive displacement pump, and vapor recovery unit operational status."""
    __tablename__ = "equipment_events"

    equipment_event_id = Column(String(32), primary_key=True)
    depot_id = Column(String(32), ForeignKey("depots.depot_id"), nullable=False)
    loading_position_id = Column(String(32), ForeignKey("loading_positions.loading_position_id"), nullable=True)
    equipment_category = Column(String(64), nullable=False)
    component_name = Column(String(128), nullable=False)
    status = Column(String(32), nullable=False)
    event_timestamp = Column(DateTime(timezone=True), nullable=False)
    resolved_timestamp = Column(DateTime(timezone=True), nullable=True)
    flow_impact_pct = Column(Integer, nullable=False, default=0)
    operational_notes = Column(String(255), nullable=True)

    # Relationships
    loading_position = relationship("LoadingPosition", back_populates="equipment_events")

    __table_args__ = (
        Index("ix_equipment_depot_status", "depot_id", "status"),
        Index("ix_equipment_timestamp", "depot_id", "event_timestamp"),
        Index("ix_equipment_position", "loading_position_id"),
    )
