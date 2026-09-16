"""Operational Risk Intelligence Scoring service for FlowGuard."""

from datetime import datetime, timezone
from typing import Dict, Any, List
import pandas as pd
from sqlalchemy import Engine, text

from backend.ml.inference.arrival_predictor import ArrivalPredictor
from backend.ml.inference.turnaround_predictor import TurnaroundPredictor
from backend.ml.inference.gate_out_predictor import GateOutPredictor


class RiskScorer:
    """Evaluates operational risk exposure by synthesizing ML predictions and physical depot constraints."""

    def __init__(self, engine: Engine):
        self.engine = engine
        self.arrival_predictor = ArrivalPredictor(engine)
        self.turnaround_predictor = TurnaroundPredictor(engine)
        self.gate_out_predictor = GateOutPredictor(engine)

    def assess_order_risk(self, order_id: str) -> Dict[str, Any]:
        """Assess operational risk for an individual order.
        
        Synthesizes:
        1. Turnaround inflation above KPC target baseline
        2. Terminal bay utilization and staging queue concurrency
        3. Arrival window slippage relative to scheduled booking
        """
        # Fetch order and depot metadata
        query = text("""
            SELECT 
                o.order_id,
                o.depot_id,
                o.omc_id,
                o.product_id,
                o.order_status,
                o.expected_arrival_time,
                o.scheduled_window_end,
                d.name as depot_name,
                d.baseline_turnaround_min,
                d.total_positions,
                gi.event_timestamp as actual_gate_in
            FROM loading_orders o
            JOIN depots d ON o.depot_id = d.depot_id
            LEFT JOIN gate_events gi ON o.order_id = gi.order_id AND gi.event_type = 'GATE_IN'
            WHERE o.order_id = :order_id;
        """)

        with self.engine.connect() as conn:
            row = conn.execute(query, {"order_id": order_id}).fetchone()

        if not row:
            return {
                "order_id": order_id,
                "status": "PREDICTION_UNAVAILABLE",
                "reason": f"Order with identifier '{order_id}' was not found.",
                "model_version": "v1.0.0",
            }

        # 1. Turnaround Prediction
        trn_pred = self.turnaround_predictor.predict_turnaround(order_id)
        # 2. Gate-Out Prediction
        go_pred = self.gate_out_predictor.predict_gate_out(order_id)

        risk_reasons: List[str] = []
        turnaround_score = 0.0
        concurrency_score = 0.0
        arrival_score = 0.0

        # Component 1: Turnaround Inflation Risk (0 - 35 pts)
        if trn_pred.get("status") in ("PREDICTION_AVAILABLE", "SUCCESS"):
            delta = trn_pred["turnaround_delta_minutes"]
            pred_trn = trn_pred["predicted_turnaround_minutes"]
            base_trn = trn_pred["baseline_turnaround_minutes"]

            if delta > 30:
                turnaround_score = 35.0
                risk_reasons.append(
                    f"Severe turnaround inflation: predicted duration of {pred_trn:.0f} min exceeds "
                    f"KPC baseline ({base_trn:.0f} min) by +{delta:.0f} min."
                )
            elif delta > 15:
                turnaround_score = 25.0
                risk_reasons.append(
                    f"Turnaround inflation: predicted turnaround of {pred_trn:.0f} min exceeds "
                    f"KPC baseline ({base_trn:.0f} min) by +{delta:.0f} min."
                )
            elif delta > 5:
                turnaround_score = 12.0
                risk_reasons.append(
                    f"Moderate turnaround delay: predicted turnaround is +{delta:.0f} min above baseline."
                )

        # Component 2: Bay Utilization & Concurrency Pressure (0 - 35 pts)
        active_trucks = trn_pred.get("depot_active_trucks", 0)
        total_positions = row.total_positions or 8
        utilization = active_trucks / total_positions if total_positions > 0 else 1.0

        if utilization > 1.75:
            concurrency_score = 35.0
            risk_reasons.append(
                f"Depot staging saturation: {active_trucks} active tankers inside terminal "
                f"({utilization:.1f}x physical bay capacity)."
            )
        elif utilization > 1.2:
            concurrency_score = 25.0
            risk_reasons.append(
                f"Queue pressure elevated: {active_trucks} tankers inside terminal for {total_positions} bays "
                f"({utilization:.1f}x capacity)."
            )
        elif utilization > 0.9:
            concurrency_score = 12.0
            risk_reasons.append(
                f"Bay capacity near full: {active_trucks} tankers in depot ({utilization * 100:.0f}% capacity utilization)."
            )

        # Component 3: Arrival Window Slippage (0 - 30 pts)
        if not row.actual_gate_in:
            arr_pred = self.arrival_predictor.predict_arrival(order_id)
            if arr_pred.get("status") in ("PREDICTION_AVAILABLE", "SUCCESS"):
                pred_arr_dt = datetime.fromisoformat(arr_pred["predicted_arrival_time"])
                target_window_end = row.scheduled_window_end or row.expected_arrival_time

                if target_window_end:
                    if isinstance(target_window_end, pd.Timestamp):
                        target_window_end = target_window_end.to_pydatetime()
                    if target_window_end.tzinfo is None:
                        target_window_end = target_window_end.replace(tzinfo=timezone.utc)

                    slippage_minutes = (pred_arr_dt - target_window_end).total_seconds() / 60.0
                    if slippage_minutes > 30:
                        arrival_score = 30.0
                        risk_reasons.append(
                            f"Critical arrival delay: predicted arrival is {slippage_minutes:.0f} min past scheduled booking window."
                        )
                    elif slippage_minutes > 10:
                        arrival_score = 18.0
                        risk_reasons.append(
                            f"Arrival window slippage: predicted arrival is {slippage_minutes:.0f} min late vs schedule."
                        )

        # Aggregate total risk score
        total_risk_score = round(min(100.0, max(0.0, turnaround_score + concurrency_score + arrival_score)), 1)

        # Map to operational risk tier
        if total_risk_score >= 85:
            risk_level = "CRITICAL"
        elif total_risk_score >= 60:
            risk_level = "HIGH"
        elif total_risk_score >= 30:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        if not risk_reasons:
            risk_reasons.append("Operational parameters normal: turnaround on target and depot bay capacity available.")

        return {
            "order_id": order_id,
            "status": "ASSESSMENT_AVAILABLE",
            "depot_id": str(row.depot_id),
            "depot_name": str(row.depot_name),
            "omc_id": str(row.omc_id),
            "risk_score": total_risk_score,
            "risk_level": risk_level,
            "risk_reasons": risk_reasons,
            "predicted_turnaround_minutes": trn_pred.get("predicted_turnaround_minutes"),
            "predicted_gate_out_time": go_pred.get("predicted_gate_out_time"),
            "bay_utilization_ratio": round(utilization, 2),
            "assessed_at": datetime.now(timezone.utc).isoformat(),
            "model_version": "v1.0.0",
        }

    def assess_depot_risk(self, depot_id: str) -> Dict[str, Any]:
        """Calculate aggregated operational risk profile for an entire KPC depot."""
        query = text("""
            SELECT 
                d.depot_id,
                d.name as depot_name,
                d.baseline_turnaround_min,
                d.total_positions,
                COUNT(DISTINCT o.order_id) as active_orders_count
            FROM depots d
            LEFT JOIN loading_orders o ON d.depot_id = o.depot_id 
                AND o.order_status IN ('REGISTERED', 'ARRIVAL_PENDING', 'VALIDATING', 'STAGED', 'CALLED_FORWARD', 'POSITIONED', 'LOADING')
            WHERE d.depot_id = :depot_id
            GROUP BY d.depot_id, d.name, d.baseline_turnaround_min, d.total_positions;
        """)

        with self.engine.connect() as conn:
            depot_row = conn.execute(query, {"depot_id": depot_id}).fetchone()

        if not depot_row:
            return {
                "depot_id": depot_id,
                "status": "PREDICTION_UNAVAILABLE",
                "reason": f"Depot '{depot_id}' not found.",
                "model_version": "v1.0.0",
            }

        # Check concurrency
        with self.engine.connect() as conn:
            active_trucks = conn.execute(text("""
                SELECT COUNT(*) 
                FROM gate_events gi
                LEFT JOIN gate_events go ON gi.order_id = go.order_id AND go.event_type = 'GATE_OUT'
                WHERE gi.depot_id = :depot_id 
                  AND gi.event_type = 'GATE_IN' 
                  AND go.gate_event_id IS NULL;
            """), {"depot_id": depot_id}).scalar() or 0

        total_bays = depot_row.total_positions or 8
        utilization = active_trucks / total_bays if total_bays > 0 else 0.0

        reasons = []
        score = 15.0  # nominal baseline
        if utilization > 1.5:
            score += 55.0
            reasons.append(f"High congestion: {active_trucks} active tankers exceed {total_bays} physical bays.")
        elif utilization > 1.0:
            score += 35.0
            reasons.append(f"Elevated queue pressure: bay capacity fully utilized ({active_trucks} trucks).")
        else:
            reasons.append(f"Depot loading flow optimal ({active_trucks} active tankers for {total_bays} bays).")

        score = min(100.0, max(0.0, round(score, 1)))
        risk_level = "HIGH" if score >= 60 else ("MEDIUM" if score >= 30 else "LOW")

        return {
            "depot_id": depot_id,
            "depot_name": str(depot_row.depot_name),
            "status": "ASSESSMENT_AVAILABLE",
            "risk_score": score,
            "risk_level": risk_level,
            "active_orders_count": int(depot_row.active_orders_count or 0),
            "active_trucks_in_depot": int(active_trucks),
            "total_positions": total_bays,
            "bay_utilization_ratio": round(utilization, 2),
            "risk_reasons": reasons,
            "assessed_at": datetime.now(timezone.utc).isoformat(),
            "model_version": "v1.0.0",
        }
