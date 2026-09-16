"""Tests for /api/depots endpoints."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_list_depots(client):
    """Verify listing all 5 KPC depots."""
    response = client.get("/api/depots")
    assert response.status_code == 200
    depots = response.json()
    assert len(depots) == 5
    depot_ids = [d["depot_id"] for d in depots]
    assert "nairobi" in depot_ids
    assert "mombasa" in depot_ids


def test_get_depot_live_state(client):
    """Verify live state for Nairobi depot."""
    response = client.get("/api/depots/nairobi/live")
    assert response.status_code == 200
    data = response.json()
    assert data["depot_id"] == "nairobi"
    assert "actively_loading" in data
    assert "queue_count" in data
    assert "bay_utilization_pct" in data
    assert len(data["loading_positions"]) > 0


def test_get_depot_live_state_not_found(client):
    """Verify 404 for non-existent depot."""
    response = client.get("/api/depots/non_existent_depot/live")
    assert response.status_code == 404
    err = response.json()
    assert "error" in err
    assert err["error"]["code"] == "DEPOT_NOT_FOUND"


def test_get_depot_forecast(client):
    """Verify depot predictive forecast."""
    response = client.get("/api/depots/nairobi/forecast")
    assert response.status_code == 200
    data = response.json()
    assert data["depot_id"] == "nairobi"
    assert data["forecast_horizon_hours"] == 4
    assert data["predicted_inflow_trucks"] > 0
    assert "congestion_risk_level" in data
