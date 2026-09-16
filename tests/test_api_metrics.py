"""Tests for /api/metrics endpoints."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_get_network_kpis(client):
    """Verify Network Command Centre KPIs endpoint."""
    response = client.get("/api/metrics/network")
    assert response.status_code == 200
    kpis = response.json()
    assert "total_throughput_m3" in kpis
    assert kpis["total_throughput_m3"] > 0
    assert "total_orders" in kpis
    assert kpis["total_orders"] > 10000
    assert "completed_orders" in kpis
    assert "avg_loading_duration_mins" in kpis
    assert "total_realized_savings_kes" in kpis


def test_get_executive_metrics(client):
    """Verify Executive Plane metrics endpoint."""
    response = client.get("/api/metrics/executive")
    assert response.status_code == 200
    exec_metrics = response.json()
    assert "network_kpis" in exec_metrics
    assert exec_metrics["depot_count"] == 5
    assert exec_metrics["omc_count"] == 7
    assert exec_metrics["fleet_size"] == 750
    assert "system_autonomy_ratio" in exec_metrics


def test_get_depot_turnaround_summary(client):
    """Verify depot-specific turnaround calculation."""
    response = client.get("/api/metrics/depots/nairobi/turnaround")
    assert response.status_code == 200
    data = response.json()
    assert data["depot_id"] == "nairobi"
    assert "completed_loading_count" in data
    assert data["completed_loading_count"] > 0
    assert "avg_duration_min" in data
