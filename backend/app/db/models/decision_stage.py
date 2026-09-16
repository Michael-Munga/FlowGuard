"""8-stage autonomous decision execution pipeline model."""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, SourceTraceabilityMixin


class DecisionStage(Base, SourceTraceabilityMixin):
    """Discrete progression step within FlowGuard's 8-stage decision cycle."""
    __tablename__ = "decision_stages"

    stage_id = Column(String(32), primary_key=True)
    decision_id = Column(String(32), ForeignKey("decisions.decision_id"), nullable=False)
    stage_sequence = Column(Integer, nullable=False)  # 1 to 8
    stage_name = Column(String(32), nullable=False)  # SIGNAL, PREDICT, DIAGNOSE, OPTIMIZE, DECIDE, EXECUTE, VERIFY, LOG
    stage_timestamp = Column(DateTime(timezone=True), nullable=False)
    stage_status = Column(String(32), nullable=False)  # COMPLETED, IN_PROGRESS, FAILED
    metric_label = Column(String(128), nullable=True)
    metric_value = Column(String(255), nullable=True)
    payload_summary = Column(Text, nullable=True)

    # Relationships
    decision = relationship("Decision", back_populates="stages")

    __table_args__ = (
        Index("ix_decision_stages_decision_seq", "decision_id", "stage_sequence"),
        Index("ix_decision_stages_name", "stage_name"),
    )
