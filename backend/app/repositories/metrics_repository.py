"""Metrics repository computing SQL aggregations for Dashboard KPIs."""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from backend.app.db.models import (
    LoadingOrder,
    LoadingEvent,
    GateEvent,
    RiskEvent,
    Decision,
    VerificationEvent,
)


class MetricsRepository:
    """Computes bounded SQL aggregations and network-level KPIs without loading full tables."""

    def __init__(self, session: Session):
        self.session = session

    def get_network_kpis(self) -> Dict[str, Any]:
        """Compute high-level Network Command Centre and Executive metrics directly in SQL."""
        # 1. Total volume pumped (m³)
        vol_stmt = select(func.sum(LoadingEvent.actual_quantity_litres))
        total_litres = self.session.scalar(vol_stmt) or 0
        total_m3 = round(float(total_litres) / 1000.0, 1)

        # 2. Total orders and completed orders
        order_count_stmt = select(func.count(LoadingOrder.order_id))
        total_orders = self.session.scalar(order_count_stmt) or 0

        completed_stmt = select(func.count(LoadingOrder.order_id)).where(LoadingOrder.order_status == "COMPLETED")
        completed_orders = self.session.scalar(completed_stmt) or 0

        # 3. Average turnaround duration (mins) from completed loading events
        turnaround_stmt = select(func.avg(LoadingEvent.loading_duration_minutes)).where(
            LoadingEvent.loading_status == "COMPLETED"
        )
        avg_loading_duration = self.session.scalar(turnaround_stmt) or 0.0

        # 4. Total active risks & exposure
        risk_stmt = select(
            func.count(RiskEvent.risk_event_id),
            func.sum(RiskEvent.exposure_at_risk_kes),
        ).where(RiskEvent.status.in_(["ACTIVE", "MONITORING"]))
        active_risks, total_exposure = self.session.execute(risk_stmt).first()

        # 5. Verified autonomous savings
        savings_stmt = select(func.sum(VerificationEvent.realized_savings_kes))
        total_savings = self.session.scalar(savings_stmt) or 0

        return {
            "total_throughput_m3": total_m3,
            "total_orders": total_orders,
            "completed_orders": completed_orders,
            "avg_loading_duration_mins": round(float(avg_loading_duration), 1),
            "active_risks_count": active_risks or 0,
            "exposure_at_risk_kes": float(total_exposure or 0),
            "total_realized_savings_kes": float(total_savings or 0),
        }

    def get_depot_turnaround_summary(self, depot_id: str) -> Dict[str, Any]:
        """Compute average, min, and max loading duration for a specific depot."""
        stmt = select(
            func.avg(LoadingEvent.loading_duration_minutes),
            func.min(LoadingEvent.loading_duration_minutes),
            func.max(LoadingEvent.loading_duration_minutes),
            func.count(LoadingEvent.loading_event_id),
        ).where(
            and_(
                LoadingEvent.depot_id == depot_id,
                LoadingEvent.loading_status == "COMPLETED",
            )
        )
        avg_dur, min_dur, max_dur, count = self.session.execute(stmt).first()
        return {
            "depot_id": depot_id,
            "completed_loading_count": count or 0,
            "avg_duration_min": round(float(avg_dur), 1) if avg_dur is not None else 0.0,
            "min_duration_min": round(float(min_dur), 1) if min_dur is not None else 0.0,
            "max_duration_min": round(float(max_dur), 1) if max_dur is not None else 0.0,
        }
