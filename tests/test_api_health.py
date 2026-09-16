"""Tests for /health and /ready probe endpoints."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_health_endpoint(client):
    """Verify /health returns 200 ok."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "environment" in data


def test_ready_endpoint(client):
    """Verify /ready executes database probe and returns ready."""
    response = client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] == "ok"
