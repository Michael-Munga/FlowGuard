"""Policy evaluation engine for FlowGuard bounded autonomy."""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from backend.optimization.models import CandidateAction
from backend.policy.policy_config import PolicyThresholds, default_policy_thresholds


class PolicyDecision(BaseModel):
    """Authorization verdict and safety boundary classification."""
    candidate_id: str
    action_type: str
    policy_state: str  # AUTO_EXECUTABLE, APPROVAL_REQUIRED, BLOCKED_BY_POLICY
    autonomy_level: str  # L2_AUTO_EXECUTABLE, L3_SUPERVISED_APPROVAL, L1_RECOMMENDATION
    policy_rule_id: str
    allowed: bool
    requires_human_approval: bool
    reasons: List[str] = Field(default_factory=list)


class PolicyEvaluator:
    """Deterministic governance engine enforcing safety and autonomy boundaries."""

    def __init__(self, thresholds: Optional[PolicyThresholds] = None):
        self.thresholds = thresholds or default_policy_thresholds

    def evaluate(self, candidate: CandidateAction, risk_context: Optional[Dict[str, Any]] = None) -> PolicyDecision:
        """Evaluate candidate action against hard safety rules and autonomy limits."""
        reasons: List[str] = []
        risk_context = risk_context or {}

        # 1. Check Hard Constraint Violations (BLOCKED_BY_POLICY)
        if candidate.constraint_status != "FEASIBLE_VERIFIED":
            return PolicyDecision(
                candidate_id=candidate.candidate_id,
                action_type=candidate.action_type,
                policy_state="BLOCKED_BY_POLICY",
                autonomy_level="L1_RECOMMENDATION",
                policy_rule_id="POL-BLOCKED-CONSTRAINT-VIOLATION",
                allowed=False,
                requires_human_approval=False,
                reasons=[
                    f"Candidate violates physical or logical terminal constraints: {candidate.constraint_status}"
                ],
            )

        if not candidate.target_orders or not candidate.target_positions:
            return PolicyDecision(
                candidate_id=candidate.candidate_id,
                action_type=candidate.action_type,
                policy_state="BLOCKED_BY_POLICY",
                autonomy_level="L1_RECOMMENDATION",
                policy_rule_id="POL-BLOCKED-EMPTY-TARGETS",
                allowed=False,
                requires_human_approval=False,
                reasons=["Action targets empty order or position sets."],
            )

        # 2. Check Restricted Action Types
        if candidate.action_type in self.thresholds.restricted_action_types:
            reasons.append(
                f"Action '{candidate.action_type}' is designated high-impact and strictly requires supervisor sign-off."
            )
            return PolicyDecision(
                candidate_id=candidate.candidate_id,
                action_type=candidate.action_type,
                policy_state="APPROVAL_REQUIRED",
                autonomy_level="L3_SUPERVISED_APPROVAL",
                policy_rule_id="POL-L3-RESTRICTED-ACTION",
                allowed=True,
                requires_human_approval=True,
                reasons=reasons,
            )

        # 3. Check Order Count Threshold
        order_count = len(candidate.target_orders)
        if order_count > self.thresholds.max_autonomous_orders_count:
            reasons.append(
                f"Affected order volume ({order_count} tankers) exceeds autonomous limit "
                f"({self.thresholds.max_autonomous_orders_count})."
            )

        # 4. Check Critical Risk Situation (Human Oversight)
        risk_score = risk_context.get("risk_score", 0.0)
        risk_level = risk_context.get("risk_level", "LOW")
        if self.thresholds.require_approval_for_critical_risk and (risk_level == "CRITICAL" or risk_score >= 85.0):
            reasons.append(
                f"Terminal risk level is CRITICAL ({risk_score:.1f}/100); human oversight mandated by governance policy."
            )

        # 5. Check Confidence Threshold
        confidence_pct = risk_context.get("confidence_pct", 85.0)
        if confidence_pct < self.thresholds.min_confidence_pct_for_autonomy:
            reasons.append(
                f"Prediction confidence ({confidence_pct:.1f}%) is below minimum autonomous threshold "
                f"({self.thresholds.min_confidence_pct_for_autonomy}%)."
            )

        # 6. Check Action Type Allowlist for L2 Autonomy
        if candidate.action_type not in self.thresholds.allowed_autonomous_action_types:
            reasons.append(
                f"Action type '{candidate.action_type}' is not on the L2 pre-approved autonomous dispatch allowlist."
            )

        # Verdict Determination
        if reasons:
            # Human approval is required
            return PolicyDecision(
                candidate_id=candidate.candidate_id,
                action_type=candidate.action_type,
                policy_state="APPROVAL_REQUIRED",
                autonomy_level="L3_SUPERVISED_APPROVAL",
                policy_rule_id="POL-L3-SUPERVISED-OVERSIGHT",
                allowed=True,
                requires_human_approval=True,
                reasons=reasons,
            )

        # Pre-approved routine, reversible action
        return PolicyDecision(
            candidate_id=candidate.candidate_id,
            action_type=candidate.action_type,
            policy_state="AUTO_EXECUTABLE",
            autonomy_level="L2_AUTO_EXECUTABLE",
            policy_rule_id="POL-L2-ROUTINE-REVERSIBLE",
            allowed=True,
            requires_human_approval=False,
            reasons=[
                "Action is verified feasible, routine, and reversible within terminal gantry boundaries.",
                f"Affects {order_count} tankers (within autonomous limit of {self.thresholds.max_autonomous_orders_count}).",
                f"Confidence ({confidence_pct:.1f}%) satisfies autonomous dispatch criteria.",
            ],
        )
