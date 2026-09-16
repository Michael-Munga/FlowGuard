"""Risk service orchestrating predictive turnaround and congestion risk queries."""

from typing import Optional, List
from sqlalchemy.orm import Session
from backend.app.repositories.risk_repository import RiskRepository
from backend.app.schemas.risk import RiskEventResponse, ActiveRisksSummaryResponse
from backend.app.services.exceptions import EntityNotFoundError


class RiskService:
    """Service layer for predictive risk monitoring."""

    def __init__(self, session: Session):
        self.repo = RiskRepository(session)

    def get_active_risks(self, depot_id: Optional[str] = None) -> ActiveRisksSummaryResponse:
        """Fetch active congestion and turnaround risks across depots."""
        risks = self.repo.get_active_risks(depot_id=depot_id)
        summary = self.repo.get_active_risk_summary()

        items = [
            RiskEventResponse(
                risk_event_id=r.risk_event_id,
                depot_id=r.depot_id,
                detected_at=r.detected_at.isoformat(),
                risk_category=r.risk_category,
                severity=r.severity,
                predicted_turnaround_min=r.predicted_turnaround_min,
                baseline_turnaround_min=r.baseline_turnaround_min,
                dwell_delta_min=r.dwell_delta_min,
                exposure_at_risk_kes=float(r.exposure_at_risk_kes),
                primary_root_cause=r.primary_root_cause,
                affected_orders_count=r.affected_orders_count,
                status=r.status,
            )
            for r in risks
        ]

        return ActiveRisksSummaryResponse(
            total_active_risks=len(items),
            severity_counts=summary["severity_counts"],
            total_exposure_at_risk_kes=summary["total_exposure_at_risk_kes"],
            items=items,
        )

    def get_risk_by_id(self, risk_id: str) -> RiskEventResponse:
        """Fetch a specific risk event by ID."""
        detail = self.repo.get_risk_detail(risk_id)
        if not detail:
            raise EntityNotFoundError("RiskEvent", risk_id)
        return RiskEventResponse(**detail)
