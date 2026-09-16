"""ETL run execution tracking model."""

from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.orm import relationship
from backend.app.db.base import Base


class ETLRun(Base):
    """Metadata tracking batch ETL executions for provenance and monitoring."""
    __tablename__ = "etl_runs"

    run_id = Column(String(64), primary_key=True)
    start_time = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(32), nullable=False, default="RUNNING")  # RUNNING, SUCCESS, FAILED
    source_version = Column(String(64), nullable=False)
    rows_read = Column(Integer, nullable=False, default=0)
    rows_loaded = Column(Integer, nullable=False, default=0)
    rows_quarantined = Column(Integer, nullable=False, default=0)
    error_count = Column(Integer, nullable=False, default=0)
    summary = Column(Text, nullable=True)

    # Relationships
    quarantine_records = relationship("QuarantineRecord", back_populates="etl_run", cascade="all, delete-orphan")
