"""Depot repository for operational live state and gantry status queries."""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, desc
from backend.app.repositories.base import BaseRepository
from backend.app.db.models import (
    Depot,
    LoadingPosition,
    LoadingOrder,
    LoadingEvent,
    GateEvent,
    EquipmentEvent,
    ProductReadinessEvent,
    CurrentDepotState,
    CurrentLoadingPositionState,
    CurrentOrderState,
)


class DepotRepository(BaseRepository[Depot]):
    """Repository handling KPC depot operational live state queries."""

    def __init__(self, session: Session):
        super().__init__(Depot, session)

    def list_all(self) -> List[Depot]:
        """Fetch all 5 KPC depots."""
        stmt = select(Depot).order_by(Depot.name)
        return list(self.session.scalars(stmt).all())

    def get_depot_live_state(self, depot_id: str) -> Optional[Dict[str, Any]]:
        """Query live operational state for a depot: bay occupancy, queue depth, and active counts."""
        depot = self.get_by_id(depot_id)
        if not depot:
            return None

        # 1. First check high-performance CurrentDepotState projection
        curr_state = self.session.scalar(
            select(CurrentDepotState).where(CurrentDepotState.depot_id == depot_id)
        )
        if curr_state:
            return {
                "depot_id": depot.depot_id,
                "name": depot.name,
                "code": depot.code,
                "region": depot.region,
                "total_positions": depot.total_positions,
                "actively_loading": curr_state.actively_loading,
                "queue_count": curr_state.queue_count,
                "total_active_orders": curr_state.total_active_orders,
                "bay_utilization_pct": float(curr_state.bay_utilization_pct),
                "baseline_turnaround_min": depot.baseline_turnaround_min,
                "operating_hours": f"{depot.operating_hours_open} - {depot.operating_hours_close}",
                "trucks_inside": curr_state.trucks_inside,
                "validating_count": curr_state.validating_count,
                "positioned_count": curr_state.positioned_count,
                "approaching_count": curr_state.approaching_count,
                "available_positions": curr_state.available_positions,
                "occupied_positions": curr_state.occupied_positions,
                "degraded_positions": curr_state.degraded_positions,
                "unavailable_positions": curr_state.unavailable_positions,
                "queue_pressure_ratio": float(curr_state.queue_pressure_ratio),
                "queue_pressure_level": curr_state.queue_pressure_level,
                "congestion_level": curr_state.congestion_level,
                "current_turnaround_min": float(curr_state.current_turnaround_min),
                "scenario_id": curr_state.scenario_id,
                "scenario_name": curr_state.scenario_name,
                "scenario_time": curr_state.scenario_time.isoformat() if curr_state.scenario_time else None,
            }

        # 2. Fallback SQL aggregation if projection is not yet initialized
        queue_stmt = select(func.count(LoadingOrder.order_id)).where(
            and_(
                LoadingOrder.depot_id == depot_id,
                LoadingOrder.order_status.in_(["AT_GATE", "VALIDATED", "STAGING", "STAGED"]),
            )
        )
        queue_count = self.session.scalar(queue_stmt) or 0

        loading_stmt = select(func.count(LoadingOrder.order_id)).where(
            and_(
                LoadingOrder.depot_id == depot_id,
                LoadingOrder.order_status == "LOADING",
            )
        )
        actively_loading = self.session.scalar(loading_stmt) or 0

        active_stmt = select(func.count(LoadingOrder.order_id)).where(
            and_(
                LoadingOrder.depot_id == depot_id,
                LoadingOrder.order_status.in_(["REGISTERED", "APPROACHING", "AT_GATE", "VALIDATED", "VALIDATING", "STAGING", "STAGED", "LOADING"]),
            )
        )
        total_active = self.session.scalar(active_stmt) or 0

        total_bays = depot.total_positions or 1
        bay_utilization_pct = min(100.0, round((actively_loading / total_bays) * 100.0, 1))

        return {
            "depot_id": depot.depot_id,
            "name": depot.name,
            "code": depot.code,
            "region": depot.region,
            "total_positions": depot.total_positions,
            "actively_loading": actively_loading,
            "queue_count": queue_count,
            "total_active_orders": total_active,
            "bay_utilization_pct": bay_utilization_pct,
            "baseline_turnaround_min": depot.baseline_turnaround_min,
            "operating_hours": f"{depot.operating_hours_open} - {depot.operating_hours_close}",
            "trucks_inside": actively_loading + queue_count,
            "validating_count": 0,
            "positioned_count": 0,
            "approaching_count": max(0, total_active - actively_loading - queue_count),
            "available_positions": max(0, total_bays - actively_loading),
            "occupied_positions": actively_loading,
            "degraded_positions": 0,
            "unavailable_positions": 0,
            "queue_pressure_ratio": round(queue_count / total_bays, 2),
            "queue_pressure_level": "NORMAL",
            "congestion_level": "LOW",
            "current_turnaround_min": float(depot.baseline_turnaround_min),
            "scenario_id": None,
            "scenario_name": None,
            "scenario_time": None,
        }

    def get_depot_loading_positions(self, depot_id: str) -> List[Dict[str, Any]]:
        """Fetch gantry loading positions for a depot, enriched with live hardware and occupancy state."""
        curr_positions = self.session.scalars(
            select(CurrentLoadingPositionState)
            .where(CurrentLoadingPositionState.depot_id == depot_id)
            .order_by(CurrentLoadingPositionState.bay_number)
        ).all()

        if curr_positions:
            return [
                {
                    "loading_position_id": p.loading_position_id,
                    "bay_number": p.bay_number,
                    "code": p.code,
                    "product_compatibility": p.product_compatibility,
                    "has_dual_arm": p.has_dual_arm,
                    "standard_flow_rate_lpm": p.standard_flow_rate_lpm,
                    "is_high_velocity": p.standard_flow_rate_lpm >= 1650 or p.has_dual_arm,
                    "status": p.status,
                    "flow_impact_pct": p.flow_impact_pct,
                    "effective_flow_rate_lpm": p.effective_flow_rate_lpm,
                    "current_order_id": p.current_order_id,
                    "current_truck_registration": p.current_truck_registration,
                    "operational_notes": p.operational_notes,
                }
                for p in curr_positions
            ]

        # Fallback to master metadata
        stmt = (
            select(LoadingPosition)
            .where(LoadingPosition.depot_id == depot_id)
            .order_by(LoadingPosition.bay_number)
        )
        positions = self.session.scalars(stmt).all()
        return [
            {
                "loading_position_id": p.loading_position_id,
                "bay_number": p.bay_number,
                "code": p.code,
                "product_compatibility": p.product_compatibility,
                "has_dual_arm": p.has_dual_arm,
                "standard_flow_rate_lpm": p.standard_flow_rate_lpm,
                "is_high_velocity": p.is_high_velocity,
                "status": "AVAILABLE",
                "flow_impact_pct": 0,
                "effective_flow_rate_lpm": p.standard_flow_rate_lpm,
                "current_order_id": None,
                "current_truck_registration": None,
                "operational_notes": None,
            }
            for p in positions
        ]

    def get_depot_yard_trucks(self, depot_id: str) -> List[Dict[str, Any]]:
        """Fetch active yard trucks for a depot from current operational projection."""
        stmt = (
            select(CurrentOrderState)
            .where(CurrentOrderState.depot_id == depot_id)
            .order_by(desc(CurrentOrderState.is_active_inside), desc(CurrentOrderState.time_in_stage_min))
        )
        orders = self.session.scalars(stmt).all()
        return [
            {
                "order_id": o.order_id,
                "truck_id": o.truck_id,
                "truck_registration": o.truck_registration,
                "driver_name": o.driver_name,
                "omc_id": o.omc_id,
                "product_id": o.product_id,
                "ordered_quantity_litres": float(o.ordered_quantity_litres),
                "current_stage": o.current_stage,
                "stage_display": o.stage_display,
                "time_in_stage_min": o.time_in_stage_min,
                "allocated_position_id": o.allocated_position_id,
                "allocated_bay_number": o.allocated_bay_number,
                "predicted_gate_out": o.predicted_gate_out.isoformat() if o.predicted_gate_out else None,
                "predicted_turnaround_min": float(o.predicted_turnaround_min),
                "risk_status": o.risk_status,
                "risk_label": o.risk_label,
                "is_active_inside": o.is_active_inside,
            }
            for o in orders
        ]

    def get_recent_gate_movements(self, depot_id: str, limit: int = 20, offset: int = 0) -> List[GateEvent]:
        """Fetch recent gate barrier events bounded by pagination."""
        bounded_limit = min(max(1, limit), 100)
        stmt = (
            select(GateEvent)
            .where(GateEvent.depot_id == depot_id)
            .order_by(desc(GateEvent.event_timestamp))
            .limit(bounded_limit)
            .offset(max(0, offset))
        )
        return list(self.session.scalars(stmt).all())
