"""Tests for /api/orders and /api/omcs endpoints."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_get_order_detail_demo(client):
    """Verify LO-NBO-8821 demo order detail and full milestone progression."""
    response = client.get("/api/orders/LO-NBO-8821")
    assert response.status_code == 200
    order = response.json()
    assert order["order_id"] == "LO-NBO-8821"
    assert order["omc_id"] == "vivo"
    assert order["depot_id"] == "nairobi"
    assert "milestones" in order
    assert len(order["milestones"]["gate_events"]) > 0
    assert order["milestones"]["validation"]["outcome"] == "APPROVED"
    assert order["milestones"]["loading"]["actual_litres"] == 36000.0


def test_get_order_detail_not_found(client):
    """Verify 404 on non-existent order."""
    response = client.get("/api/orders/NON-EXISTENT-ORDER-999")
    assert response.status_code == 404
    err = response.json()
    assert "error" in err
    assert err["error"]["code"] == "ORDER_NOT_FOUND"


def test_list_omc_orders_paginated(client):
    """Verify paginated orders for Vivo Energy."""
    response = client.get("/api/omcs/vivo/orders?limit=25&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "pagination" in data
    assert len(data["items"]) == 25
    assert data["pagination"]["limit"] == 25
    assert data["pagination"]["offset"] == 0
    assert data["pagination"]["total"] > 1000
    assert data["pagination"]["has_more"] is True


def test_list_omc_orders_bounded_limit(client):
    """Verify pagination limit is capped at 200 max."""
    response = client.get("/api/omcs/vivo/orders?limit=500")
    assert response.status_code == 422  # validation error since le=200


def test_get_omc_summary(client):
    """Verify OMC order summary aggregation."""
    response = client.get("/api/omcs/vivo/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["omc_id"] == "vivo"
    assert data["total_orders"] > 1000
    assert data["completed"] > 0
