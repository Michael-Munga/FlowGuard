"""Loading Order core transactional model."""

from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, SourceTraceabilityMixin


class LoadingOrder(Base, SourceTraceabilityMixin):
    """KPC bulk petroleum loading authorization order."""
    __tablename__ = "loading_orders"

    order_id = Column(String(32), primary_key=True)
    omc_id = Column(String(64), ForeignKey("omcs.omc_id"), nullable=False)
    depot_id = Column(String(32), ForeignKey("depots.depot_id"), nullable=False)
    truck_id = Column(String(32), ForeignKey("trucks.truck_id"), nullable=False)
    product_id = Column(String(16), ForeignKey("products.product_id"), nullable=False)
    ordered_quantity_litres = Column(Numeric(12, 2), nullable=False)
    order_registered_time = Column(DateTime(timezone=True), nullable=False)
    expected_arrival_time = Column(DateTime(timezone=True), nullable=False)
    scheduled_window_start = Column(DateTime(timezone=True), nullable=False)
    scheduled_window_end = Column(DateTime(timezone=True), nullable=False)
    order_status = Column(String(32), nullable=False, default="REGISTERED")
    cancellation_reason = Column(String(255), nullable=True)

    # Relationships
    omc = relationship("OMC", back_populates="loading_orders")
    depot = relationship("Depot", back_populates="loading_orders")
    truck = relationship("Truck", back_populates="loading_orders")
    product = relationship("Product", back_populates="loading_orders")
    gate_events = relationship("GateEvent", back_populates="order", cascade="all, delete-orphan")
    validation_events = relationship("ValidationEvent", back_populates="order", cascade="all, delete-orphan")
    staging_events = relationship("StagingEvent", back_populates="order", cascade="all, delete-orphan")
    loading_events = relationship("LoadingEvent", back_populates="order", cascade="all, delete-orphan")
    arrival_signals = relationship("ArrivalSignal", back_populates="order", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="order")

    __table_args__ = (
        Index("ix_orders_depot_status", "depot_id", "order_status"),
        Index("ix_orders_omc_status", "omc_id", "order_status"),
        Index("ix_orders_depot_registered", "depot_id", "order_registered_time"),
        Index("ix_orders_truck_registered", "truck_id", "order_registered_time"),
        Index("ix_orders_expected_arrival", "depot_id", "expected_arrival_time"),
        Index(
            "ix_orders_active_depot",
            "depot_id",
            "order_registered_time",
            postgresql_where=(order_status.in_(["REGISTERED", "APPROACHING", "AT_GATE", "VALIDATED", "STAGING", "LOADING"]))
        ),
    )
