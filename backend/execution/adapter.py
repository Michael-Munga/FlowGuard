"""Simulated execution adapter and hardware isolation boundary for FlowGuard.

CRITICAL SAFETY DIRECTIVE:
This adapter explicitly operates in SIMULATED mode. It DOES NOT connect to,
actuate, or transmit electrical signals to any real KPC SCADA, PLC, gantry flow meter,
or weighbridge system.
"""

from abc import ABC, abstractmethod
from datetime import datetime, timezone
import uuid
from typing import Dict, Any, List
from pydantic import BaseModel, Field

from backend.optimization.models import CandidateAction
from backend.policy.evaluator import PolicyDecision


class ExecutionResult(BaseModel):
    """Execution dispatch telemetry payload."""
    action_id: str
    decision_id: str
    depot_id: str
    action_type: str
    control_state: str  # SIMULATED, REJECTED
    target_device_interface: str
    dispatched_at: str
    ack_latency_ms: int
    execution_result: str
    target_orders: List[str]
    target_positions: List[str]
    is_simulation: bool = True
    safety_disclaimer: str = (
        "SIMULATED_EXECUTION: Explicitly not connected to live KPC physical gantry or SCADA systems."
    )


class ExecutionAdapter(ABC):
    """Abstract interface defining the execution boundary."""

    @abstractmethod
    def dispatch_action(
        self,
        decision_id: str,
        depot_id: str,
        candidate: CandidateAction,
        policy: PolicyDecision,
    ) -> ExecutionResult:
        """Dispatch policy-authorized intervention."""
        pass


class SimulatedExecutionAdapter(ExecutionAdapter):
    """Simulated execution adapter that records mock actuation events."""

    def dispatch_action(
        self,
        decision_id: str,
        depot_id: str,
        candidate: CandidateAction,
        policy: PolicyDecision,
    ) -> ExecutionResult:
        """Dispatch simulated operational intervention."""
        now_iso = datetime.now(timezone.utc).isoformat()
        action_id = f"ACT-SIM-{uuid.uuid4().hex[:8].upper()}"

        if not policy.allowed:
            return ExecutionResult(
                action_id=action_id,
                decision_id=decision_id,
                depot_id=depot_id,
                action_type=candidate.action_type,
                control_state="REJECTED_BY_POLICY",
                target_device_interface="Simulated Depot Control Gateway (Mock Interface)",
                dispatched_at=now_iso,
                ack_latency_ms=0,
                execution_result="BLOCKED_NOT_DISPATCHED",
                target_orders=candidate.target_orders,
                target_positions=candidate.target_positions,
                is_simulation=True,
            )

        # Build clear simulated device interface target
        bays_str = ", ".join(candidate.target_positions[:3])
        target_interface = f"Simulated Gantry Loading Gateway (Bays: {bays_str}) [MOCK_SIMULATOR]"

        return ExecutionResult(
            action_id=action_id,
            decision_id=decision_id,
            depot_id=depot_id,
            action_type=candidate.action_type,
            control_state="SIMULATED",
            target_device_interface=target_interface,
            dispatched_at=now_iso,
            ack_latency_ms=18,  # simulated loopback latency
            execution_result="EXECUTION_SIMULATED_NOT_CONNECTED_TO_KPC_SYSTEMS",
            target_orders=candidate.target_orders,
            target_positions=candidate.target_positions,
            is_simulation=True,
        )
