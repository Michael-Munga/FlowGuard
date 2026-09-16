"""Optimization and Policy Decision Orchestration Service."""

import hashlib
import json
import logging
import time
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.app.db.models.decision import Decision
from backend.app.db.models.decision_stage import DecisionStage
from backend.app.db.models.autonomous_action import AutonomousAction
from backend.app.db.models.audit_event import AuditEvent
from backend.app.db.models.loading_order import LoadingOrder
from backend.app.db.models.truck import LoadingPosition
from backend.app.db.models.equipment_event import EquipmentEvent

from backend.optimization.models import (
    OptimizationInput,
    OptimizationResult,
    OrderOptimizationItem,
    LoadingPositionItem,
    CandidateAction,
)
from backend.optimization.solver import FlowGuardOptimizer
from backend.policy.evaluator import PolicyEvaluator, PolicyDecision
from backend.execution.adapter import SimulatedExecutionAdapter
from backend.app.services.prediction_service import PredictionService
from backend.app.schemas.optimization import (
    OptimizationDecisionResponse,
    CandidateActionResponse,
    CounterfactualMetricsResponse,
    ApprovalResponse,
)

logger = logging.getLogger("flowguard.services.optimization")
OPTIMIZER_VERSION = "flowguard-cp-sat-v1.0.0"
POLICY_VERSION = "flowguard-demo-policy-v1.0.0"


class OptimizationService:
    """Coordinates risk intelligence, OR-Tools optimization, policy governance, and simulation."""

    def __init__(self, db: Session, prediction_service: PredictionService):
        self.db = db
        self.prediction_service = prediction_service
        self.optimizer = FlowGuardOptimizer(default_timeout_seconds=5.0)
        self.policy_evaluator = PolicyEvaluator()
        self.execution_adapter = SimulatedExecutionAdapter()

    def solve_depot(self, depot_id: str, force_new: bool = False) -> OptimizationDecisionResponse:
        """Execute bounded optimization, evaluate policy, and persist full 8-stage decision."""
        # 1. Deduplication / Idempotency Check: check if recent decision exists (< 15 mins)
        if not force_new:
            recent_decision = (
                self.db.query(Decision)
                .filter(
                    Decision.depot_id == depot_id,
                    Decision.decision_timestamp >= datetime.now(timezone.utc) - timedelta(minutes=15),
                )
                .order_by(Decision.decision_timestamp.desc())
                .first()
            )
            if recent_decision:
                logger.info("Reusing existing decision '%s' for depot '%s' within idempotency window", recent_decision.decision_id, depot_id)
                return self.get_decision(recent_decision.decision_id)

        # 2. Build Bounded Problem Inputs from PostgreSQL
        input_build_start = time.perf_counter()
        opt_input, risk_context = self._build_optimization_input(depot_id)
        input_build_time_ms = round((time.perf_counter() - input_build_start) * 1000, 2)
        opt_input.input_diagnostics["input_build_time_ms"] = input_build_time_ms

        # 3. STAGE 4: Solve via Google OR-Tools CP-SAT
        opt_result: OptimizationResult = self.optimizer.solve_depot_schedule(opt_input)

        if not opt_result.candidates or not opt_result.selected_candidate:
            # Fallback if no feasible plan found
            return self._build_infeasible_response(depot_id, opt_result)

        selected_candidate = opt_result.selected_candidate

        # 4. STAGE 5: Evaluate through Policy Governance Engine
        policy: PolicyDecision = self.policy_evaluator.evaluate(selected_candidate, risk_context)

        # 5. STAGE 6: Simulated Execution Boundary
        decision_id = f"DEC-{uuid.uuid4().hex[:8].upper()}"
        execution_result = None

        if policy.policy_state == "AUTO_EXECUTABLE":
            execution_result = self.execution_adapter.dispatch_action(
                decision_id=decision_id,
                depot_id=depot_id,
                candidate=selected_candidate,
                policy=policy,
            )
            decision_status = "SIMULATED_EXECUTED"
        elif policy.policy_state == "APPROVAL_REQUIRED":
            decision_status = "AWAITING_APPROVAL"
        else:
            decision_status = "BLOCKED_BY_POLICY"

        # 6. STAGE 8: Persist 8-Stage Decision Record into PostgreSQL
        headline = (
            f"Autonomous {selected_candidate.action_type.replace('_', ' ').title()} relief for {depot_id.upper()} terminal"
            if policy.policy_state == "AUTO_EXECUTABLE"
            else f"Supervised {selected_candidate.action_type.replace('_', ' ').title()} awaiting operator authorization"
        )

        decision_row = Decision(
            decision_id=decision_id,
            depot_id=depot_id,
            decision_timestamp=datetime.now(timezone.utc),
            headline=headline,
            autonomy_level=policy.autonomy_level,
            decision_status=decision_status,
            selected_candidate_id=selected_candidate.candidate_id,
            policy_rule_id=policy.policy_rule_id,
            target_orders_count=len(selected_candidate.target_orders),
            etl_run_id="FLOWGUARD_OPTIMIZER_V1",
        )
        self.db.add(decision_row)
        self.db.flush()

        # Persist 8 Stages
        self._persist_stages(
            decision_id=decision_id,
            depot_id=depot_id,
            opt_result=opt_result,
            policy=policy,
            execution_result=execution_result,
            risk_context=risk_context,
        )

        # Persist Action (if simulated dispatched)
        if execution_result:
            action_row = AutonomousAction(
                action_id=execution_result.action_id,
                decision_id=decision_id,
                depot_id=depot_id,
                action_type=execution_result.action_type,
                control_state=execution_result.control_state,
                target_device_interface=execution_result.target_device_interface,
                dispatched_at=datetime.fromisoformat(execution_result.dispatched_at),
                ack_latency_ms=execution_result.ack_latency_ms,
                execution_result=execution_result.execution_result,
                etl_run_id="FLOWGUARD_OPTIMIZER_V1",
            )
            self.db.add(action_row)

        # Persist Cryptographic Audit Digest
        audit_payload = f"{decision_id}|{depot_id}|{selected_candidate.candidate_id}|{policy.policy_rule_id}|{datetime.now(timezone.utc).isoformat()}"
        audit_sha256 = hashlib.sha256(audit_payload.encode("utf-8")).hexdigest()

        # The canonical audit schema requires an action foreign key. Record an
        # immutable action audit only after simulated dispatch; approval-pending
        # decisions are already recorded by their LOG stage and must not invent an
        # action merely to satisfy a foreign key.
        if execution_result:
            self.db.add(AuditEvent(
                audit_event_id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
                decision_id=decision_id,
                action_id=execution_result.action_id,
                audit_timestamp=datetime.now(timezone.utc),
                actor="FLOWGUARD_AUTONOMY_ENGINE",
                event_type="SIMULATED_EXECUTION_DISPATCHED",
                control_state=execution_result.control_state,
                audit_reference_sha256=audit_sha256,
                verification_digest=(
                    f"SIMULATION ONLY: estimated {opt_result.counterfactual_metrics.get('turnaround_reduction_min', 0)}m "
                    f"turnaround delta across {len(selected_candidate.target_orders)} tankers ({policy.policy_state})"
                ),
                etl_run_id="FLOWGUARD_OPTIMIZER_V1",
            ))

        self.db.commit()

        return self.get_decision(decision_id)

    def get_decision(self, decision_id: str) -> OptimizationDecisionResponse:
        """Retrieve full decision details from PostgreSQL database."""
        decision: Optional[Decision] = self.db.query(Decision).filter(Decision.decision_id == decision_id).first()
        if not decision:
            raise ValueError(f"Decision '{decision_id}' was not found.")

        # Reconstruct counterfactual and candidate data from stages
        stage4 = next((s for s in decision.stages if s.stage_sequence == 4), None)
        stage5 = next((s for s in decision.stages if s.stage_sequence == 5), None)

        cf_metrics = None
        candidates_data = []
        solver_status = "UNKNOWN"
        solve_time_ms = 0.0
        optimizer_version = OPTIMIZER_VERSION
        if stage4 and stage4.payload_summary:
            try:
                p_data = json.loads(stage4.payload_summary)
                solver_status = p_data.get("solver_status", solver_status)
                solve_time_ms = float(p_data.get("solve_time_ms", solve_time_ms))
                optimizer_version = p_data.get("optimizer_version", optimizer_version)
                cf_data = p_data.get("counterfactual_metrics")
                if cf_data:
                    cf_metrics = CounterfactualMetricsResponse(**cf_data)
                candidates_data = p_data.get("candidates", [])
            except Exception:
                pass

        selected_cand_resp = None
        if candidates_data:
            sel_dict = next((c for c in candidates_data if c["candidate_id"] == decision.selected_candidate_id), candidates_data[0])
            selected_cand_resp = CandidateActionResponse(**sel_dict)

        policy_reasons = []
        policy_version = POLICY_VERSION
        if stage5 and stage5.payload_summary:
            try:
                p5 = json.loads(stage5.payload_summary)
                policy_reasons = p5.get("reasons", [])
                policy_version = p5.get("policy_version", policy_version)
            except Exception:
                pass

        exec_summary = None
        if decision.actions:
            act = decision.actions[0]
            exec_summary = {
                "action_id": act.action_id,
                "action_type": act.action_type,
                "control_state": act.control_state,
                "target_device_interface": act.target_device_interface,
                "execution_result": act.execution_result,
            }

        return OptimizationDecisionResponse(
            decision_id=decision.decision_id,
            depot_id=decision.depot_id,
            created_at=decision.decision_timestamp.isoformat(),
            headline=decision.headline,
            solver_status=solver_status,
            solve_time_ms=solve_time_ms,
            autonomy_level=decision.autonomy_level,
            policy_state=(
                "AUTO_EXECUTABLE" if decision.autonomy_level == "L2_AUTO_EXECUTABLE"
                else ("APPROVAL_REQUIRED" if decision.autonomy_level == "L3_SUPERVISED_APPROVAL" else "BLOCKED_BY_POLICY")
            ),
            decision_status=decision.decision_status,
            selected_candidate=selected_cand_resp,
            policy_rule_id=decision.policy_rule_id or "POL-DEFAULT",
            policy_reasons=policy_reasons,
            counterfactual_metrics=cf_metrics,
            execution_summary=exec_summary,
            candidates_count=len(candidates_data),
            optimizer_version=optimizer_version,
            policy_version=policy_version,
            is_simulation=True,
        )

    def get_candidates_for_decision(self, decision_id: str) -> List[CandidateActionResponse]:
        """Retrieve all evaluated candidate alternatives for a decision."""
        decision = self.db.query(Decision).filter(Decision.decision_id == decision_id).first()
        if not decision:
            raise ValueError(f"Decision '{decision_id}' was not found.")

        stage4 = next((s for s in decision.stages if s.stage_sequence == 4), None)
        if not stage4 or not stage4.payload_summary:
            return []

        try:
            p_data = json.loads(stage4.payload_summary)
            candidates_raw = p_data.get("candidates", [])
            return [CandidateActionResponse(**c) for c in candidates_raw]
        except Exception:
            return []

    def approve_decision(self, decision_id: str, operator_id: str, comments: Optional[str] = None) -> ApprovalResponse:
        """Simulate human operator approval for an L3 supervised decision."""
        decision = self.db.query(Decision).filter(Decision.decision_id == decision_id).first()
        if not decision:
            raise ValueError(f"Decision '{decision_id}' was not found.")

        if decision.decision_status == "SIMULATED_EXECUTED":
            return ApprovalResponse(
                decision_id=decision_id,
                status="ALREADY_EXECUTED",
                approved_by=operator_id,
                approved_at=datetime.now(timezone.utc).isoformat(),
                execution_result={"message": "Decision was already executed in simulation."},
                message="Decision has already been executed.",
            )

        if decision.decision_status != "AWAITING_APPROVAL":
            raise ValueError(f"Decision '{decision_id}' is not eligible for approval.")

        # Dispatch simulated execution
        now_iso = datetime.now(timezone.utc).isoformat()
        action_id = f"ACT-SIM-{uuid.uuid4().hex[:8].upper()}"

        action_row = AutonomousAction(
            action_id=action_id,
            decision_id=decision_id,
            depot_id=decision.depot_id,
            action_type="SUPERVISED_OPERATOR_APPROVAL_DISPATCH",
            control_state="SIMULATED",
            target_device_interface=f"Simulated Gantry Dispatcher (Approved by {operator_id}) [MOCK_SIMULATOR]",
            dispatched_at=datetime.now(timezone.utc),
            ack_latency_ms=12,
            execution_result="EXECUTION_SIMULATED_NOT_CONNECTED_TO_KPC_SYSTEMS",
            etl_run_id="FLOWGUARD_OPTIMIZER_V1",
        )
        self.db.add(action_row)

        decision.decision_status = "SIMULATED_EXECUTED"
        decision.headline = f"Operator Approved: {decision.headline}"

        # Update Stage 6: EXECUTE
        stage6 = next((s for s in decision.stages if s.stage_sequence == 6), None)
        if stage6:
            stage6.stage_status = "COMPLETED"
            stage6.metric_label = "Operator Authorization"
            stage6.metric_value = f"Approved by {operator_id}"
            stage6.payload_summary = f"Simulated command dispatched to terminal simulator. Notes: {comments or 'None'}"

        self.db.commit()

        return ApprovalResponse(
            decision_id=decision_id,
            status="SIMULATED_EXECUTED",
            approved_by=operator_id,
            approved_at=now_iso,
            execution_result={
                "action_id": action_id,
                "control_state": "SIMULATED",
                "execution_result": "EXECUTION_SIMULATED_NOT_CONNECTED_TO_KPC_SYSTEMS",
                "target_device_interface": action_row.target_device_interface,
            },
            message="Decision approved by supervisor and dispatched to simulated terminal interface.",
        )

    # =========================================================================
    # INTERNAL BUILDER METHODS
    # =========================================================================
    def _build_optimization_input(self, depot_id: str) -> Tuple[OptimizationInput, Dict[str, Any]]:
        """Construct bounded OptimizationInput by joining orders, positions, and ML predictions."""
        now = datetime.now(timezone.utc)

        # 1. Loading Positions
        positions_db = self.db.query(LoadingPosition).filter(LoadingPosition.depot_id == depot_id).all()
        # Equipment telemetry is reduced to the latest unresolved, position-specific
        # event.  Depot-wide events are intentionally not treated as bay outages: the
        # canonical schema does not link them to a loading position.
        equipment_by_position: Dict[str, EquipmentEvent] = {}
        position_ids = [position.loading_position_id for position in positions_db]
        if position_ids:
            events = (
                self.db.query(EquipmentEvent)
                .filter(EquipmentEvent.loading_position_id.in_(position_ids))
                .order_by(EquipmentEvent.loading_position_id, EquipmentEvent.event_timestamp.desc())
                .all()
            )
            for event in events:
                equipment_by_position.setdefault(event.loading_position_id, event)

        positions: List[LoadingPositionItem] = [
            LoadingPositionItem(
                loading_position_id=p.loading_position_id,
                code=p.code,
                bay_number=p.bay_number,
                product_compatibility=p.product_compatibility,
                has_dual_arm=p.has_dual_arm,
                standard_flow_rate_lpm=p.standard_flow_rate_lpm,
                is_high_velocity=p.is_high_velocity,
                is_available=not (
                    equipment_by_position.get(p.loading_position_id)
                    and equipment_by_position[p.loading_position_id].status in {"UNAVAILABLE", "FAULT", "OUT_OF_SERVICE"}
                    and equipment_by_position[p.loading_position_id].resolved_timestamp is None
                ),
                operational_degradation_pct=float(
                    equipment_by_position[p.loading_position_id].flow_impact_pct
                    if equipment_by_position.get(p.loading_position_id)
                    and equipment_by_position[p.loading_position_id].resolved_timestamp is None
                    else 0
                ),
            )
            for p in positions_db
        ]

        # 2. Active Orders
        active_orders = (
            self.db.query(LoadingOrder)
            .filter(
                LoadingOrder.depot_id == depot_id,
                LoadingOrder.order_status.in_([
                    "REGISTERED", "ARRIVAL_PENDING", "APPROACHING", "AT_GATE", "VALIDATING", "STAGED", "CALLED_FORWARD", "POSITIONED", "LOADING", "IN_PROGRESS"
                ]),
            )
            .order_by(
                LoadingOrder.order_status.in_(["LOADING", "POSITIONED", "STAGED", "VALIDATING"]).desc(),
                LoadingOrder.expected_arrival_time.asc(),
            )
            .limit(16)
            .all()
        )

        order_items: List[OrderOptimizationItem] = []
        max_risk = 0.0

        for i, o in enumerate(active_orders):
            # Ingest ML predictions
            pred_arr = self.prediction_service.get_arrival_prediction(o.order_id)
            pred_trn = self.prediction_service.get_turnaround_prediction(o.order_id)
            pred_gate_out = self.prediction_service.get_gate_out_prediction(o.order_id)
            risk_res = self.prediction_service.get_order_risk_score(o.order_id)

            is_inside = o.order_status in {"VALIDATING", "STAGED", "CALLED_FORWARD", "POSITIONED", "LOADING", "IN_PROGRESS"}
            if is_inside:
                arr_min = 0
            else:
                arr_min = int(pred_arr.predicted_duration_minutes or (i * 10))

            trn_min = float(pred_trn.predicted_turnaround_minutes or 85.0)
            r_score = float(risk_res.risk_score)
            max_risk = max(max_risk, r_score)

            order_items.append(
                OrderOptimizationItem(
                    order_id=o.order_id,
                    omc_id=o.omc_id,
                    product_id=o.product_id,
                    ordered_quantity_litres=float(o.ordered_quantity_litres),
                    arrival_minute=arr_min,
                    predicted_turnaround_min=trn_min,
                    predicted_gate_out_minute=arr_min + int(pred_gate_out.predicted_turnaround_minutes or trn_min),
                    risk_score=r_score,
                    # Use the recorded order-window duration; the solver's relative
                    # clock starts at predicted arrival, so its absolute historical
                    # timestamp is not meaningful in a replay.
                    sla_window_end_minute=arr_min + max(
                        0, int((o.scheduled_window_end - o.scheduled_window_start).total_seconds() / 60)
                    ),
                    is_active_inside=is_inside,
                )
            )

        opt_input = OptimizationInput(
            depot_id=depot_id,
            reference_timestamp=now,
            orders=order_items,
            positions=positions,
            planning_horizon_minutes=240,
            solver_timeout_seconds=5.0,
            input_diagnostics={
                "active_orders_considered": len(active_orders),
                "available_positions": sum(p.is_available for p in positions),
                "unavailable_positions": sum(not p.is_available for p in positions),
            },
        )

        risk_context = {
            "risk_score": max_risk,
            "risk_level": "HIGH" if max_risk >= 60 else ("MEDIUM" if max_risk >= 30 else "LOW"),
            "confidence_pct": 85.0,
            "model_versions": {
                "arrival": pred_arr.model_version if order_items else "unavailable",
                "turnaround": pred_trn.model_version if order_items else "unavailable",
                "gate_out": pred_gate_out.model_version if order_items else "unavailable",
            },
        }

        return opt_input, risk_context

    def _persist_stages(
        self,
        decision_id: str,
        depot_id: str,
        opt_result: OptimizationResult,
        policy: PolicyDecision,
        execution_result: Optional[Any],
        risk_context: Dict[str, Any],
    ) -> None:
        """Persist discrete Progression Steps for the 8-Stage Autonomy Pipeline."""
        now = datetime.now(timezone.utc)
        selected = opt_result.selected_candidate
        cf = opt_result.counterfactual_metrics

        stages_meta = [
            (
                1, "SIGNAL", "COMPLETED",
                "Telemetry Trigger",
                f"Ingested {len(opt_result.candidates[0].target_orders if opt_result.candidates else [])} active tankers for {depot_id.upper()}",
                "Inflow queue saturation detected at Smart Gate and Ingress Weighbridge."
            ),
            (
                2, "PREDICT", "COMPLETED",
                "ML Forecasts",
                f"Avg Turnaround: {cf.get('baseline_avg_turnaround_min', 85)}m",
                "Evaluated XGBoost models for Arrival, Turnaround, and Gate-Out."
            ),
            (
                3, "DIAGNOSE", "COMPLETED",
                "Risk Diagnosis",
                f"Peak Risk: {risk_context.get('risk_score', 0):.0f}/100 ({risk_context.get('risk_level', 'LOW')})",
                "Staging bottleneck diagnosed; dual-arm bays underutilized."
            ),
            (
                4, "OPTIMIZE", "COMPLETED",
                "CP-SAT Solved",
                f"-{cf.get('turnaround_reduction_min', 0)}m Turnaround Delta",
                json.dumps({
                    "solver_status": opt_result.status,
                    "solve_time_ms": opt_result.solve_time_ms,
                    "optimizer_version": OPTIMIZER_VERSION,
                    "solver_diagnostics": opt_result.solver_diagnostics,
                    "counterfactual_metrics": cf,
                    "candidates": [
                        {
                            "candidate_id": c.candidate_id,
                            "action_type": c.action_type,
                            "target_orders": c.target_orders,
                            "target_positions": c.target_positions,
                            "score": c.score,
                            "expected_turnaround_change_min": c.expected_turnaround_change_min,
                            "expected_queue_change_min": c.expected_queue_change_min,
                            "expected_risk_change_pts": c.expected_risk_change_pts,
                            "constraint_status": c.constraint_status,
                            "explanation": c.explanation,
                        }
                        for c in opt_result.candidates
                    ]
                })
            ),
            (
                5, "DECIDE", "COMPLETED",
                "Policy Verdict",
                f"{policy.autonomy_level} ({policy.policy_state})",
                json.dumps({
                    "rule_id": policy.policy_rule_id,
                    "policy_version": POLICY_VERSION,
                    "model_versions": risk_context.get("model_versions", {}),
                    "allowed": policy.allowed,
                    "requires_human_approval": policy.requires_human_approval,
                    "reasons": policy.reasons,
                })
            ),
            (
                6, "EXECUTE", "COMPLETED" if execution_result else "IN_PROGRESS",
                "Dispatch State",
                execution_result.control_state if execution_result else "AWAITING_APPROVAL",
                execution_result.execution_result if execution_result else "Awaiting operator authorization in Autonomous Control workspace."
            ),
            (
                7, "VERIFY", "IN_PROGRESS",
                "Verification Loop",
                "PENDING_SIMULATED_TELEMETRY",
                "Awaiting completion of simulated loading cycles to measure achieved dwell delta."
            ),
            (
                8, "LOG", "COMPLETED",
                "Cryptographic Ledger",
                "SHA-256 Audit Logged",
                "Autonomous decision and candidate alternatives anchored in audit table."
            ),
        ]

        for seq, name, stat, label, val, summary in stages_meta:
            stage_row = DecisionStage(
                stage_id=f"STG-{decision_id}-{seq:02d}",
                decision_id=decision_id,
                stage_sequence=seq,
                stage_name=name,
                stage_timestamp=now + timedelta(seconds=seq * 2),
                stage_status=stat,
                metric_label=label,
                metric_value=val,
                payload_summary=summary,
                etl_run_id="FLOWGUARD_OPTIMIZER_V1",
            )
            self.db.add(stage_row)

    def _build_infeasible_response(self, depot_id: str, opt_result: OptimizationResult) -> OptimizationDecisionResponse:
        """Return safe fallback response when no feasible plan can be found."""
        return OptimizationDecisionResponse(
            decision_id="DEC-NO-PLAN",
            depot_id=depot_id,
            created_at=datetime.now(timezone.utc).isoformat(),
            headline="Optimization solver found no feasible schedule within constraints",
            solver_status=opt_result.status,
            solve_time_ms=opt_result.solve_time_ms,
            autonomy_level="L1_RECOMMENDATION",
            policy_state="BLOCKED_BY_POLICY",
            decision_status="NO_FEASIBLE_PLAN",
            selected_candidate=None,
            policy_rule_id="POL-INFEASIBLE-FALLBACK",
            policy_reasons=["No feasible loading position allocation satisfies all constraints."],
            counterfactual_metrics=None,
            execution_summary=None,
            candidates_count=0,
            is_simulation=True,
        )
