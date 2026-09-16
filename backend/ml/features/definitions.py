"""Feature definitions, metadata, and target leakage validators for FlowGuard ML models."""

from typing import List, Dict, Any

# ==============================================================================
# 1. ARRIVAL PREDICTION MODEL FEATURES
# ==============================================================================
# Prediction Point: Order Registered or Telematics Signal Ingested (Pre-Arrival)
ARRIVAL_TARGET = "minutes_to_arrival"

ARRIVAL_CATEGORICAL_FEATURES: List[str] = [
    "depot_id",
    "omc_id",
    "product_id",
    "signal_quality",
]

ARRIVAL_NUMERIC_FEATURES: List[str] = [
    "ordered_quantity_litres",
    "planned_lead_time_min",
    "hour_of_day",
    "day_of_week",
    "has_telematics_signal",
    "estimated_distance_km",
    "signal_confidence_pct",
    "depot_baseline_turnaround_min",
    "depot_total_positions",
]

ARRIVAL_ALL_FEATURES: List[str] = ARRIVAL_CATEGORICAL_FEATURES + ARRIVAL_NUMERIC_FEATURES

# Forbidden features for arrival (Target Leakage Controls)
FORBIDDEN_ARRIVAL_COLUMNS: List[str] = [
    "actual_arrival_time",
    "gate_in_time",
    "gate_out_time",
    "validation_start",
    "validation_end",
    "validation_outcome",
    "staging_area_id",
    "queue_entry_time",
    "queue_exit_time",
    "wait_duration_minutes",
    "loading_start",
    "loading_end",
    "loading_duration_minutes",
    "actual_quantity_litres",
    "tare_weight_kg",
    "gross_weight_kg",
    "turnaround_minutes",
    "verification_status",
    "audit_event_id",
    "action_id",
]


# ==============================================================================
# 2. TURNAROUND PREDICTION MODEL FEATURES
# ==============================================================================
# Prediction Point: Weighbridge Gate-In Physical Check (Inside Depot Ingress)
TURNAROUND_TARGET = "turnaround_minutes"

TURNAROUND_CATEGORICAL_FEATURES: List[str] = [
    "depot_id",
    "omc_id",
    "product_id",
    "gate_lane",
]

TURNAROUND_NUMERIC_FEATURES: List[str] = [
    "ordered_quantity_litres",
    "depot_baseline_turnaround_min",
    "depot_total_positions",
    "dual_arm_bays",
    "compatible_bays_count",
    "gate_in_hour",
    "gate_in_day_of_week",
    "tare_weight_kg",
    "active_trucks_in_depot",
    "estimated_bay_utilization",
]

TURNAROUND_ALL_FEATURES: List[str] = TURNAROUND_CATEGORICAL_FEATURES + TURNAROUND_NUMERIC_FEATURES

# Forbidden features for turnaround (Target Leakage Controls)
FORBIDDEN_TURNAROUND_COLUMNS: List[str] = [
    "gate_out_time",
    "gross_weight_kg",
    "validation_end",
    "validation_duration_minutes",
    "staging_wait_duration_minutes",
    "queue_exit_time",
    "loading_start",
    "loading_end",
    "loading_duration_minutes",
    "actual_quantity_litres",
    "actual_flow_rate_lpm",
    "achieved_turnaround_min",
    "verification_status",
    "realized_savings_kes",
    "audit_reference_sha256",
]


# ==============================================================================
# 3. LEAKAGE VALIDATION UTILITIES
# ==============================================================================
def validate_arrival_features(columns: List[str]) -> None:
    """Ensure no post-arrival or outcome columns leak into the arrival feature set."""
    leaked = [col for col in columns if col in FORBIDDEN_ARRIVAL_COLUMNS]
    if leaked:
        raise ValueError(
            f"TARGET LEAKAGE DETECTED in Arrival Feature Matrix: {leaked}. "
            "These features occur after arrival and are strictly prohibited."
        )


def validate_turnaround_features(columns: List[str]) -> None:
    """Ensure no post-gate-in or completion columns leak into the turnaround feature set."""
    leaked = [col for col in columns if col in FORBIDDEN_TURNAROUND_COLUMNS]
    if leaked:
        raise ValueError(
            f"TARGET LEAKAGE DETECTED in Turnaround Feature Matrix: {leaked}. "
            "These features occur after gate-in and are strictly prohibited."
        )
