"""Risk repository for predictive congestion and turnaround delay queries."""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, desc, func
from backend.app.repositories.base import BaseRepository
from backend.app.db.models import RiskEvent


class RiskRepository(BaseRepository[RiskEvent]):
    """Repository handling predictive risk and congestion detection event queries."""

    def __init__(self, session: Session):
        super().__init__(RiskEvent, session)

    def get_active_risks(self, depot_id: Optional[str] = None) -> List[RiskEvent]:
        """Fetch active risks, optionally filtered by depot, utilizing the partial index."""
        conditions = [RiskEvent.status.in_(["ACTIVE", "MONITORING"])]
        if depot_id:
            conditions.append(RiskEvent.depot_id == depot_id)

        stmt = (
            select(RiskEvent)
            .where(and_(*conditions))
            .order_by(desc(RiskEvent.detected_at))
        )
        return list(self.session.scalars(stmt).all())

    def get_risk_detail(self, risk_id: str) -> Optional[Dict[str, Any]]:
        """Fetch detailed information for a specific risk event."""
        risk = self.get_by_id(risk_id)
        if not risk:
            return None

        return {
            "risk_event_id": risk.risk_event_id,
            "depot_id": risk.depot_id,
            "detected_at": risk.detected_at.isoformat(),
            "risk_category": risk.risk_category,
            "severity": risk.severity,
            "predicted_turnaround_min": risk.predicted_turnaround_min,
            "baseline_turnaround_min": risk.baseline_turnaround_min,
            "dwell_delta_min": risk.dwell_delta_min,
            "exposure_at_risk_kes": float(risk.exposure_at_risk_kes),
            "primary_root_cause": risk.primary_root_cause,
            "affected_orders_count": risk.affected_orders_count,
            "status": risk.status,
        }

    def get_active_risk_summary(self) -> Dict[str, Any]:
        """Aggregate active risk counts by severity across the entire KPC network."""
        stmt = (
            select(RiskEvent.severity, func.count(RiskEvent.risk_event_id))
            .where(RiskEvent.status.in_(["ACTIVE", "MONITORING"]))
            .group_by(RiskEvent.severity)
        )
        severity_counts = dict(self.session.execute(stmt).all())
        total_active = sum(severity_counts.values())

        exposure_stmt = select(func.sum(RiskEvent.exposure_at_risk_kes)).where(RiskEvent.status.in_(["ACTIVE", "MONITORING"]))
        total_exposure = self.session.scalar(exposure_stmt) or 0

        return {
            "total_active_risks": total_active,
            "severity_counts": severity_counts,
            "total_exposure_at_risk_kes": float(total_exposure),
        }
