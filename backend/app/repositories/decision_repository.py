"""Decision repository handling autonomous decision logs and 8-stage pipeline traces."""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, and_, desc, func
from backend.app.repositories.base import BaseRepository
from backend.app.db.models import (
    Decision,
    DecisionStage,
    AutonomousAction,
    VerificationEvent,
    AuditEvent,
)


class DecisionRepository(BaseRepository[Decision]):
    """Repository handling FlowGuard autonomous interventions, 8 stages, and verifications."""

    def __init__(self, session: Session):
        super().__init__(Decision, session)

    def get_decision_full_trace(self, decision_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a decision with its complete 8-stage trace, action, verification, and audit hash."""
        stmt = (
            select(Decision)
            .options(
                joinedload(Decision.depot),
                joinedload(Decision.stages),
                joinedload(Decision.actions),
            )
            .where(Decision.decision_id == decision_id)
        )
        decision = self.session.scalars(stmt).first()
        if not decision:
            return None

        # Fetch verification and audit records
        verification = (
            self.session.scalars(
                select(VerificationEvent).where(VerificationEvent.decision_id == decision_id)
            ).first()
        )
        audit = (
            self.session.scalars(
                select(AuditEvent).where(AuditEvent.decision_id == decision_id)
            ).first()
        )

        stages_sorted = sorted(decision.stages, key=lambda s: s.stage_sequence)
        primary_action = decision.actions[0] if decision.actions else None

        return {
            "decision_id": decision.decision_id,
            "depot_id": decision.depot_id,
            "depot_name": decision.depot.name if decision.depot else None,
            "decision_timestamp": decision.decision_timestamp.isoformat(),
            "headline": decision.headline,
            "autonomy_level": decision.autonomy_level,
            "decision_status": decision.decision_status,
            "selected_candidate_id": decision.selected_candidate_id,
            "target_orders_count": decision.target_orders_count,
            "stages": [
                {
                    "stage_sequence": s.stage_sequence,
                    "stage_name": s.stage_name,
                    "stage_status": s.stage_status,
                    "stage_timestamp": s.stage_timestamp.isoformat(),
                    "metric_label": s.metric_label,
                    "metric_value": s.metric_value,
                    "payload_summary": s.payload_summary,
                }
                for s in stages_sorted
            ],
            "action": {
                "action_id": primary_action.action_id,
                "action_type": primary_action.action_type,
                "control_state": primary_action.control_state,
                "target_device_interface": primary_action.target_device_interface,
                "dispatched_at": primary_action.dispatched_at.isoformat(),
                "execution_result": primary_action.execution_result,
            } if primary_action else None,
            "verification": {
                "verification_id": verification.verification_id,
                "baseline_turnaround_min": verification.pre_intervention_turnaround_min,
                "achieved_turnaround_min": verification.post_intervention_turnaround_min,
                "observed_reduction_min": verification.observed_reduction_min,
                "recovery_attainment_pct": float(verification.recovery_attainment_pct),
                "exposure_protected_kes": float(verification.exposure_protected_kes),
                "realized_savings_kes": float(verification.realized_savings_kes),
                "verification_status": verification.verification_status,
            } if verification else None,
            "audit": {
                "audit_event_id": audit.audit_event_id,
                "actor": audit.actor,
                "audit_reference_sha256": audit.audit_reference_sha256,
                "verification_digest": audit.verification_digest,
                "logged_at": audit.audit_timestamp.isoformat(),
            } if audit else None,
        }

    def list_decisions(
        self,
        depot_id: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> List[Decision]:
        """Fetch decisions bounded by pagination, ordered by latest timestamp."""
        bounded_limit = min(max(1, limit), 100)
        conditions = []
        if depot_id:
            conditions.append(Decision.depot_id == depot_id)

        stmt = select(Decision)
        if conditions:
            stmt = stmt.where(and_(*conditions))
        stmt = stmt.order_by(desc(Decision.decision_timestamp)).limit(bounded_limit).offset(max(0, offset))
        return list(self.session.scalars(stmt).all())

    def get_autonomy_stats(self) -> Dict[str, Any]:
        """Calculate autonomy level distribution and total verified economic savings."""
        stmt = (
            select(Decision.autonomy_level, func.count(Decision.decision_id))
            .group_by(Decision.autonomy_level)
        )
        autonomy_counts = dict(self.session.execute(stmt).all())

        savings_stmt = select(func.sum(VerificationEvent.realized_savings_kes))
        total_savings = self.session.scalar(savings_stmt) or 0

        return {
            "total_decisions": sum(autonomy_counts.values()),
            "autonomy_distribution": autonomy_counts,
            "total_realized_savings_kes": float(total_savings),
        }
