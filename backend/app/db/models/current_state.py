"""SQLAlchemy models for FlowGuard current-state operational projections."""

from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, ForeignKey, Index
from backend.app.db.base import Base


class CurrentDepotState(Base):
    """Real-time operational summary projection per depot."""
    __tablename__ = "current_depot_state"

    depot_id = Column(String(32), ForeignKey("depots.depot_id"), primary_key=True)
    scenario_id = Column(String(64), nullable=False)
    scenario_name = Column(String(128), nullable=False)
    scenario_time = Column(DateTime(timezone=True), nullable=False)
    trucks_inside = Column(Integer, nullable=False, default=0)
    actively_loading = Column(Integer, nullable=False, default=0)
    queue_count = Column(Integer, nullable=False, default=0)
    validating_count = Column(Integer, nullable=False, default=0)
    positioned_count = Column(Integer, nullable=False, default=0)
    approaching_count = Column(Integer, nullable=False, default=0)
    total_active_orders = Column(Integer, nullable=False, default=0)
    total_positions = Column(Integer, nullable=False, default=0)
    available_positions = Column(Integer, nullable=False, default=0)
    occupied_positions = Column(Integer, nullable=False, default=0)
    degraded_positions = Column(Integer, nullable=False, default=0)
    unavailable_positions = Column(Integer, nullable=False, default=0)
    bay_utilization_pct = Column(Numeric(5, 1), nullable=False, default=0.0)
    queue_pressure_ratio = Column(Numeric(5, 2), nullable=False, default=0.0)
    queue_pressure_level = Column(String(32), nullable=False, default="NORMAL")
    congestion_level = Column(String(32), nullable=False, default="LOW")
    current_turnaround_min = Column(Numeric(6, 1), nullable=False, default=65.0)
    updated_at = Column(DateTime(timezone=True), nullable=False)


class CurrentLoadingPositionState(Base):
    """Real-time gantry loading position hardware status projection."""
    __tablename__ = "current_loading_position_state"

    loading_position_id = Column(String(32), ForeignKey("loading_positions.loading_position_id"), primary_key=True)
    depot_id = Column(String(32), ForeignKey("depots.depot_id"), nullable=False)
    bay_number = Column(Integer, nullable=False)
    code = Column(String(16), nullable=False)
    product_compatibility = Column(String(128), nullable=False)
    has_dual_arm = Column(Boolean, nullable=False, default=False)
    standard_flow_rate_lpm = Column(Integer, nullable=False)
    status = Column(String(32), nullable=False, default="AVAILABLE")  # AVAILABLE, OCCUPIED, DEGRADED, UNAVAILABLE
    current_order_id = Column(String(32), nullable=True)
    current_truck_registration = Column(String(32), nullable=True)
    flow_impact_pct = Column(Integer, nullable=False, default=0)
    effective_flow_rate_lpm = Column(Integer, nullable=False)
    operational_notes = Column(String(255), nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        Index("ix_curr_pos_depot", "depot_id"),
        Index("ix_curr_pos_status", "status"),
    )


class CurrentOrderState(Base):
    """Real-time order lifecycle stage and yard positioning projection."""
    __tablename__ = "current_order_state"

    order_id = Column(String(32), ForeignKey("loading_orders.order_id"), primary_key=True)
    depot_id = Column(String(32), ForeignKey("depots.depot_id"), nullable=False)
    omc_id = Column(String(64), ForeignKey("omcs.omc_id"), nullable=False)
    truck_id = Column(String(32), ForeignKey("trucks.truck_id"), nullable=False)
    truck_registration = Column(String(32), nullable=False)
    driver_name = Column(String(128), nullable=False)
    product_id = Column(String(16), ForeignKey("products.product_id"), nullable=False)
    ordered_quantity_litres = Column(Numeric(12, 2), nullable=False)
    current_stage = Column(String(32), nullable=False)  # APPROACHING, VALIDATING, STAGED, POSITIONED, LOADING
    stage_display = Column(String(64), nullable=False)
    stage_entered_at = Column(DateTime(timezone=True), nullable=False)
    time_in_stage_min = Column(Integer, nullable=False, default=0)
    allocated_position_id = Column(String(32), nullable=True)
    allocated_bay_number = Column(Integer, nullable=True)
    expected_arrival_time = Column(DateTime(timezone=True), nullable=False)
    predicted_gate_out = Column(DateTime(timezone=True), nullable=True)
    predicted_turnaround_min = Column(Numeric(6, 1), nullable=False, default=65.0)
    risk_status = Column(String(16), nullable=False, default="GREEN")  # GREEN, AMBER, RED
    risk_label = Column(String(64), nullable=False, default="Nominal Flow")
    is_active_inside = Column(Boolean, nullable=False, default=True)
    updated_at = Column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        Index("ix_curr_ord_depot_stage", "depot_id", "current_stage"),
        Index("ix_curr_ord_omc", "omc_id"),
        Index("ix_curr_ord_inside", "depot_id", "is_active_inside"),
    )
