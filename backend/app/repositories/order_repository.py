"""Order repository providing bounded queries for OMC and Depot order tracking."""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func, and_, desc
from backend.app.repositories.base import BaseRepository
from backend.app.db.models import (
    LoadingOrder,
    GateEvent,
    ValidationEvent,
    StagingEvent,
    LoadingEvent,
    ArrivalSignal,
)


class OrderRepository(BaseRepository[LoadingOrder]):
    """Repository handling loading order lifecycle, milestones, and filtered listings."""

    def __init__(self, session: Session):
        super().__init__(LoadingOrder, session)

    def get_order_with_lifecycle(self, order_id: str) -> Optional[Dict[str, Any]]:
        """Fetch full order detail and its complete milestone event trail in a single joined transaction."""
        stmt = (
            select(LoadingOrder)
            .options(
                joinedload(LoadingOrder.omc),
                joinedload(LoadingOrder.depot),
                joinedload(LoadingOrder.truck),
                joinedload(LoadingOrder.product),
            )
            .where(LoadingOrder.order_id == order_id)
        )
        order = self.session.scalars(stmt).first()
        if not order:
            return None

        # Fetch child events efficiently with index scans
        gate_events = (
            self.session.scalars(
                select(GateEvent)
                .where(GateEvent.order_id == order_id)
                .order_by(GateEvent.event_timestamp)
            ).all()
        )
        validation_event = (
            self.session.scalars(
                select(ValidationEvent).where(ValidationEvent.order_id == order_id)
            ).first()
        )
        staging_event = (
            self.session.scalars(
                select(StagingEvent).where(StagingEvent.order_id == order_id)
            ).first()
        )
        loading_event = (
            self.session.scalars(
                select(LoadingEvent).where(LoadingEvent.order_id == order_id)
            ).first()
        )
        arrival_signal = (
            self.session.scalars(
                select(ArrivalSignal)
                .where(ArrivalSignal.order_id == order_id)
                .order_by(desc(ArrivalSignal.signal_timestamp))
            ).first()
        )

        return {
            "order_id": order.order_id,
            "omc_id": order.omc_id,
            "omc_name": order.omc.name if order.omc else None,
            "depot_id": order.depot_id,
            "depot_name": order.depot.name if order.depot else None,
            "truck_id": order.truck_id,
            "truck_registration": order.truck.registration if order.truck else None,
            "driver_name": order.truck.driver_name if order.truck else None,
            "product_id": order.product_id,
            "product_name": order.product.name if order.product else None,
            "ordered_quantity_litres": float(order.ordered_quantity_litres),
            "order_registered_time": order.order_registered_time.isoformat() if order.order_registered_time else None,
            "expected_arrival_time": order.expected_arrival_time.isoformat() if order.expected_arrival_time else None,
            "order_status": order.order_status,
            "milestones": {
                "arrival_signal": {
                    "distance_km": float(arrival_signal.estimated_distance_km) if arrival_signal else None,
                    "confidence_pct": float(arrival_signal.confidence_pct) if arrival_signal else None,
                } if arrival_signal else None,
                "gate_events": [
                    {
                        "event_type": g.event_type,
                        "timestamp": g.event_timestamp.isoformat(),
                        "lane": g.gate_lane,
                    }
                    for g in gate_events
                ],
                "validation": {
                    "outcome": validation_event.validation_outcome,
                    "duration_minutes": float(validation_event.duration_minutes),
                    "customs_status": validation_event.customs_status,
                } if validation_event else None,
                "staging": {
                    "area": staging_event.staging_area_id,
                    "wait_duration_minutes": float(staging_event.wait_duration_minutes) if staging_event and staging_event.wait_duration_minutes else None,
                    "reason": staging_event.queue_reason if staging_event else None,
                } if staging_event else None,
                "loading": {
                    "position_id": loading_event.loading_position_id,
                    "actual_litres": float(loading_event.actual_quantity_litres) if loading_event and loading_event.actual_quantity_litres else None,
                    "duration_minutes": float(loading_event.loading_duration_minutes) if loading_event and loading_event.loading_duration_minutes else None,
                    "avg_flow_rate_lpm": float(loading_event.avg_flow_rate_lpm) if loading_event and loading_event.avg_flow_rate_lpm else None,
                    "dual_arm_used": loading_event.dual_arm_used if loading_event else False,
                } if loading_event else None,
            },
        }

    def list_depot_orders(
        self,
        depot_id: str,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[LoadingOrder]:
        """Fetch orders for a depot with optional status filtering, bounded by pagination."""
        bounded_limit = min(max(1, limit), 200)
        conditions = [LoadingOrder.depot_id == depot_id]
        if status:
            conditions.append(LoadingOrder.order_status == status)

        stmt = (
            select(LoadingOrder)
            .where(and_(*conditions))
            .order_by(desc(LoadingOrder.order_registered_time))
            .limit(bounded_limit)
            .offset(max(0, offset))
        )
        return list(self.session.scalars(stmt).all())

    def list_omc_orders(
        self,
        omc_id: str,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[LoadingOrder]:
        """Fetch orders for an OMC with optional status filtering, bounded by pagination."""
        bounded_limit = min(max(1, limit), 200)
        conditions = [LoadingOrder.omc_id == omc_id]
        if status:
            conditions.append(LoadingOrder.order_status == status)

        stmt = (
            select(LoadingOrder)
            .where(and_(*conditions))
            .order_by(desc(LoadingOrder.order_registered_time))
            .limit(bounded_limit)
            .offset(max(0, offset))
        )
        return list(self.session.scalars(stmt).all())

    def get_omc_summary(self, omc_id: str) -> Dict[str, Any]:
        """Compute aggregated order status summary for an OMC."""
        stmt = (
            select(LoadingOrder.order_status, func.count(LoadingOrder.order_id))
            .where(LoadingOrder.omc_id == omc_id)
            .group_by(LoadingOrder.order_status)
        )
        counts = dict(self.session.execute(stmt).all())
        total = sum(counts.values())
        return {
            "omc_id": omc_id,
            "total_orders": total,
            "status_counts": counts,
            "completed": counts.get("COMPLETED", 0),
            "in_progress": (
                counts.get("REGISTERED", 0)
                + counts.get("APPROACHING", 0)
                + counts.get("AT_GATE", 0)
                + counts.get("VALIDATED", 0)
                + counts.get("STAGING", 0)
                + counts.get("LOADING", 0)
            ),
        }
