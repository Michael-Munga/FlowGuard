"""Tests for /api/risks endpoints."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_get_active_risks(client):
    """Verify active risks endpoint returns summary envelope."""
    response = client.get("/api/risks/active")
    assert response.status_code == 200
    data = response.json()
    assert "total_active_risks" in data
    assert "severity_counts" in data
    assert "total_exposure_at_risk_kes" in data
    assert "items" in data


def test_get_risk_by_id_not_found(client):
    """Verify 404 for missing risk event."""
    response = client.get("/api/risks/NON-EXISTENT-RISK")
    assert response.status_code == 404
    err = response.json()
    assert "error" in err
    assert err["error"]["code"] == "RISKEVENT_NOT_FOUND"
