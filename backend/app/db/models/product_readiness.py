"""Tank farm inventory readiness and lab certification event model."""

from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, SourceTraceabilityMixin


class ProductReadinessEvent(Base, SourceTraceabilityMixin):
    """Bulk storage tank inventory availability and QA certification status."""
    __tablename__ = "product_readiness_events"

    readiness_id = Column(String(32), primary_key=True)
    depot_id = Column(String(32), ForeignKey("depots.depot_id"), nullable=False)
    product_id = Column(String(16), ForeignKey("products.product_id"), nullable=False)
    tank_id = Column(String(32), nullable=False)
    readiness_status = Column(String(32), nullable=False)
    certified_volume_litres = Column(Numeric(14, 2), nullable=False)
    event_timestamp = Column(DateTime(timezone=True), nullable=False)
    resolved_timestamp = Column(DateTime(timezone=True), nullable=True)
    constraint_reason = Column(String(255), nullable=True)

    # Relationships
    product = relationship("Product", back_populates="product_readiness_events")

    __table_args__ = (
        Index("ix_readiness_depot_product", "depot_id", "product_id"),
        Index("ix_readiness_status", "readiness_status"),
        Index("ix_readiness_timestamp", "depot_id", "event_timestamp"),
    )
