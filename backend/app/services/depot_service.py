"""Depot service orchestrating terminal operational queries."""

from typing import List
from sqlalchemy.orm import Session
from backend.app.repositories.depot_repository import DepotRepository
from backend.app.schemas.depot import (
    DepotSummary,
    DepotLiveStateResponse,
    LoadingPositionResponse,
    YardTruckResponse,
    DepotForecastResponse,
)
from backend.app.services.exceptions import EntityNotFoundError


class DepotService:
    """Service layer for KPC depot operations."""

    def __init__(self, session: Session):
        self.repo = DepotRepository(session)

    def list_depots(self) -> List[DepotSummary]:
        """Fetch all 5 KPC depots."""
        depots = self.repo.list_all()
        return [
            DepotSummary(
                depot_id=d.depot_id,
                name=d.name,
                code=d.code,
                region=d.region,
                total_positions=d.total_positions,
                baseline_turnaround_min=d.baseline_turnaround_min,
                operating_hours=f"{d.operating_hours_open} - {d.operating_hours_close}",
            )
            for d in depots
        ]

    def get_depot_live_state(self, depot_id: str) -> DepotLiveStateResponse:
        """Fetch live operational state and gantry bay configuration."""
        live_state = self.repo.get_depot_live_state(depot_id)
        if not live_state:
            raise EntityNotFoundError("Depot", depot_id)

        positions = self.repo.get_depot_loading_positions(depot_id)
        pos_schemas = [
            LoadingPositionResponse(**p)
            for p in positions
        ]

        yard_trucks = self.repo.get_depot_yard_trucks(depot_id)
        truck_schemas = [
            YardTruckResponse(**t)
            for t in yard_trucks
        ]

        return DepotLiveStateResponse(
            **live_state,
            loading_positions=pos_schemas,
            active_trucks=truck_schemas,
        )

    def get_depot_forecast(self, depot_id: str) -> DepotForecastResponse:
        """Fetch 4-hour operational forecast for a depot."""
        live = self.get_depot_live_state(depot_id)
        # Synthetic baseline forecast calculated from current queue and bay capacity
        inflow = max(8, int(live.total_positions * 1.8))
        avg_wait = round(float(live.queue_count * 4.5) + (15.0 if live.bay_utilization_pct > 75 else 5.0), 1)
        risk_level = "HIGH" if live.bay_utilization_pct > 80 or avg_wait > 30 else "MODERATE" if avg_wait > 15 else "LOW"

        return DepotForecastResponse(
            depot_id=depot_id,
            forecast_horizon_hours=4,
            predicted_inflow_trucks=inflow,
            predicted_avg_wait_min=avg_wait,
            predicted_peak_window="10:00 - 12:30",
            congestion_risk_level=risk_level,
            recommended_bays_active=live.total_positions,
        )
