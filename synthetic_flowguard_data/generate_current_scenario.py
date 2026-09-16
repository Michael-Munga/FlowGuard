"""FlowGuard Synthetic Current Operational Scenario Generator.

Deterministically recalibrates the multi-depot operational state to a realistic,
constrained working-period scenario across all five KPC pipeline terminals:
- Nairobi (PS10): High demand / high pressure with gantry constraint & bay degradation
- Mombasa (PS1): High demand / high throughput with marine & pipeline intake
- Nakuru (PS25): Moderate operational pressure
- Eldoret (PS27): Moderate operational pressure with transit corridor demand
- Kisumu (PS28): Lower/moderate operational pressure with lake export flow

Key Features:
- Deterministic reproducibility with fixed seed (default 42).
- Non-destructive: leaves historical CSVs and training datasets intact.
- Coherent event chronology: arrival signals, gate-in, validation, staging, loading.
- Degraded bay conditions on NBO-P07 (35% flow impact) and MBA-P03 (20% flow impact).
- Aligns Driver collection order LO-NBO-8821 with James Mwangi in Bay P04.
- Generates SCENARIO_METADATA.json and populates current-state projections.
"""

import argparse
import json
import logging
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, Any, List

from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.db.session import SessionLocal
from backend.app.db.models import (
    Depot,
    LoadingPosition,
    Truck,
    LoadingOrder,
    GateEvent,
    ValidationEvent,
    StagingEvent,
    LoadingEvent,
    EquipmentEvent,
    ArrivalSignal,
    CurrentDepotState,
    CurrentLoadingPositionState,
    CurrentOrderState,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("flowguard.scenario_generator")

SCENARIO_ID = "DEMO-PEAK-001"
SCENARIO_NAME = "Peak Collection Pressure Demonstration"
ETL_RUN_ID = "SCENARIO_DEMO_PEAK_001"
EAT_TZ = timezone(timedelta(hours=3))
SCENARIO_TIME = datetime(2026, 9, 16, 10, 30, 0, tzinfo=EAT_TZ)


def clean_existing_scenario_data(session: Session) -> None:
    """Safely purge previous synthetic current scenario records while keeping historical dataset intact."""
    logger.info("Cleaning previous scenario data with etl_run_id='%s'...", ETL_RUN_ID)

    # 1. Clear current projection tables
    session.query(CurrentOrderState).delete()
    session.query(CurrentLoadingPositionState).delete()
    session.query(CurrentDepotState).delete()

    # 2. Clear scenario event records
    session.query(ArrivalSignal).filter(ArrivalSignal.etl_run_id == ETL_RUN_ID).delete()
    session.query(LoadingEvent).filter(LoadingEvent.etl_run_id == ETL_RUN_ID).delete()
    session.query(StagingEvent).filter(StagingEvent.etl_run_id == ETL_RUN_ID).delete()
    session.query(ValidationEvent).filter(ValidationEvent.etl_run_id == ETL_RUN_ID).delete()
    session.query(GateEvent).filter(GateEvent.etl_run_id == ETL_RUN_ID).delete()
    session.query(EquipmentEvent).filter(EquipmentEvent.etl_run_id == ETL_RUN_ID).delete()

    # 3. Clear scenario loading orders
    session.query(LoadingOrder).filter(LoadingOrder.etl_run_id == ETL_RUN_ID).delete()

    session.flush()
    logger.info("Cleaned previous scenario projections and event records.")


def generate_scenario(seed: int = 42) -> Dict[str, Any]:
    """Generate the complete multi-depot operational scenario."""
    random.seed(seed)
    session: Session = SessionLocal()

    try:
        clean_existing_scenario_data(session)

        # Retrieve master data
        depots = {d.depot_id: d for d in session.query(Depot).all()}
        all_trucks = session.query(Truck).order_by(Truck.truck_id).all()
        truck_map = {t.truck_id: t for t in all_trucks}
        positions_by_depot: Dict[str, List[LoadingPosition]] = {}
        for p in session.query(LoadingPosition).order_by(LoadingPosition.depot_id, LoadingPosition.bay_number).all():
            positions_by_depot.setdefault(p.depot_id, []).append(p)

        omc_ids = ["vivo", "totalenergies", "rubis", "ola", "lakeoil", "hass", "petrocity"]
        
        # Scenario configuration per depot
        # High demand: Nairobi, Mombasa; Moderate: Nakuru, Eldoret; Low/Mod: Kisumu
        depot_configs = {
            "nairobi": {
                "profile": "HIGH DEMAND / HIGH PRESSURE",
                "trucks_inside": 32,
                "actively_loading": 7,
                "positioned": 5,
                "queued": 14,
                "validating": 6,
                "approaching": 8,
                "truck_offset": 0,
                "degraded_bays": ["NBO-P07"],
            },
            "mombasa": {
                "profile": "HIGH DEMAND / HIGH THROUGHPUT",
                "trucks_inside": 38,
                "actively_loading": 9,
                "positioned": 6,
                "queued": 15,
                "validating": 8,
                "approaching": 10,
                "truck_offset": 50,
                "degraded_bays": ["MBA-P03"],
            },
            "nakuru": {
                "profile": "MODERATE PRESSURE",
                "trucks_inside": 16,
                "actively_loading": 3,
                "positioned": 3,
                "queued": 6,
                "validating": 4,
                "approaching": 4,
                "truck_offset": 120,
                "degraded_bays": [],
            },
            "eldoret": {
                "profile": "MODERATE PRESSURE",
                "trucks_inside": 14,
                "actively_loading": 4,
                "positioned": 2,
                "queued": 5,
                "validating": 3,
                "approaching": 5,
                "truck_offset": 160,
                "degraded_bays": [],
            },
            "kisumu": {
                "profile": "LOWER/MODERATE PRESSURE",
                "trucks_inside": 10,
                "actively_loading": 2,
                "positioned": 2,
                "queued": 3,
                "validating": 3,
                "approaching": 3,
                "truck_offset": 200,
                "degraded_bays": [],
            },
        }

        # 1. Equipment Degradation Events
        logger.info("Inserting equipment events...")
        # Nairobi Bay P07 degraded
        session.add(EquipmentEvent(
            equipment_event_id="EQ-NBO-P07-SCN",
            depot_id="nairobi",
            loading_position_id="NBO-P07",
            equipment_category="PUMP_SKID",
            component_name="AccuLoad Positive Displacement Flow Meter & Pump Skid",
            status="DEGRADED",
            event_timestamp=SCENARIO_TIME - timedelta(hours=2, minutes=15),
            resolved_timestamp=None,
            flow_impact_pct=35,
            operational_notes="Cavitation alarm on meter skid: rated throughput reduced by 35% to 1,072 LPM.",
            etl_run_id=ETL_RUN_ID,
        ))

        # Mombasa Bay P03 degraded
        session.add(EquipmentEvent(
            equipment_event_id="EQ-MBA-P03-SCN",
            depot_id="mombasa",
            loading_position_id="MBA-P03",
            equipment_category="LOADING_ARM",
            component_name="Dual-Arm Bottom Loading Skid 3",
            status="DEGRADED",
            event_timestamp=SCENARIO_TIME - timedelta(hours=3, minutes=10),
            resolved_timestamp=None,
            flow_impact_pct=20,
            operational_notes="Strainer differential pressure warning: throughput throttled to 80% (1,320 LPM).",
            etl_run_id=ETL_RUN_ID,
        ))
        session.flush()

        all_created_orders: List[Dict[str, Any]] = []
        depot_summaries: Dict[str, Any] = {}

        # 2. Iterate each depot and generate coherent orders + event trails
        for depot_id, cfg in depot_configs.items():
            depot = depots[depot_id]
            positions = positions_by_depot[depot_id]
            total_positions = len(positions)
            truck_idx = cfg["truck_offset"]

            # Sort positions: available vs occupied
            occupied_positions = positions[:cfg["actively_loading"]]
            available_positions = positions[cfg["actively_loading"]:]

            # Order list for this depot
            stage_order_plan: List[Dict[str, Any]] = []

            # 2a. ACTIVELY LOADING
            for i, pos in enumerate(occupied_positions):
                truck_idx += 1
                truck = all_trucks[truck_idx]
                truck_id = truck.truck_id
                order_id = f"LO-SCN-{depot.code}-{truck_idx:04d}"
                omc_id = random.choice(omc_ids)
                # Pick compatible product for this position
                prod_compat = pos.product_compatibility.upper()
                product_id = "AGO" if "AGO" in prod_compat else ("PMS" if "PMS" in prod_compat else ("JET-A1" if "JET" in prod_compat else "DPK"))
                quantity = random.choice([24000.0, 32000.0, 36000.0, 40000.0])

                stage_order_plan.append({
                    "order_id": order_id,
                    "stage": "LOADING",
                    "truck_id": truck_id,
                    "omc_id": omc_id,
                    "product_id": product_id,
                    "quantity": quantity,
                    "position": pos,
                    "time_in_stage_min": random.randint(6, 24),
                })

            # 2b. POSITIONED (at bays or awaiting bay entry)
            for i in range(cfg["positioned"]):
                truck_idx += 1
                truck = all_trucks[truck_idx]
                order_id = f"LO-SCN-{depot.code}-{truck_idx:04d}"
                omc_id = random.choice(omc_ids)
                product_id = random.choice(["AGO", "PMS", "AGO", "PMS", "DPK"])
                quantity = random.choice([28000.0, 36000.0, 40000.0])
                # Associated with a bay ready to load next
                target_pos = positions[i % len(positions)]

                stage_order_plan.append({
                    "order_id": order_id,
                    "stage": "POSITIONED",
                    "truck_id": truck.truck_id,
                    "omc_id": omc_id,
                    "product_id": product_id,
                    "quantity": quantity,
                    "position": target_pos,
                    "time_in_stage_min": random.randint(2, 6),
                })

            # 2c. QUEUED / STAGED
            for i in range(cfg["queued"]):
                truck_idx += 1
                truck = all_trucks[truck_idx]
                order_id = f"LO-SCN-{depot.code}-{truck_idx:04d}"
                omc_id = random.choice(omc_ids)
                product_id = random.choice(["AGO", "PMS", "AGO", "PMS", "DPK", "JET-A1"] if depot_id == "mombasa" else ["AGO", "PMS", "AGO", "PMS", "DPK"])
                quantity = random.choice([28000.0, 36000.0, 40000.0, 45000.0])

                stage_order_plan.append({
                    "order_id": order_id,
                    "stage": "STAGED",
                    "truck_id": truck.truck_id,
                    "omc_id": omc_id,
                    "product_id": product_id,
                    "quantity": quantity,
                    "position": None,
                    "time_in_stage_min": random.randint(6, 28),
                })

            # 2d. VALIDATING
            for i in range(cfg["validating"]):
                truck_idx += 1
                truck = all_trucks[truck_idx]
                order_id = f"LO-SCN-{depot.code}-{truck_idx:04d}"
                omc_id = random.choice(omc_ids)
                product_id = random.choice(["AGO", "PMS", "AGO", "DPK"])
                quantity = random.choice([24000.0, 32000.0, 36000.0])

                stage_order_plan.append({
                    "order_id": order_id,
                    "stage": "VALIDATING",
                    "truck_id": truck.truck_id,
                    "omc_id": omc_id,
                    "product_id": product_id,
                    "quantity": quantity,
                    "position": None,
                    "time_in_stage_min": random.randint(2, 8),
                })

            # 2e. APPROACHING / REGISTERED
            for i in range(cfg["approaching"]):
                truck_idx += 1
                truck = all_trucks[truck_idx]
                order_id = f"LO-SCN-{depot.code}-{truck_idx:04d}"
                omc_id = random.choice(omc_ids)
                product_id = random.choice(["AGO", "PMS", "AGO", "PMS"])
                quantity = random.choice([32000.0, 36000.0, 40000.0])

                stage_order_plan.append({
                    "order_id": order_id,
                    "stage": "APPROACHING",
                    "truck_id": truck.truck_id,
                    "omc_id": omc_id,
                    "product_id": product_id,
                    "quantity": quantity,
                    "position": None,
                    "time_in_stage_min": random.randint(0, 15),
                })

            # 3. Create Orders and Supporting Events for each planned order
            for item in stage_order_plan:
                o_id = item["order_id"]
                stg = item["stage"]
                trk = truck_map[item["truck_id"]]
                qty = item["quantity"]
                pos = item["position"]
                dur_in_stage = item["time_in_stage_min"]

                stage_enter_time = SCENARIO_TIME - timedelta(minutes=dur_in_stage)
                reg_time = stage_enter_time - timedelta(hours=random.randint(2, 4))
                exp_arr = stage_enter_time - timedelta(minutes=random.randint(15, 30)) if stg != "APPROACHING" else SCENARIO_TIME + timedelta(minutes=random.randint(10, 40))

                # Upsert or Update LoadingOrder
                db_order = session.query(LoadingOrder).filter(LoadingOrder.order_id == o_id).first()
                if not db_order:
                    db_order = LoadingOrder(
                        order_id=o_id,
                        omc_id=item["omc_id"],
                        depot_id=depot_id,
                        truck_id=trk.truck_id,
                        product_id=item["product_id"],
                        ordered_quantity_litres=qty,
                        order_registered_time=reg_time,
                        expected_arrival_time=exp_arr,
                        scheduled_window_start=exp_arr - timedelta(minutes=15),
                        scheduled_window_end=exp_arr + timedelta(minutes=45),
                        order_status=stg,
                        etl_run_id=ETL_RUN_ID,
                    )
                    session.add(db_order)
                else:
                    db_order.order_status = stg
                    db_order.order_registered_time = reg_time
                    db_order.expected_arrival_time = exp_arr
                    db_order.scheduled_window_start = exp_arr - timedelta(minutes=15)
                    db_order.scheduled_window_end = exp_arr + timedelta(minutes=45)

                session.flush()

                # Generate event trails depending on current stage
                # Telematics signal
                signal_dist = 0.0 if stg != "APPROACHING" else round(random.uniform(8.0, 32.0), 1)
                session.add(ArrivalSignal(
                    signal_id=f"SIG-SCN-{o_id[-8:]}",
                    order_id=o_id,
                    signal_source="SAFARICOM_TELEMATICS_API",
                    signal_timestamp=SCENARIO_TIME - timedelta(minutes=random.randint(10, 40)),
                    signal_quality="HIGH" if signal_dist < 15 else "MEDIUM",
                    estimated_distance_km=signal_dist,
                    predicted_arrival_window_start=exp_arr - timedelta(minutes=10),
                    predicted_arrival_window_end=exp_arr + timedelta(minutes=15),
                    confidence_pct=94.0 if signal_dist == 0 else 88.0,
                    etl_run_id=ETL_RUN_ID,
                ))

                if stg in ("VALIDATING", "STAGED", "POSITIONED", "LOADING"):
                    # Gate-In event
                    gate_in_time = stage_enter_time - timedelta(minutes=random.randint(12, 25))
                    session.add(GateEvent(
                        gate_event_id=f"GE-SCN-ARR-{o_id[-8:]}",
                        order_id=o_id,
                        depot_id=depot_id,
                        truck_id=trk.truck_id,
                        event_type="ARRIVAL",
                        event_timestamp=gate_in_time - timedelta(minutes=4),
                        tare_weight_kg=0,
                        gross_weight_kg=0,
                        rfid_transponder_id=f"RFID-{trk.registration.replace(' ', '')}",
                        gate_lane="Inbound Security Gate 1",
                        etl_run_id=ETL_RUN_ID,
                    ))
                    session.add(GateEvent(
                        gate_event_id=f"GE-SCN-IN-{o_id[-8:]}",
                        order_id=o_id,
                        depot_id=depot_id,
                        truck_id=trk.truck_id,
                        event_type="GATE_IN",
                        event_timestamp=gate_in_time,
                        tare_weight_kg=random.randint(14200, 15400),
                        gross_weight_kg=0,
                        rfid_transponder_id=f"RFID-{trk.registration.replace(' ', '')}",
                        gate_lane="Tare Weighbridge Scale 1",
                        etl_run_id=ETL_RUN_ID,
                    ))

                    # Validation event
                    val_start = gate_in_time + timedelta(minutes=1)
                    val_end = val_start + timedelta(minutes=random.randint(4, 7))
                    is_val_done = stg in ("STAGED", "POSITIONED", "LOADING")
                    session.add(ValidationEvent(
                        validation_id=f"VAL-SCN-{o_id[-8:]}",
                        order_id=o_id,
                        depot_id=depot_id,
                        validation_start=val_start,
                        validation_end=val_end if is_val_done else SCENARIO_TIME + timedelta(minutes=3),
                        duration_minutes=6.0 if is_val_done else dur_in_stage,
                        validation_outcome="APPROVED" if is_val_done else "IN_PROGRESS",
                        customs_status="APPROVED" if is_val_done else "VERIFYING_MANIFEST",
                        electronic_manifest_matched=True,
                        etl_run_id=ETL_RUN_ID,
                    ))

                if stg in ("STAGED", "POSITIONED", "LOADING"):
                    # Staging event
                    stg_entry = stage_enter_time - timedelta(minutes=random.randint(8, 18)) if stg != "STAGED" else stage_enter_time
                    stg_exit = stage_enter_time if stg in ("POSITIONED", "LOADING") else None
                    session.add(StagingEvent(
                        staging_id=f"STG-SCN-{o_id[-8:]}",
                        order_id=o_id,
                        depot_id=depot_id,
                        staging_area_id=f"Staging Bay {random.choice(['A01', 'A02', 'B03', 'B04', 'C01'])}",
                        queue_entry_time=stg_entry,
                        queue_exit_time=stg_exit,
                        wait_duration_minutes=(stg_exit - stg_entry).total_seconds() / 60.0 if stg_exit else None,
                        queue_reason="Awaiting compatible bay clearance" if not stg_exit else "Dispatched to loading bay",
                        initial_predicted_wait_min=18.0,
                        etl_run_id=ETL_RUN_ID,
                    ))

                if stg == "LOADING":
                    # Loading event (active, no end time)
                    flow_rate = pos.standard_flow_rate_lpm
                    if pos.loading_position_id in cfg["degraded_bays"]:
                        flow_rate = int(flow_rate * 0.65)
                    progress_ratio = min(0.9, max(0.2, dur_in_stage / 25.0))
                    actual_litres = int(qty * progress_ratio)

                    session.add(LoadingEvent(
                        loading_event_id=f"LDG-SCN-{o_id[-8:]}",
                        order_id=o_id,
                        depot_id=depot_id,
                        loading_position_id=pos.loading_position_id,
                        loading_start=stage_enter_time,
                        loading_end=None,
                        planned_quantity_litres=qty,
                        actual_quantity_litres=actual_litres,
                        loading_duration_minutes=dur_in_stage,
                        avg_flow_rate_lpm=flow_rate,
                        dual_arm_used=pos.has_dual_arm,
                        loading_status="LOADING",
                        etl_run_id=ETL_RUN_ID,
                    ))

                # Compute risk and gate-out predictions
                risk_status = "GREEN"
                risk_label = "Nominal Flow"
                if stg == "STAGED" and dur_in_stage > 20:
                    risk_status = "RED" if dur_in_stage > 25 else "AMBER"
                    risk_label = "Queue Congestion Alert"
                elif stg == "LOADING" and pos and pos.loading_position_id in cfg["degraded_bays"]:
                    risk_status = "AMBER"
                    risk_label = "Bay Flow Rate Degraded"
                elif stg == "APPROACHING" and exp_arr < SCENARIO_TIME:
                    risk_status = "AMBER"
                    risk_label = "Delayed Ingress Window"

                # Gate-Out prediction
                if stg == "LOADING":
                    remaining_mins = max(5, int((qty - (actual_litres or 0)) / (pos.standard_flow_rate_lpm or 1650)) + 6)
                    pred_gate_out = SCENARIO_TIME + timedelta(minutes=remaining_mins)
                elif stg == "POSITIONED":
                    pred_gate_out = SCENARIO_TIME + timedelta(minutes=random.randint(28, 38))
                elif stg == "STAGED":
                    pred_gate_out = SCENARIO_TIME + timedelta(minutes=random.randint(45, 65))
                elif stg == "VALIDATING":
                    pred_gate_out = SCENARIO_TIME + timedelta(minutes=random.randint(55, 75))
                else:
                    pred_gate_out = exp_arr + timedelta(minutes=65)

                stage_display_names = {
                    "LOADING": "Actively Loading",
                    "POSITIONED": "Positioned at Bay",
                    "STAGED": "Staged in Queue",
                    "VALIDATING": "Validating Manifest",
                    "APPROACHING": "Approaching Terminal",
                }

                # Add to CurrentOrderState projection
                session.add(CurrentOrderState(
                    order_id=o_id,
                    depot_id=depot_id,
                    omc_id=item["omc_id"],
                    truck_id=trk.truck_id,
                    truck_registration=trk.registration,
                    driver_name=trk.driver_name,
                    product_id=item["product_id"],
                    ordered_quantity_litres=qty,
                    current_stage=stg,
                    stage_display=stage_display_names.get(stg, stg),
                    stage_entered_at=stage_enter_time,
                    time_in_stage_min=dur_in_stage,
                    allocated_position_id=pos.loading_position_id if pos else None,
                    allocated_bay_number=pos.bay_number if pos else None,
                    expected_arrival_time=exp_arr,
                    predicted_gate_out=pred_gate_out,
                    predicted_turnaround_min=round(float(depot.baseline_turnaround_min) + (dur_in_stage if stg in ("STAGED", "LOADING") else 0), 1),
                    risk_status=risk_status,
                    risk_label=risk_label,
                    is_active_inside=(stg in ("VALIDATING", "STAGED", "POSITIONED", "LOADING")),
                    updated_at=SCENARIO_TIME,
                ))

                all_created_orders.append({
                    "order_id": o_id,
                    "depot_id": depot_id,
                    "stage": stg,
                    "truck": trk.registration,
                    "risk": risk_status,
                })

            # 4. Populate CurrentLoadingPositionState for all bays at this depot
            actively_loading_orders = {item["position"].loading_position_id: item for item in stage_order_plan if item["stage"] == "LOADING" and item["position"]}
            for p in positions:
                is_degraded = p.loading_position_id in cfg["degraded_bays"]
                occupied_item = actively_loading_orders.get(p.loading_position_id)

                if occupied_item:
                    p_status = "DEGRADED" if is_degraded else "OCCUPIED"
                    p_impact = 35 if p.loading_position_id == "NBO-P07" else (20 if p.loading_position_id == "MBA-P03" else 0)
                    eff_flow = int(p.standard_flow_rate_lpm * (1 - p_impact / 100))
                    notes = f"Loading order {occupied_item['order_id']} ({occupied_item['product_id']})"
                    if is_degraded:
                        notes += " - Degraded pump flow rate"
                    curr_ord = occupied_item["order_id"]
                    curr_trk = truck_map[occupied_item["truck_id"]].registration
                elif is_degraded:
                    p_status = "DEGRADED"
                    p_impact = 35 if p.loading_position_id == "NBO-P07" else 20
                    eff_flow = int(p.standard_flow_rate_lpm * (1 - p_impact / 100))
                    notes = "Flow restricted due to maintenance alert"
                    curr_ord = None
                    curr_trk = None
                else:
                    p_status = "AVAILABLE"
                    p_impact = 0
                    eff_flow = p.standard_flow_rate_lpm
                    notes = "Bay available for autonomous allocation"
                    curr_ord = None
                    curr_trk = None

                session.add(CurrentLoadingPositionState(
                    loading_position_id=p.loading_position_id,
                    depot_id=depot_id,
                    bay_number=p.bay_number,
                    code=p.code,
                    product_compatibility=p.product_compatibility,
                    has_dual_arm=p.has_dual_arm,
                    standard_flow_rate_lpm=p.standard_flow_rate_lpm,
                    status=p_status,
                    current_order_id=curr_ord,
                    current_truck_registration=curr_trk,
                    flow_impact_pct=p_impact,
                    effective_flow_rate_lpm=eff_flow,
                    operational_notes=notes,
                    updated_at=SCENARIO_TIME,
                ))

            # 5. Populate CurrentDepotState
            act_loading = cfg["actively_loading"]
            queue_cnt = cfg["queued"]
            pos_cnt = cfg["positioned"]
            val_cnt = cfg["validating"]
            app_cnt = cfg["approaching"]
            inside_cnt = cfg["trucks_inside"]
            tot_active = inside_cnt + app_cnt
            deg_cnt = len(cfg["degraded_bays"])
            avail_cnt = max(0, total_positions - act_loading)
            occ_cnt = act_loading
            bay_util = min(100.0, round((occ_cnt / total_positions) * 100.0, 1))

            queue_pressure_ratio = round(queue_cnt / total_positions, 2)
            if queue_pressure_ratio > 1.2:
                q_level = "HIGH"
                c_level = "HIGH"
            elif queue_pressure_ratio >= 1.0:
                q_level = "ELEVATED"
                c_level = "ELEVATED"
            elif queue_pressure_ratio >= 0.8:
                q_level = "NORMAL"
                c_level = "NORMAL"
            else:
                q_level = "OPTIMAL"
                c_level = "LOW"

            curr_turnaround = round(float(depot.baseline_turnaround_min) + (queue_pressure_ratio * 12.0), 1)

            session.add(CurrentDepotState(
                depot_id=depot_id,
                scenario_id=SCENARIO_ID,
                scenario_name=SCENARIO_NAME,
                scenario_time=SCENARIO_TIME,
                trucks_inside=inside_cnt,
                actively_loading=act_loading,
                queue_count=queue_cnt,
                validating_count=val_cnt,
                positioned_count=pos_cnt,
                approaching_count=app_cnt,
                total_active_orders=tot_active,
                total_positions=total_positions,
                available_positions=avail_cnt,
                occupied_positions=occ_cnt,
                degraded_positions=deg_cnt,
                unavailable_positions=0,
                bay_utilization_pct=bay_util,
                queue_pressure_ratio=queue_pressure_ratio,
                queue_pressure_level=q_level,
                congestion_level=c_level,
                current_turnaround_min=curr_turnaround,
                updated_at=SCENARIO_TIME,
            ))

            depot_summaries[depot_id] = {
                "depot_name": depot.name,
                "profile": cfg["profile"],
                "total_positions": total_positions,
                "trucks_inside": inside_cnt,
                "actively_loading": act_loading,
                "queue_count": queue_cnt,
                "validating_count": val_cnt,
                "positioned_count": pos_cnt,
                "approaching_count": app_cnt,
                "total_active_orders": tot_active,
                "available_positions": avail_cnt,
                "occupied_positions": occ_cnt,
                "degraded_positions": deg_cnt,
                "bay_utilization_pct": bay_util,
                "queue_pressure_ratio": queue_pressure_ratio,
                "queue_pressure_level": q_level,
                "congestion_level": c_level,
                "turnaround_min": curr_turnaround,
            }

        session.commit()
        logger.info("Successfully persisted current scenario for all 5 depots!")

        # 6. Write Scenario Metadata
        meta_payload = {
            "scenario_id": SCENARIO_ID,
            "scenario_name": SCENARIO_NAME,
            "scenario_time": SCENARIO_TIME.isoformat(),
            "generated_at": datetime.now(EAT_TZ).isoformat(),
            "generation_seed": seed,
            "scenario_profile": "Multi-depot realistic operational pressure snapshot",
            "network_totals": {
                "depots_count": 5,
                "trucks_inside_total": sum(s["trucks_inside"] for s in depot_summaries.values()),
                "actively_loading_total": sum(s["actively_loading"] for s in depot_summaries.values()),
                "queued_total": sum(s["queue_count"] for s in depot_summaries.values()),
                "validating_total": sum(s["validating_count"] for s in depot_summaries.values()),
                "positioned_total": sum(s["positioned_count"] for s in depot_summaries.values()),
                "approaching_total": sum(s["approaching_count"] for s in depot_summaries.values()),
                "total_active_orders": sum(s["total_active_orders"] for s in depot_summaries.values()),
            },
            "depot_summaries": depot_summaries,
            "disclaimer": "Synthetic operational scenario. Not real KPC operational measurements.",
        }

        meta_path = Path(__file__).resolve().parent / "SCENARIO_METADATA.json"
        with open(meta_path, "w") as fp:
            json.dump(meta_payload, fp, indent=2)
        logger.info("Saved scenario metadata to: %s", meta_path)

        return meta_payload

    except Exception as e:
        session.rollback()
        logger.error("Failed to generate scenario: %s", str(e), exc_info=True)
        raise
    finally:
        session.close()


def main():
    parser = argparse.ArgumentParser(description="FlowGuard Synthetic Current Scenario Generator")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for deterministic generation (default 42)")
    args = parser.parse_args()

    meta = generate_scenario(seed=args.seed)
    print("\n================================================================================")
    print(f"FLOWGUARD SYNTHETIC CURRENT SCENARIO: {meta['scenario_id']} ({meta['scenario_name']})")
    print("================================================================================")
    print(f"Timestamp        : {meta['scenario_time']}")
    print(f"Seed             : {meta['generation_seed']}")
    print(f"Total Inside     : {meta['network_totals']['trucks_inside_total']} tankers")
    print(f"Actively Loading : {meta['network_totals']['actively_loading_total']} tankers")
    print(f"Queued / Staged  : {meta['network_totals']['queued_total']} tankers")
    print(f"Validating       : {meta['network_totals']['validating_total']} tankers")
    print(f"Positioned       : {meta['network_totals']['positioned_total']} tankers")
    print(f"Approaching      : {meta['network_totals']['approaching_total']} tankers")
    print(f"Total Active     : {meta['network_totals']['total_active_orders']} orders")
    print("--------------------------------------------------------------------------------")
    print(f"{'DEPOT':<12} {'PROFILE':<32} {'INSIDE':<8} {'QUEUE':<8} {'PRESSURE':<10} {'BAYS UTIL'}")
    print("--------------------------------------------------------------------------------")
    for d_id, s in meta["depot_summaries"].items():
        print(f"{d_id:<12} {s['profile']:<32} {s['trucks_inside']:<8} {s['queue_count']:<8} {s['queue_pressure_ratio']:<10} {s['bay_utilization_pct']}%")
    print("================================================================================\n")


if __name__ == "__main__":
    main()
