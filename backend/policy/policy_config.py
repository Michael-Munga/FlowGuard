"""FlowGuard Demo Governance and Bounded-Autonomy Policy Configuration.

These policy assumptions represent demo operational boundaries for KPC terminal dispatch:
'Autonomy by default. Human approval by exception.'
"""

from typing import List, Set
from pydantic import BaseModel, Field


class PolicyThresholds(BaseModel):
    """Configurable thresholds governing automated dispatch vs. required supervisor approval."""

    # Maximum number of tankers that an autonomous intervention may shift without human sign-off
    max_autonomous_orders_count: int = Field(
        default=6,
        description="Threshold of affected orders before supervisor sign-off is required."
    )

    # Maximum lead time variance (in minutes) an order slot may be shifted autonomously
    max_autonomous_slot_shift_minutes: int = Field(
        default=45,
        description="Maximum minutes an order can be advanced or deferred without human sign-off."
    )

    # Minimum model confidence required to permit automated execution
    min_confidence_pct_for_autonomy: float = Field(
        default=75.0,
        description="Minimum prediction confidence (%) required for L2_AUTO_EXECUTABLE."
    )

    # Risk tiers requiring explicit human-in-the-loop oversight
    require_approval_for_critical_risk: bool = Field(
        default=True,
        description="Critical risk situations (score >= 85) require human supervisor sign-off."
    )

    # Permitted action types for Level 2 automated dispatch
    allowed_autonomous_action_types: Set[str] = Field(
        default_factory=lambda: {
            "RESEQUENCE_QUEUE",
            "BALANCE_LOADING_POSITIONS",
            "ASSIGN_COMPATIBLE_POSITION",
            "PRIORITIZE_HIGH_RISK_ORDER",
        },
        description="Interventions categorized as routine and reversible within physical depot limits."
    )

    # Action types that strictly require human authorization
    restricted_action_types: Set[str] = Field(
        default_factory=lambda: {
            "DEFER_LOW_RISK_ORDER",
            "BAY_CLOSURE_DIVERT",
            "CANCEL_UNSCHEDULED_ORDER",
        },
        description="High-impact actions that impact commercial OMC contracts."
    )


# Default global instance
default_policy_thresholds = PolicyThresholds()
