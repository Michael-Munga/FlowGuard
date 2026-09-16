"""Truck and Loading Position fleet & infrastructure models."""

from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, SourceTraceabilityMixin


class Truck(Base, SourceTraceabilityMixin):
    """Certified road fuel tanker fleet dimension."""
    __tablename__ = "trucks"

    truck_id = Column(String(32), primary_key=True)
    registration = Column(String(32), nullable=False, unique=True, index=True)
    trailer_registration = Column(String(32), nullable=False)
    transporter_name = Column(String(128), nullable=False)
    driver_name = Column(String(128), nullable=False)
    driver_national_id = Column(String(32), nullable=False)
    capacity_litres = Column(Integer, nullable=False)
    compartments_count = Column(Integer, nullable=False)
    tare_weight_kg = Column(Integer, nullable=False)
    vehicle_type = Column(String(64), nullable=False)
    active_status = Column(String(32), nullable=False, default="ACTIVE")

    # Relationships
    loading_orders = relationship("LoadingOrder", back_populates="truck")
    gate_events = relationship("GateEvent", back_populates="truck")

    __table_args__ = (
        Index("ix_trucks_active_status", "active_status"),
        Index("ix_trucks_transporter", "transporter_name"),
    )


class LoadingPosition(Base, SourceTraceabilityMixin):
    """Gantry bay loading position hardware topology."""
    __tablename__ = "loading_positions"

    loading_position_id = Column(String(32), primary_key=True)
    depot_id = Column(String(32), ForeignKey("depots.depot_id"), nullable=False)
    code = Column(String(16), nullable=False)
    bay_number = Column(Integer, nullable=False)
    product_compatibility = Column(String(128), nullable=False)
    has_dual_arm = Column(Boolean, nullable=False, default=False)
    standard_flow_rate_lpm = Column(Integer, nullable=False)
    is_high_velocity = Column(Boolean, nullable=False, default=False)

    # Relationships
    depot = relationship("Depot", back_populates="loading_positions")
    loading_events = relationship("LoadingEvent", back_populates="loading_position")
    equipment_events = relationship("EquipmentEvent", back_populates="loading_position")

    __table_args__ = (
        Index("ix_loading_positions_depot_id", "depot_id"),
        Index("ix_loading_positions_bay_number", "depot_id", "bay_number"),
    )
