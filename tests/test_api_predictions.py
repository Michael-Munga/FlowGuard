"""API endpoint tests for FlowGuard Predictions and Operational Risk Intelligence."""

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)
DEMO_ORDER_ID = "LO-NBO-8821"


def test_api_arrival_prediction_success():
    """Verify GET /api/predictions/orders/{id}/arrival returns 200 with typed schema."""
    response = client.get(f"/api/predictions/orders/{DEMO_ORDER_ID}/arrival")
    assert response.status_code == 200
    data = response.json()

    assert data["order_id"] == DEMO_ORDER_ID
    assert data["status"] == "PREDICTION_AVAILABLE"
    assert data["depot_id"] == "nairobi"
    assert data["predicted_duration_minutes"] is not None
    assert data["predicted_arrival_time"] is not None
    assert "prediction_window" in data
    assert data["prediction_window"]["margin_minutes"] > 0
    assert data["confidence_pct"] is not None
    assert len(data["top_features"]) > 0


def test_api_arrival_prediction_not_found():
    """Verify GET /api/predictions/orders/{id}/arrival returns 404 for invalid order."""
    response = client.get("/api/predictions/orders/NON_EXISTENT_ORDER_XYZ/arrival")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data


def test_api_turnaround_prediction_success():
    """Verify GET /api/predictions/orders/{id}/turnaround returns 200 with typed schema."""
    response = client.get(f"/api/predictions/orders/{DEMO_ORDER_ID}/turnaround")
    assert response.status_code == 200
    data = response.json()

    assert data["order_id"] == DEMO_ORDER_ID
    assert data["status"] == "PREDICTION_AVAILABLE"
    assert data["depot_id"] == "nairobi"
    assert data["predicted_turnaround_minutes"] is not None
    assert data["baseline_turnaround_minutes"] == 65.0
    assert "turnaround_delta_minutes" in data
    assert "prediction_window" in data
    assert len(data["top_features"]) > 0


def test_api_gate_out_prediction_success():
    """Verify GET /api/predictions/orders/{id}/gate-out returns 200 with typed schema."""
    response = client.get(f"/api/predictions/orders/{DEMO_ORDER_ID}/gate-out")
    assert response.status_code == 200
    data = response.json()

    assert data["order_id"] == DEMO_ORDER_ID
    assert data["status"] in ("PREDICTION_AVAILABLE", "COMPLETED")
    assert "operational_phase" in data


def test_api_order_risk_score_success():
    """Verify GET /api/predictions/orders/{id}/risk returns 200 with explainable reasons."""
    response = client.get(f"/api/predictions/orders/{DEMO_ORDER_ID}/risk")
    assert response.status_code == 200
    data = response.json()

    assert data["order_id"] == DEMO_ORDER_ID
    assert data["status"] == "ASSESSMENT_AVAILABLE"
    assert 0.0 <= data["risk_score"] <= 100.0
    assert data["risk_level"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")
    assert isinstance(data["risk_reasons"], list)
    assert len(data["risk_reasons"]) > 0


def test_api_depot_risk_score_success():
    """Verify GET /api/predictions/depots/{id}/risk returns 200 with depot profile."""
    response = client.get("/api/predictions/depots/nairobi/risk")
    assert response.status_code == 200
    data = response.json()

    assert data["depot_id"] == "nairobi"
    assert data["status"] == "ASSESSMENT_AVAILABLE"
    assert 0.0 <= data["risk_score"] <= 100.0
    assert data["risk_level"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")
    assert "bay_utilization_ratio" in data
    assert len(data["risk_reasons"]) > 0


def test_api_depot_risk_score_not_found():
    """Verify GET /api/predictions/depots/{id}/risk returns 404 for invalid depot."""
    response = client.get("/api/predictions/depots/unknown_depot_xyz/risk")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
