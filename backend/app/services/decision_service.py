"""Decision service orchestrating autonomous control traces and 8-stage logs."""

from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from backend.app.repositories.decision_repository import DecisionRepository
from backend.app.db.models import Decision
from backend.app.schemas.common import PaginationMetadata, PaginatedResponse
from backend.app.schemas.decision import (
    DecisionSummary,
    DecisionStageResponse,
    AutonomousActionResponse,
    VerificationResponse,
    AuditResponse,
    DecisionTraceResponse,
    AutonomyStatsResponse,
)
from backend.app.services.exceptions import EntityNotFoundError


class DecisionService:
    """Service layer for autonomous decisions and closed-loop verifications."""

    def __init__(self, session: Session):
        self.session = session
        self.repo = DecisionRepository(session)

    def get_decision_trace(self, decision_id: str) -> DecisionTraceResponse:
        """Fetch complete 8-stage decision trace with actuation, verification, and audit hash."""
        raw = self.repo.get_decision_full_trace(decision_id)
        if not raw:
            raise EntityNotFoundError("Decision", decision_id)

        stages = [DecisionStageResponse(**s) for s in raw.get("stages", [])]
        action = AutonomousActionResponse(**raw["action"]) if raw.get("action") else None
        verification = VerificationResponse(**raw["verification"]) if raw.get("verification") else None
        audit = AuditResponse(**raw["audit"]) if raw.get("audit") else None

        return DecisionTraceResponse(
            decision_id=raw["decision_id"],
            depot_id=raw["depot_id"],
            depot_name=raw["depot_name"],
            decision_timestamp=raw["decision_timestamp"],
            headline=raw["headline"],
            autonomy_level=raw["autonomy_level"],
            decision_status=raw["decision_status"],
            selected_candidate_id=raw["selected_candidate_id"],
            target_orders_count=raw["target_orders_count"],
            stages=stages,
            action=action,
            verification=verification,
            audit=audit,
        )

    def list_decisions(
        self,
        depot_id: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> PaginatedResponse[DecisionSummary]:
        """Fetch paginated decisions, optionally filtered by depot."""
        bounded_limit = min(max(1, limit), 100)
        bounded_offset = max(0, offset)

        decisions = self.repo.list_decisions(depot_id=depot_id, limit=bounded_limit, offset=bounded_offset)

        conditions = []
        if depot_id:
            conditions.append(Decision.depot_id == depot_id)
        total_stmt = select(func.count(Decision.decision_id))
        if conditions:
            total_stmt = total_stmt.where(and_(*conditions))
        total = self.session.scalar(total_stmt) or 0

        items = [
            DecisionSummary(
                decision_id=d.decision_id,
                depot_id=d.depot_id,
                decision_timestamp=d.decision_timestamp.isoformat(),
                headline=d.headline,
                autonomy_level=d.autonomy_level,
                decision_status=d.decision_status,
                selected_candidate_id=d.selected_candidate_id,
                target_orders_count=d.target_orders_count,
            )
            for d in decisions
        ]

        has_more = (bounded_offset + len(items)) < total

        return PaginatedResponse[DecisionSummary](
            items=items,
            pagination=PaginationMetadata(
                limit=bounded_limit,
                offset=bounded_offset,
                total=total,
                has_more=has_more,
            ),
        )

    def get_autonomy_stats(self) -> AutonomyStatsResponse:
        """Fetch aggregate autonomy distribution and realized savings."""
        stats = self.repo.get_autonomy_stats()
        return AutonomyStatsResponse(**stats)
