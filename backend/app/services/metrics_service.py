"""Metrics service computing Network Command Centre and Executive Plane KPIs."""

from typing import Dict, Any
from sqlalchemy.orm import Session
from backend.app.repositories.metrics_repository import MetricsRepository
from backend.app.repositories.decision_repository import DecisionRepository
from backend.app.schemas.metrics import NetworkKpisResponse, ExecutiveMetricsResponse


class MetricsService:
    """Service layer for high-level operational and executive metrics."""

    def __init__(self, session: Session):
        self.metrics_repo = MetricsRepository(session)
        self.decision_repo = DecisionRepository(session)

    def get_network_kpis(self) -> NetworkKpisResponse:
        """Fetch network-level KPIs computed directly in SQL."""
        kpis = self.metrics_repo.get_network_kpis()
        return NetworkKpisResponse(**kpis)

    def get_executive_metrics(self) -> ExecutiveMetricsResponse:
        """Fetch executive control plane aggregated KPIs and autonomy ratio."""
        kpis = self.metrics_repo.get_network_kpis()
        net_response = NetworkKpisResponse(**kpis)

        autonomy_stats = self.decision_repo.get_autonomy_stats()
        total_decisions = autonomy_stats.get("total_decisions", 1) or 1
        l2_count = autonomy_stats.get("autonomy_distribution", {}).get("L2_AUTO_EXECUTABLE", 0)
        autonomy_ratio = round((l2_count / total_decisions) * 100.0, 1)

        return ExecutiveMetricsResponse(
            network_kpis=net_response,
            depot_count=5,
            omc_count=7,
            fleet_size=750,
            system_autonomy_ratio=autonomy_ratio,
        )

    def get_depot_turnaround(self, depot_id: str) -> Dict[str, Any]:
        """Fetch turnaround statistics for a single depot."""
        return self.metrics_repo.get_depot_turnaround_summary(depot_id)
