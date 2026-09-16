"""Real-time online inference service for Predicted Gate-Out timing."""

from datetime import datetime, timedelta, timezone
from typing import Dict, Any
import pandas as pd
from sqlalchemy import Engine, text

from backend.ml.inference.arrival_predictor import ArrivalPredictor
from backend.ml.inference.turnaround_predictor import TurnaroundPredictor


class GateOutPredictor:
    """Combines Arrival Prediction and Turnaround Prediction into Predicted Gate-Out."""

    def __init__(self, engine: Engine):
        self.engine = engine
        self.arrival_predictor = ArrivalPredictor(engine)
        self.turnaround_predictor = TurnaroundPredictor(engine)

    def predict_gate_out(self, order_id: str) -> Dict[str, Any]:
        """Calculate Predicted Gate-Out = Predicted Arrival + Predicted Turnaround."""
        # 1. Check physical gate state of the order
        check_query = text("""
            SELECT 
                o.order_id,
                o.order_status,
                gi.event_timestamp as actual_gate_in,
                go.event_timestamp as actual_gate_out
            FROM loading_orders o
            LEFT JOIN gate_events gi ON o.order_id = gi.order_id AND gi.event_type = 'GATE_IN'
            LEFT JOIN gate_events go ON o.order_id = go.order_id AND go.event_type = 'GATE_OUT'
            WHERE o.order_id = :order_id;
        """)

        with self.engine.connect() as conn:
            gate_row = conn.execute(check_query, {"order_id": order_id}).fetchone()

        if not gate_row:
            return {
                "order_id": order_id,
                "status": "PREDICTION_UNAVAILABLE",
                "reason": f"Order with identifier '{order_id}' was not found.",
                "model_version": "v1.0.0",
            }

        # If order already gated out and is marked completed
        if gate_row.actual_gate_out and gate_row.order_status == "COMPLETED":
            actual_go = gate_row.actual_gate_out
            if isinstance(actual_go, pd.Timestamp):
                actual_go = actual_go.to_pydatetime()
            if actual_go.tzinfo is None:
                actual_go = actual_go.replace(tzinfo=timezone.utc)
            return {
                "order_id": order_id,
                "status": "COMPLETED",
                "operational_phase": "GATED_OUT",
                "actual_gate_out_time": actual_go.isoformat(),
                "message": "Order has already completed loading and exited KPC terminal.",
                "model_version": "v1.0.0",
            }

        # 2. Get turnaround prediction
        turnaround_res = self.turnaround_predictor.predict_turnaround(order_id)
        if turnaround_res.get("status") not in ("PREDICTION_AVAILABLE", "SUCCESS"):
            return {
                "order_id": order_id,
                "status": "PREDICTION_UNAVAILABLE",
                "reason": turnaround_res.get("reason", "Unable to compute turnaround prediction."),
                "model_version": "v1.0.0",
            }

        pred_turnaround_min = turnaround_res["predicted_turnaround_minutes"]

        # 3. Determine if truck is inside depot or in transit
        if gate_row.actual_gate_in:
            # Truck has already arrived and gated in
            gate_in_dt = gate_row.actual_gate_in
            if isinstance(gate_in_dt, pd.Timestamp):
                gate_in_dt = gate_in_dt.to_pydatetime()
            if gate_in_dt.tzinfo is None:
                gate_in_dt = gate_in_dt.replace(tzinfo=timezone.utc)

            pred_gate_out_dt = gate_in_dt + timedelta(minutes=pred_turnaround_min)
            operational_phase = "INSIDE_DEPOT"
            arrival_time_str = gate_in_dt.isoformat()
            confidence = turnaround_res["confidence_pct"]
        else:
            # Truck is still in transit: gate-out = predicted arrival + predicted turnaround
            arrival_res = self.arrival_predictor.predict_arrival(order_id)
            if arrival_res.get("status") not in ("PREDICTION_AVAILABLE", "SUCCESS"):
                return {
                    "order_id": order_id,
                    "status": "PREDICTION_UNAVAILABLE",
                    "reason": arrival_res.get("reason", "Unable to compute arrival prediction."),
                    "model_version": "v1.0.0",
                }

            pred_arrival_dt = datetime.fromisoformat(arrival_res["predicted_arrival_time"])
            pred_gate_out_dt = pred_arrival_dt + timedelta(minutes=pred_turnaround_min)
            operational_phase = "IN_TRANSIT"
            arrival_time_str = pred_arrival_dt.isoformat()
            confidence = round((arrival_res["confidence_pct"] + turnaround_res["confidence_pct"]) / 2.0, 1)

        margin_min = round(turnaround_res["prediction_window"]["margin_minutes"] + (0 if gate_row.actual_gate_in else 10), 1)

        return {
            "order_id": order_id,
            "status": "PREDICTION_AVAILABLE",
            "operational_phase": operational_phase,
            "depot_id": turnaround_res.get("depot_id"),
            "reference_arrival_time": arrival_time_str,
            "predicted_turnaround_minutes": pred_turnaround_min,
            "predicted_gate_out_time": pred_gate_out_dt.isoformat(),
            "prediction_window": {
                "window_start": (pred_gate_out_dt - timedelta(minutes=margin_min)).isoformat(),
                "window_end": (pred_gate_out_dt + timedelta(minutes=margin_min)).isoformat(),
                "margin_minutes": margin_min,
            },
            "confidence_pct": confidence,
            "calculation_formula": (
                "Actual Gate-In + Predicted Turnaround"
                if operational_phase == "INSIDE_DEPOT"
                else "Predicted Arrival + Predicted Turnaround"
            ),
            "model_version": "v1.0.0",
        }
