"""Depot, OMC, and Product master dimension models."""

from sqlalchemy import Column, String, Integer, Numeric, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, SourceTraceabilityMixin


class Depot(Base, SourceTraceabilityMixin):
    """KPC bulk petroleum depot master dimension."""
    __tablename__ = "depots"

    depot_id = Column(String(32), primary_key=True)
    name = Column(String(128), nullable=False)
    code = Column(String(16), nullable=False, unique=True)
    region = Column(String(64), nullable=False)
    total_positions = Column(Integer, nullable=False)
    baseline_turnaround_min = Column(Integer, nullable=False)
    operating_hours_open = Column(String(16), nullable=False)
    operating_hours_close = Column(String(16), nullable=False)

    # Relationships
    omcs = relationship("OMC", back_populates="primary_depot")
    loading_positions = relationship("LoadingPosition", back_populates="depot", cascade="all, delete-orphan")
    loading_orders = relationship("LoadingOrder", back_populates="depot")
    risk_events = relationship("RiskEvent", back_populates="depot")
    decisions = relationship("Decision", back_populates="depot")


class OMC(Base, SourceTraceabilityMixin):
    """Oil Marketing Company (OMC) master dimension."""
    __tablename__ = "omcs"

    omc_id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    short_name = Column(String(64), nullable=False)
    account_code = Column(String(64), nullable=False, unique=True)
    primary_depot_id = Column(String(32), ForeignKey("depots.depot_id"), nullable=False)
    contact_email = Column(String(128), nullable=False)
    volume_tier = Column(String(32), nullable=False)

    # Relationships
    primary_depot = relationship("Depot", back_populates="omcs")
    loading_orders = relationship("LoadingOrder", back_populates="omc")
    notifications = relationship("Notification", back_populates="omc")

    __table_args__ = (
        Index("ix_omcs_primary_depot_id", "primary_depot_id"),
        Index("ix_omcs_volume_tier", "volume_tier"),
    )


class Product(Base, SourceTraceabilityMixin):
    """Refined petroleum and aviation fuel product master dimension."""
    __tablename__ = "products"

    product_id = Column(String(16), primary_key=True)
    code = Column(String(16), nullable=False, unique=True)
    name = Column(String(128), nullable=False)
    density_kg_per_l = Column(Numeric(6, 4), nullable=False)
    standard_flow_rate_lpm = Column(Integer, nullable=False)
    is_hazardous_priority = Column(Boolean, nullable=False, default=False)
    compatible_bays_desc = Column(String(255), nullable=True)

    # Relationships
    loading_orders = relationship("LoadingOrder", back_populates="product")
    product_readiness_events = relationship("ProductReadinessEvent", back_populates="product")
