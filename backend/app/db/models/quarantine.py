"""Data quality quarantine records model."""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import relationship
from backend.app.db.base import Base


class QuarantineRecord(Base):
    """Quarantine store for records failing data quality or schema constraints."""
    __tablename__ = "quarantine_records"

    quarantine_id = Column(String(64), primary_key=True)
    run_id = Column(String(64), ForeignKey("etl_runs.run_id"), nullable=False)
    source_table = Column(String(64), nullable=False)
    source_row_id = Column(String(64), nullable=True)
    failure_reason = Column(Text, nullable=False)
    validation_rule = Column(String(128), nullable=False)
    raw_record = Column(Text, nullable=False)  # JSON-encoded raw string
    quarantined_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    etl_run = relationship("ETLRun", back_populates="quarantine_records")

    __table_args__ = (
        Index("ix_quarantine_run_table", "run_id", "source_table"),
        Index("ix_quarantine_rule", "validation_rule"),
    )
