"""Tests for /api/decisions endpoints."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_list_decisions_paginated(client):
    """Verify paginated autonomous decisions listing."""
    response = client.get("/api/decisions?limit=10&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "pagination" in data
    assert len(data["items"]) == 10
    assert data["pagination"]["total"] > 200


def test_get_decision_trace_demo(client):
    """Verify DEC-0142 full 8-stage decision trace, actuation, and audit seal."""
    response = client.get("/api/decisions/DEC-0142/trace")
    assert response.status_code == 200
    trace = response.json()
    assert trace["decision_id"] == "DEC-0142"
    assert trace["autonomy_level"] == "L2_AUTO_EXECUTABLE"
    assert len(trace["stages"]) == 8

    # Verify stage sequence names
    stage_names = [s["stage_name"] for s in trace["stages"]]
    assert stage_names == ["SIGNAL", "PREDICT", "DIAGNOSE", "OPTIMIZE", "DECIDE", "EXECUTE", "VERIFY", "LOG"]

    # Verify action, verification, and audit hash
    assert trace["action"] is not None
    assert trace["action"]["action_id"] == "ACT-8801"
    assert trace["verification"] is not None
    assert trace["verification"]["observed_reduction_min"] == 34
    assert trace["audit"] is not None
    assert len(trace["audit"]["audit_reference_sha256"]) == 64


def test_get_decision_trace_not_found(client):
    """Verify 404 for missing decision."""
    response = client.get("/api/decisions/DEC-999999/trace")
    assert response.status_code == 404
    err = response.json()
    assert "error" in err
    assert err["error"]["code"] == "DECISION_NOT_FOUND"


def test_get_autonomy_stats(client):
    """Verify autonomy distribution statistics."""
    response = client.get("/api/decisions/stats/autonomy")
    assert response.status_code == 200
    data = response.json()
    assert "total_decisions" in data
    assert "autonomy_distribution" in data
    assert "total_realized_savings_kes" in data
    assert data["total_decisions"] > 200
