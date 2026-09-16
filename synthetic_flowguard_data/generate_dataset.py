#!/usr/bin/env python3
"""
KPC FlowGuard — Synthetic Source Dataset Generator for ETL Pipeline
===================================================================

Generates a fully relational, deterministic, multi-table operational dataset
conforming strictly to FLOWGUARD_PROJECT_CONTEXT.md and the existing FlowGuard
domain model (Dashboards 1–5 and Driver Mobile Companion).

Historical Range: 2026-06-11 to 2026-09-08 (90 days)
Operational Window: 2026-09-09 to 2026-09-15 (7 days, includes live demo scenario)
Total Period: 97 days
Random Seed: 20260915 (Deterministic)

Output: 20 related CSV files in synthetic_flowguard_data/
"""

import os
import sys
import csv
import json
import math
import random
import hashlib
from datetime import datetime, timedelta

# Set fixed deterministic seed
RANDOM_SEED = 20260915
random.seed(RANDOM_SEED)

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

START_DATE = datetime(2026, 6, 11, 6, 0, 0)
HISTORICAL_END = datetime(2026, 9, 8, 23, 59, 59)
OPERATIONAL_END = datetime(2026, 9, 15, 18, 0, 0)

# ==============================================================================
# 1. DOMAIN CONSTANTS & MASTER ENTITIES
# ==============================================================================

DEPOTS = [
    {
        "depot_id": "nairobi",
        "name": "Nairobi Terminal (PS10)",
        "code": "PS10",
        "region": "Nairobi / Central",
        "total_positions": 8,
        "baseline_turnaround_min": 65,
        "operating_hours_open": "06:00",
        "operating_hours_close": "20:00",
        "weight_share": 0.38,
    },
    {
        "depot_id": "mombasa",
        "name": "Mombasa Terminal (KOT-PS1)",
        "code": "KOT-PS1",
        "region": "Coast",
        "total_positions": 10,
        "baseline_turnaround_min": 72,
        "operating_hours_open": "05:30",
        "operating_hours_close": "21:00",
        "weight_share": 0.28,
    },
    {
        "depot_id": "nakuru",
        "name": "Nakuru Depot (PS25)",
        "code": "PS25",
        "region": "Rift Valley",
        "total_positions": 4,
        "baseline_turnaround_min": 58,
        "operating_hours_open": "06:30",
        "operating_hours_close": "19:00",
        "weight_share": 0.14,
    },
    {
        "depot_id": "eldoret",
        "name": "Eldoret Depot (PS27)",
        "code": "PS27",
        "region": "North Rift",
        "total_positions": 6,
        "baseline_turnaround_min": 50,
        "operating_hours_open": "06:00",
        "operating_hours_close": "19:30",
        "weight_share": 0.12,
    },
    {
        "depot_id": "kisumu",
        "name": "Kisumu Depot (PS28)",
        "code": "PS28",
        "region": "Western",
        "total_positions": 4,
        "baseline_turnaround_min": 45,
        "operating_hours_open": "06:30",
        "operating_hours_close": "18:30",
        "weight_share": 0.08,
    },
]

OMCS = [
    {
        "omc_id": "vivo",
        "name": "Vivo Energy Kenya Ltd",
        "short_name": "Vivo Energy",
        "account_code": "OMC-VIVO-KE-004",
        "primary_depot_id": "nairobi",
        "contact_email": "dispatch.logistics@vivoenergy.com",
        "volume_tier": "TIER_1_MAJOR",
        "volume_share": 0.26,
    },
    {
        "omc_id": "totalenergies",
        "name": "TotalEnergies Marketing Kenya Plc",
        "short_name": "TotalEnergies",
        "account_code": "OMC-TOTAL-KE-001",
        "primary_depot_id": "mombasa",
        "contact_email": "supply.chain@totalenergies.ke",
        "volume_tier": "TIER_1_MAJOR",
        "volume_share": 0.22,
    },
    {
        "omc_id": "rubis",
        "name": "Rubis Energy Kenya Plc",
        "short_name": "Rubis Energy",
        "account_code": "OMC-RUBIS-KE-007",
        "primary_depot_id": "nakuru",
        "contact_email": "operations.dispatch@rubiskenya.com",
        "volume_tier": "TIER_1_MAJOR",
        "volume_share": 0.18,
    },
    {
        "omc_id": "ola",
        "name": "Ola Energy Kenya Ltd",
        "short_name": "Ola Energy",
        "account_code": "OMC-OLA-KE-003",
        "primary_depot_id": "nairobi",
        "contact_email": "supply.dispatch@olaenergy.com",
        "volume_tier": "TIER_2_MEDIUM",
        "volume_share": 0.12,
    },
    {
        "omc_id": "lakeoil",
        "name": "Lake Oil Kenya Ltd",
        "short_name": "Lake Oil",
        "account_code": "OMC-LAKE-KE-012",
        "primary_depot_id": "eldoret",
        "contact_email": "fleet.logistics@lakeoilgroup.com",
        "volume_tier": "TIER_2_MEDIUM",
        "volume_share": 0.09,
    },
    {
        "omc_id": "hass",
        "name": "Hass Petroleum Kenya Ltd",
        "short_name": "Hass Petroleum",
        "account_code": "OMC-HASS-KE-015",
        "primary_depot_id": "kisumu",
        "contact_email": "operations@hasspetroleum.com",
        "volume_tier": "TIER_2_MEDIUM",
        "volume_share": 0.08,
    },
    {
        "omc_id": "petrocity",
        "name": "Petrocity Enterprises Ltd",
        "short_name": "Petrocity",
        "account_code": "OMC-PETRO-KE-031",
        "primary_depot_id": "nairobi",
        "contact_email": "logistics@petrocity.co.ke",
        "volume_tier": "TIER_3_INDEPENDENT",
        "volume_share": 0.05,
    },
]

PRODUCTS = [
    {
        "product_id": "PMS",
        "code": "PMS",
        "name": "Premium Motor Spirit (Super Unleaded)",
        "density_kg_per_l": 0.745,
        "standard_flow_rate_lpm": 1650,
        "is_hazardous_priority": True,
        "compatible_bays_desc": "Segregated PMS meters with vapor recovery line",
        "demand_share": 0.46,
    },
    {
        "product_id": "AGO",
        "code": "AGO",
        "name": "Automotive Gasoil (Diesel)",
        "density_kg_per_l": 0.840,
        "standard_flow_rate_lpm": 1650,
        "is_hazardous_priority": False,
        "compatible_bays_desc": "Standard & high-velocity diesel loading arms",
        "demand_share": 0.42,
    },
    {
        "product_id": "DPK",
        "code": "DPK",
        "name": "Dual Purpose Kerosene",
        "density_kg_per_l": 0.795,
        "standard_flow_rate_lpm": 1600,
        "is_hazardous_priority": False,
        "compatible_bays_desc": "Dedicated domestic illuminant/power arms",
        "demand_share": 0.08,
    },
    {
        "product_id": "JET-A1",
        "code": "JET-A1",
        "name": "Aviation Turbine Fuel (Jet A-1)",
        "density_kg_per_l": 0.804,
        "standard_flow_rate_lpm": 1500,
        "is_hazardous_priority": True,
        "compatible_bays_desc": "High-purity dedicated aviation arm with micro-filter water separators",
        "demand_share": 0.04,
    },
]

TRANSPORTERS = [
    "Trans-Rift Hauliers Ltd",
    "Siginon Global Logistics",
    "Multiple Hauliers EA",
    "Bollore Logistics Kenya",
    "Freight Forwarders Kenya Ltd",
    "Southern Cross Hauliers",
    "Simba Transporters Ltd",
    "Babena Hauliers Kenya",
    "Afrilink Petroleum Transporters",
    "Apex Fuel Movers Ltd",
    "Rift Valley Fleet Services",
    "Lakeside Bulk Carriers",
    "Coastline Petroleum Transport",
    "Continental Cargo Tankers Ltd",
]

FIRST_NAMES = [
    "James", "John", "Peter", "David", "Joseph", "Daniel", "Michael", "Samuel",
    "Stephen", "Paul", "Francis", "George", "Anthony", "Patrick", "Charles",
    "Boniface", "Evans", "Kennedy", "Geoffrey", "Dennis", "Brian", "Victor",
]

LAST_NAMES = [
    "Mwangi", "Kariuki", "Kamau", "Ochieng", "Odhiambo", "Otieno", "Kiprono",
    "Kipkorir", "Rotich", "Wanyama", "Wafula", "Mutua", "Musyoka", "Njoroge",
    "Waweru", "Ondieki", "Makori", "Barasa", "Maina", "Kibet", "Kimani",
]

# Generate 750 realistic trucks
def generate_trucks(count=750):
    trucks = []
    reg_letters = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
    
    # Pre-seed the primary demo truck KDD 412X
    demo_truck = {
        "truck_id": "TRK-0001",
        "registration": "KDD 412X",
        "trailer_registration": "ZF 9102",
        "transporter_name": "Trans-Rift Hauliers Ltd",
        "driver_name": "James Mwangi",
        "driver_national_id": "24891002",
        "capacity_litres": 36000,
        "compartments_count": 3,
        "tare_weight_kg": 14820,
        "vehicle_type": "Semi-Trailer Tanker",
        "active_status": "ACTIVE",
    }
    trucks.append(demo_truck)
    
    capacities = [
        (28000, 2, 12800, "3-Axle Rigid Tanker"),
        (32000, 3, 13900, "Semi-Trailer Tanker"),
        (34000, 3, 14400, "Semi-Trailer Tanker"),
        (36000, 3, 14800, "Semi-Trailer Tanker"),
        (38000, 4, 15600, "Semi-Trailer Tanker"),
        (40000, 4, 16200, "Multi-Compartment B-Double"),
    ]

    for i in range(2, count + 1):
        cap, comps, tare_base, vtype = random.choice(capacities)
        tare = tare_base + random.randint(-400, 400)
        p1 = random.choice(["B", "C", "D"])
        p2 = random.choice(reg_letters)
        num = random.randint(101, 999)
        p3 = random.choice(reg_letters)
        reg = f"K{p1}{p2} {num}{p3}"
        trailer = f"Z{random.choice(reg_letters)} {random.randint(1001, 9999)}"
        d_name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        d_nat_id = str(random.randint(19000000, 34000000))
        
        trucks.append({
            "truck_id": f"TRK-{i:04d}",
            "registration": reg,
            "trailer_registration": trailer,
            "transporter_name": random.choice(TRANSPORTERS),
            "driver_name": d_name,
            "driver_national_id": d_nat_id,
            "capacity_litres": cap,
            "compartments_count": comps,
            "tare_weight_kg": tare,
            "vehicle_type": vtype,
            "active_status": "ACTIVE" if random.random() > 0.04 else "INACTIVE",
        })
    return trucks

# Generate Loading Positions across 5 depots
def generate_loading_positions():
    positions = []
    # Nairobi: 8 positions
    nbo_bays = [
        ("NBO-P01", "P01", 1, "PMS / Dual-Arm", True, 1650, True),
        ("NBO-P02", "P02", 2, "PMS / Dual-Arm", True, 1650, True),
        ("NBO-P03", "P03", 3, "AGO / High-Flow", True, 1650, True),
        ("NBO-P04", "P04", 4, "AGO / Dual-Arm High-Velocity", True, 1650, True),
        ("NBO-P05", "P05", 5, "DPK / Dual-Arm", True, 1600, False),
        ("NBO-P06", "P06", 6, "AGO / Dual-Arm", True, 1650, True),
        ("NBO-P07", "P07", 7, "AGO / Standard", False, 1650, False),
        ("NBO-P08", "P08", 8, "PMS / Standard", False, 1650, False),
    ]
    for pid, code, bay_num, comp, dual, flow, hv in nbo_bays:
        positions.append({
            "loading_position_id": pid,
            "depot_id": "nairobi",
            "code": code,
            "bay_number": bay_num,
            "product_compatibility": comp,
            "has_dual_arm": dual,
            "standard_flow_rate_lpm": flow,
            "is_high_velocity": hv,
        })
        
    # Mombasa: 10 positions
    for b in range(1, 11):
        comp = "PMS / Dual-Arm" if b in [1, 2, 3] else ("AGO / Dual-Arm High-Velocity" if b in [4, 5, 6, 7] else ("JET-A1 / Aviation Dedicated" if b in [8, 9] else "DPK / Standard"))
        positions.append({
            "loading_position_id": f"MBA-P{b:02d}",
            "depot_id": "mombasa",
            "code": f"P{b:02d}",
            "bay_number": b,
            "product_compatibility": comp,
            "has_dual_arm": b in [1, 2, 4, 5, 6],
            "standard_flow_rate_lpm": 1650 if b <= 7 else 1500,
            "is_high_velocity": b in [4, 5, 6],
        })
        
    # Nakuru: 4 positions
    nkr_bays = [
        ("NKR-P01", "P01", 1, "PMS / Dual-Arm", True, 1600, True),
        ("NKR-P02", "P02", 2, "PMS / Standard", False, 1600, False),
        ("NKR-P03", "P03", 3, "AGO / High-Flow", True, 1650, True),
        ("NKR-P04", "P04", 4, "AGO / Dual-Arm", True, 1650, False),
    ]
    for pid, code, bay_num, comp, dual, flow, hv in nkr_bays:
        positions.append({
            "loading_position_id": pid,
            "depot_id": "nakuru",
            "code": code,
            "bay_number": bay_num,
            "product_compatibility": comp,
            "has_dual_arm": dual,
            "standard_flow_rate_lpm": flow,
            "is_high_velocity": hv,
        })
        
    # Eldoret: 6 positions
    for b in range(1, 7):
        comp = "PMS / Dual-Arm" if b in [1, 2] else ("AGO / Dual-Arm" if b in [3, 4, 5] else "DPK / Standard")
        positions.append({
            "loading_position_id": f"ELD-P{b:02d}",
            "depot_id": "eldoret",
            "code": f"P{b:02d}",
            "bay_number": b,
            "product_compatibility": comp,
            "has_dual_arm": b in [1, 3, 4],
            "standard_flow_rate_lpm": 1650,
            "is_high_velocity": b in [3, 4],
        })

    # Kisumu: 4 positions
    ksm_bays = [
        ("KSM-P01", "P01", 1, "AGO / Dual-Arm", True, 1650, True),
        ("KSM-P02", "P02", 2, "PMS / Dual-Arm", True, 1650, True),
        ("KSM-P03", "P03", 3, "AGO / Standard", False, 1650, False),
        ("KSM-P04", "P04", 4, "PMS / Standard", False, 1650, False),
    ]
    for pid, code, bay_num, comp, dual, flow, hv in ksm_bays:
        positions.append({
            "loading_position_id": pid,
            "depot_id": "kisumu",
            "code": code,
            "bay_number": bay_num,
            "product_compatibility": comp,
            "has_dual_arm": dual,
            "standard_flow_rate_lpm": flow,
            "is_high_velocity": hv,
        })

    return positions

print("1/7 Initializing master entities & static dimensions...")
trucks_data = generate_trucks(750)
positions_data = generate_loading_positions()

# Index lookup helpers
depot_by_id = {d["depot_id"]: d for d in DEPOTS}
omc_by_id = {o["omc_id"]: o for o in OMCS}
prod_by_id = {p["product_id"]: p for p in PRODUCTS}
depot_positions_map = {}
for p in positions_data:
    depot_positions_map.setdefault(p["depot_id"], []).append(p)

active_trucks = [t for t in trucks_data if t["active_status"] == "ACTIVE"]

# ==============================================================================
# 2. GENERATE ORDERS & OPERATIONAL TIMELINES
# ==============================================================================

print("2/7 Generating loading orders, gate events, and process lifecycles...")

orders_data = []
gate_events_data = []
validation_events_data = []
staging_events_data = []
loading_events_data = []
arrival_signals_data = []

# Specific intentional invalid tracking
invalid_injections = []

# Depot cumulative counters
depot_order_counters = {d["depot_id"]: 1000 for d in DEPOTS}

current_dt = START_DATE
total_days = (OPERATIONAL_END - START_DATE).days + 1

# Pre-seed Nairobi Live Demo Scenario (2026-09-15 10:02:47)
demo_order_id = "LO-NBO-8821"
demo_order = {
    "order_id": demo_order_id,
    "omc_id": "vivo",
    "depot_id": "nairobi",
    "truck_id": "TRK-0001",
    "product_id": "AGO",
    "ordered_quantity_litres": 36000,
    "order_registered_time": "2026-09-15 07:15:00",
    "expected_arrival_time": "2026-09-15 10:15:00",
    "scheduled_window_start": "2026-09-15 10:00:00",
    "scheduled_window_end": "2026-09-15 10:45:00",
    "order_status": "COMPLETED",
    "cancellation_reason": "",
}
orders_data.append(demo_order)

# Demo order gate events
gate_events_data.append({
    "gate_event_id": "GE-NBO-DEMO-01",
    "order_id": demo_order_id,
    "depot_id": "nairobi",
    "truck_id": "TRK-0001",
    "event_type": "ARRIVAL",
    "event_timestamp": "2026-09-15 10:18:12",
    "tare_weight_kg": 0,
    "gross_weight_kg": 0,
    "rfid_transponder_id": "RFID-KDD412X-01",
    "gate_lane": "Outer Lane 2",
})
gate_events_data.append({
    "gate_event_id": "GE-NBO-DEMO-02",
    "order_id": demo_order_id,
    "depot_id": "nairobi",
    "truck_id": "TRK-0001",
    "event_type": "GATE_IN",
    "event_timestamp": "2026-09-15 10:24:05",
    "tare_weight_kg": 14820,
    "gross_weight_kg": 0,
    "rfid_transponder_id": "RFID-KDD412X-01",
    "gate_lane": "Tare Weighbridge Scale 1",
})
gate_events_data.append({
    "gate_event_id": "GE-NBO-DEMO-03",
    "order_id": demo_order_id,
    "depot_id": "nairobi",
    "truck_id": "TRK-0001",
    "event_type": "GATE_OUT",
    "event_timestamp": "2026-09-15 11:02:00",
    "tare_weight_kg": 14820,
    "gross_weight_kg": 45060,
    "rfid_transponder_id": "RFID-KDD412X-01",
    "gate_lane": "Gross Weighbridge Exit 1",
})

validation_events_data.append({
    "validation_id": "VAL-NBO-DEMO-01",
    "order_id": demo_order_id,
    "depot_id": "nairobi",
    "validation_start": "2026-09-15 10:24:30",
    "validation_end": "2026-09-15 10:31:00",
    "duration_minutes": 6.5,
    "validation_outcome": "APPROVED",
    "customs_status": "KRA_RECTS_AUTHENTICATED",
    "electronic_manifest_matched": True,
    "exception_reason": "",
})

staging_events_data.append({
    "staging_id": "STG-NBO-DEMO-01",
    "order_id": demo_order_id,
    "depot_id": "nairobi",
    "staging_area_id": "Staging Bay B04",
    "queue_entry_time": "2026-09-15 10:31:00",
    "queue_exit_time": "2026-09-15 10:33:45",
    "wait_duration_minutes": 2.75,
    "queue_reason": "AUTONOMOUS_DECONFLICTION_ROUTING",
    "initial_predicted_wait_min": 25.0,
})

loading_events_data.append({
    "loading_event_id": "LDG-NBO-DEMO-01",
    "order_id": demo_order_id,
    "depot_id": "nairobi",
    "loading_position_id": "NBO-P04",
    "loading_start": "2026-09-15 10:33:45",
    "loading_end": "2026-09-15 10:52:15",
    "planned_quantity_litres": 36000,
    "actual_quantity_litres": 36000,
    "loading_duration_minutes": 18.5,
    "avg_flow_rate_lpm": 1945,
    "dual_arm_used": True,
    "loading_status": "COMPLETED",
    "exception_reason": "",
})

arrival_signals_data.append({
    "signal_id": "SIG-NBO-DEMO-01",
    "order_id": demo_order_id,
    "signal_source": "OPTIONAL_TELEMATICS",
    "signal_timestamp": "2026-09-15 09:45:00",
    "signal_quality": "HIGH",
    "estimated_distance_km": 14.5,
    "predicted_arrival_window_start": "2026-09-15 10:10:00",
    "predicted_arrival_window_end": "2026-09-15 10:25:00",
    "confidence_pct": 88,
})

# Generate daily orders for all 97 days
# Target: ~11,800 orders total (~120 per day)
order_sequence = 1
gate_event_sequence = 1
val_sequence = 1
stg_sequence = 1
ldg_sequence = 1
sig_sequence = 1

day_dt = START_DATE.date()
end_day_dt = OPERATIONAL_END.date()

while day_dt <= end_day_dt:
    is_weekend = day_dt.weekday() >= 5
    # Base daily volume: 135 on weekdays, 55 on weekends
    base_daily_volume = 138 if not is_weekend else 58
    daily_orders_count = int(random.gauss(base_daily_volume, 12))
    
    # Hour demand distribution weights (06:00 to 19:00)
    # Morning peak: 07:00–10:00, Afternoon peak: 13:00–16:00
    hour_weights = {
        6: 0.04, 7: 0.10, 8: 0.14, 9: 0.15, 10: 0.12, 11: 0.09,
        12: 0.06, 13: 0.08, 14: 0.09, 15: 0.07, 16: 0.04, 17: 0.02,
    }
    hours_pool = []
    for h, w in hour_weights.items():
        hours_pool.extend([h] * int(w * 100))

    for _ in range(daily_orders_count):
        # Choose depot by volume share
        depot = random.choices(DEPOTS, weights=[d["weight_share"] for d in DEPOTS])[0]
        depot_id = depot["depot_id"]
        depot_order_counters[depot_id] += 1
        d_code = depot["code"].replace("-", "")
        order_id = f"LO-{d_code}-{depot_order_counters[depot_id]:05d}"
        
        # Choose OMC by volume share
        omc = random.choices(OMCS, weights=[o["volume_share"] for o in OMCS])[0]
        omc_id = omc["omc_id"]
        
        # Choose product
        prod = random.choices(PRODUCTS, weights=[p["demand_share"] for p in PRODUCTS])[0]
        prod_id = prod["product_id"]
        
        # Select truck
        truck = random.choice(active_trucks)
        truck_id = truck["truck_id"]
        qty = truck["capacity_litres"]
        
        # Timing
        hour = random.choice(hours_pool)
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        reg_dt = datetime.combine(day_dt, datetime.min.time()) + timedelta(hours=hour, minutes=minute, seconds=second)
        
        # Expected arrival 45–180m after registration
        lead_minutes = random.randint(45, 150)
        expected_arrival_dt = reg_dt + timedelta(minutes=lead_minutes)
        window_start = expected_arrival_dt - timedelta(minutes=15)
        window_end = expected_arrival_dt + timedelta(minutes=45)
        
        # Order outcomes: 94% complete, 3% cancelled, 2% rejected validation, 1% active/in-progress
        outcome_roll = random.random()
        is_cancelled = outcome_roll < 0.03
        is_rejected_val = 0.03 <= outcome_roll < 0.05
        is_in_progress = (0.05 <= outcome_roll < 0.07) and (day_dt >= datetime(2026, 9, 14).date())
        
        order_status = "CANCELLED" if is_cancelled else ("REJECTED" if is_rejected_val else ("IN_PROGRESS" if is_in_progress else "COMPLETED"))
        cancel_reason = random.choice(["OMC_ALLOCATION_EXCEEDED", "CREDIT_APPROVAL_HOLD", "TRANSPORTER_TRUCK_SUBSTITUTION", "WEATHER_ROUTE_CLOSURE"]) if is_cancelled else ""
        
        order_record = {
            "order_id": order_id,
            "omc_id": omc_id,
            "depot_id": depot_id,
            "truck_id": truck_id,
            "product_id": prod_id,
            "ordered_quantity_litres": qty,
            "order_registered_time": reg_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "expected_arrival_time": expected_arrival_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "scheduled_window_start": window_start.strftime("%Y-%m-%d %H:%M:%S"),
            "scheduled_window_end": window_end.strftime("%Y-%m-%d %H:%M:%S"),
            "order_status": order_status,
            "cancellation_reason": cancel_reason,
        }
        orders_data.append(order_record)
        
        # Generate arrival signals (no future leakage: timestamped before arrival)
        sig_source = random.choices(["HISTORICAL_BASELINE", "OPTIONAL_TRAFFIC_SIGNAL", "OPTIONAL_TELEMATICS", "NONE"], weights=[0.42, 0.30, 0.20, 0.08])[0]
        if sig_source != "NONE":
            sig_time = reg_dt + timedelta(minutes=random.randint(10, 30))
            sig_dist = round(random.uniform(5.0, 65.0), 1)
            sig_qual = "HIGH" if sig_source == "OPTIONAL_TELEMATICS" else ("MEDIUM" if sig_source == "OPTIONAL_TRAFFIC_SIGNAL" else "BASELINE")
            conf = random.randint(82, 94) if sig_source == "OPTIONAL_TELEMATICS" else (random.randint(72, 85) if sig_source == "OPTIONAL_TRAFFIC_SIGNAL" else random.randint(60, 75))
            arrival_signals_data.append({
                "signal_id": f"SIG-{sig_sequence:06d}",
                "order_id": order_id,
                "signal_source": sig_source,
                "signal_timestamp": sig_time.strftime("%Y-%m-%d %H:%M:%S"),
                "signal_quality": sig_qual,
                "estimated_distance_km": sig_dist,
                "predicted_arrival_window_start": (expected_arrival_dt - timedelta(minutes=12)).strftime("%Y-%m-%d %H:%M:%S"),
                "predicted_arrival_window_end": (expected_arrival_dt + timedelta(minutes=15)).strftime("%Y-%m-%d %H:%M:%S"),
                "confidence_pct": conf,
            })
            sig_sequence += 1

        if is_cancelled:
            continue
            
        # Arrival variance: normal distribution +5m, std 14m
        arrival_delta_min = random.gauss(5, 14)
        actual_arrival_dt = expected_arrival_dt + timedelta(minutes=arrival_delta_min)
        
        # 1. Gate Event: Arrival
        gate_events_data.append({
            "gate_event_id": f"GE-{gate_event_sequence:07d}",
            "order_id": order_id,
            "depot_id": depot_id,
            "truck_id": truck_id,
            "event_type": "ARRIVAL",
            "event_timestamp": actual_arrival_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "tare_weight_kg": 0,
            "gross_weight_kg": 0,
            "rfid_transponder_id": f"RFID-{truck['registration'].replace(' ', '')}",
            "gate_lane": f"Outer Lane {random.randint(1, 3)}",
        })
        gate_event_sequence += 1
        
        # 2. Gate Event: Gate-In (after security transponder check & tare scale)
        gate_in_duration = random.randint(4, 18)
        gate_in_dt = actual_arrival_dt + timedelta(minutes=gate_in_duration)
        tare_wt = truck["tare_weight_kg"]
        
        gate_events_data.append({
            "gate_event_id": f"GE-{gate_event_sequence:07d}",
            "order_id": order_id,
            "depot_id": depot_id,
            "truck_id": truck_id,
            "event_type": "GATE_IN",
            "event_timestamp": gate_in_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "tare_weight_kg": tare_wt,
            "gross_weight_kg": 0,
            "rfid_transponder_id": f"RFID-{truck['registration'].replace(' ', '')}",
            "gate_lane": f"Tare Scale {random.randint(1, 2)}",
        })
        gate_event_sequence += 1
        
        # 3. Validation Processing Event
        val_start_dt = gate_in_dt + timedelta(minutes=random.randint(1, 4))
        val_duration = random.uniform(6.0, 22.0) if not is_rejected_val else random.uniform(25.0, 45.0)
        val_end_dt = val_start_dt + timedelta(minutes=val_duration)
        val_outcome = "REJECTED" if is_rejected_val else "APPROVED"
        val_exception = "CUSTOMS_TRANSIT_BOND_DISCREPANCY" if is_rejected_val else ""
        
        validation_events_data.append({
            "validation_id": f"VAL-{val_sequence:06d}",
            "order_id": order_id,
            "depot_id": depot_id,
            "validation_start": val_start_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "validation_end": val_end_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "duration_minutes": round(val_duration, 2),
            "validation_outcome": val_outcome,
            "customs_status": "CUSTOMS_RELEASED" if not is_rejected_val else "CUSTOMS_HOLD",
            "electronic_manifest_matched": not is_rejected_val,
            "exception_reason": val_exception,
        })
        val_sequence += 1
        
        if is_rejected_val:
            # Truck turned away at validation; gate-out recorded without loading
            turnaway_exit = val_end_dt + timedelta(minutes=random.randint(5, 12))
            gate_events_data.append({
                "gate_event_id": f"GE-{gate_event_sequence:07d}",
                "order_id": order_id,
                "depot_id": depot_id,
                "truck_id": truck_id,
                "event_type": "GATE_OUT",
                "event_timestamp": turnaway_exit.strftime("%Y-%m-%d %H:%M:%S"),
                "tare_weight_kg": tare_wt,
                "gross_weight_kg": tare_wt,
                "rfid_transponder_id": f"RFID-{truck['registration'].replace(' ', '')}",
                "gate_lane": "Rejection Exit Lane",
            })
            gate_event_sequence += 1
            continue

        if is_in_progress:
            continue
            
        # 4. Staging / Queue Event
        stg_entry_dt = val_end_dt
        # Queue duration depends on depot demand & hour
        is_peak = (8 <= hour <= 11) or (14 <= hour <= 16)
        base_queue_min = random.uniform(4.0, 18.0) if not is_peak else random.uniform(14.0, 48.0)
        stg_exit_dt = stg_entry_dt + timedelta(minutes=base_queue_min)
        q_reason = "ARRIVAL_CLUSTERING" if is_peak else ("LOADING_CAPACITY_PRESSURE" if random.random() > 0.6 else "NOMINAL_FLOW")
        
        staging_events_data.append({
            "staging_id": f"STG-{stg_sequence:06d}",
            "order_id": order_id,
            "depot_id": depot_id,
            "staging_area_id": f"Staging Bay {random.choice(['A', 'B', 'C'])}{random.randint(1, 5)}",
            "queue_entry_time": stg_entry_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "queue_exit_time": stg_exit_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "wait_duration_minutes": round(base_queue_min, 2),
            "queue_reason": q_reason,
            "initial_predicted_wait_min": round(base_queue_min * random.uniform(0.85, 1.15), 1),
        })
        stg_sequence += 1
        
        # 5. Loading Event
        ldg_start_dt = stg_exit_dt + timedelta(minutes=random.randint(1, 3))
        # Choose compatible position at depot
        compat_positions = [pos for pos in depot_positions_map[depot_id] if prod_id in pos["product_compatibility"]]
        if not compat_positions:
            compat_positions = depot_positions_map[depot_id]
        selected_pos = random.choice(compat_positions)
        pos_id = selected_pos["loading_position_id"]
        use_dual_arm = selected_pos["has_dual_arm"] and truck["compartments_count"] >= 3 and random.random() > 0.4
        
        # Flow rate in L/min
        base_flow = selected_pos["standard_flow_rate_lpm"]
        effective_flow = base_flow * (1.35 if use_dual_arm else random.uniform(0.92, 1.05))
        flow_duration_min = (qty / effective_flow) + random.uniform(6.0, 12.0) # includes bonding, hookup, drainage
        ldg_end_dt = ldg_start_dt + timedelta(minutes=flow_duration_min)
        
        loading_events_data.append({
            "loading_event_id": f"LDG-{ldg_sequence:06d}",
            "order_id": order_id,
            "depot_id": depot_id,
            "loading_position_id": pos_id,
            "loading_start": ldg_start_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "loading_end": ldg_end_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "planned_quantity_litres": qty,
            "actual_quantity_litres": qty,
            "loading_duration_minutes": round(flow_duration_min, 2),
            "avg_flow_rate_lpm": int(effective_flow),
            "dual_arm_used": use_dual_arm,
            "loading_status": "COMPLETED",
            "exception_reason": "",
        })
        ldg_sequence += 1
        
        # 6. Gate Event: Gate-Out (after gross scale weighbridge & security inspection)
        exit_transit_min = random.uniform(8.0, 18.0)
        gate_out_dt = ldg_end_dt + timedelta(minutes=exit_transit_min)
        prod_density = prod["density_kg_per_l"]
        gross_wt = int(tare_wt + (qty * prod_density))
        
        gate_events_data.append({
            "gate_event_id": f"GE-{gate_event_sequence:07d}",
            "order_id": order_id,
            "depot_id": depot_id,
            "truck_id": truck_id,
            "event_type": "GATE_OUT",
            "event_timestamp": gate_out_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "tare_weight_kg": tare_wt,
            "gross_weight_kg": gross_wt,
            "rfid_transponder_id": f"RFID-{truck['registration'].replace(' ', '')}",
            "gate_lane": f"Gross Weighbridge Platform {random.randint(1, 2)}",
        })
        gate_event_sequence += 1

    day_dt += timedelta(days=1)

print(f"Generated {len(orders_data)} loading orders, {len(gate_events_data)} gate events, {len(validation_events_data)} validation events, {len(loading_events_data)} loading events.")

# ==============================================================================
# 3. GENERATE EQUIPMENT TIMELINES & PRODUCT READINESS
# ==============================================================================

print("3/7 Generating equipment operational timelines & tank farm product readiness...")

equipment_events_data = []
product_readiness_data = []

eq_categories = [
    ("LOADING_SYSTEM", ["Hydraulic Gantry Loading Arms", "Loading Arm Swivel Joint", "Emergency Breakaway Coupler"]),
    ("METERING", ["Coriolis Mass-Flow Meter", "Digital Batch Controller", "Flow Meter Temperature RTD"]),
    ("GATE_SCALE", ["Tare Weighbridge Loadcell Platform", "Gross Weighbridge Transducer", "Smart RFID Barrier Gate"]),
    ("SCADA_CONTROL", ["Redundant DCS PLC Gateway", "Emergency Shut-Down Loop", "OPC-UA Interface Bridge"]),
    ("EQUIPMENT_AVAILABILITY", ["Vapor Recovery Compressor", "Additive Injection Pump Line", "Static Earth Monitoring Reel"]),
]

eq_id = 1
for d in DEPOTS:
    depot_id = d["depot_id"]
    # Generate ~250 equipment events over 97 days per depot
    cur_time = START_DATE
    while cur_time < OPERATIONAL_END:
        cur_time += timedelta(hours=random.randint(8, 28))
        cat, components = random.choice(eq_categories)
        comp = random.choice(components)
        status_roll = random.random()
        status = "HEALTHY" if status_roll > 0.15 else ("DEGRADED" if status_roll > 0.05 else "UNAVAILABLE")
        flow_impact = 0 if status == "HEALTHY" else (random.randint(10, 25) if status == "DEGRADED" else 100)
        pos = random.choice(depot_positions_map[depot_id]) if cat in ["LOADING_SYSTEM", "METERING"] else None
        pos_id = pos["loading_position_id"] if pos else ""
        resolved = cur_time + timedelta(hours=random.randint(2, 14)) if status != "HEALTHY" else cur_time
        
        note = "Nominal operating telemetry" if status == "HEALTHY" else (f"{comp} calibration offset detected" if status == "DEGRADED" else f"{comp} offline for maintenance")
        
        equipment_events_data.append({
            "equipment_event_id": f"EQ-{eq_id:06d}",
            "depot_id": depot_id,
            "loading_position_id": pos_id,
            "equipment_category": cat,
            "component_name": comp,
            "status": status,
            "event_timestamp": cur_time.strftime("%Y-%m-%d %H:%M:%S"),
            "resolved_timestamp": resolved.strftime("%Y-%m-%d %H:%M:%S") if status != "HEALTHY" else "",
            "flow_impact_pct": flow_impact,
            "operational_notes": note,
        })
        eq_id += 1

# Product readiness events for tanks T-101 to T-504
tank_id_counter = 1
readiness_id = 1
for d in DEPOTS:
    depot_id = d["depot_id"]
    tanks = [f"T-{d['code'].replace('-', '')[:3]}-{t:02d}" for t in range(1, 5)]
    cur_time = START_DATE
    while cur_time < OPERATIONAL_END:
        cur_time += timedelta(hours=random.randint(18, 48))
        tank = random.choice(tanks)
        prod = random.choice(PRODUCTS)
        r_roll = random.random()
        r_status = "READY" if r_roll > 0.12 else ("CONSTRAINED" if r_roll > 0.04 else "UNAVAILABLE")
        cert_vol = random.randint(2500000, 8500000)
        resolved = cur_time + timedelta(hours=random.randint(4, 24)) if r_status != "READY" else cur_time
        reason = "" if r_status == "READY" else random.choice(["LAB_OCTANE_CERTIFICATION_PENDING", "PIPELINE_BATCH_TRANSFER_ACTIVE", "TANK_SETTLING_WATER_DRAINAGE", "SULFUR_PPM_ASSAY_RUN"])
        
        product_readiness_data.append({
            "readiness_id": f"PRD-{readiness_id:06d}",
            "depot_id": depot_id,
            "product_id": prod["product_id"],
            "tank_id": tank,
            "readiness_status": r_status,
            "certified_volume_litres": cert_vol,
            "event_timestamp": cur_time.strftime("%Y-%m-%d %H:%M:%S"),
            "resolved_timestamp": resolved.strftime("%Y-%m-%d %H:%M:%S") if r_status != "READY" else "",
            "constraint_reason": reason,
        })
        readiness_id += 1

print(f"Generated {len(equipment_events_data)} equipment events, {len(product_readiness_data)} product readiness events.")

# ==============================================================================
# 4. GENERATE RISK EVENTS, DECISIONS, AUTONOMOUS ACTIONS & AUDIT
# ==============================================================================

print("4/7 Generating risk detections, autonomous decisions, actions, verifications & audit trails...")

risk_events_data = []
decisions_data = []
decision_stages_data = []
actions_data = []
verifications_data = []
audit_events_data = []
notifications_data = []

# Pre-seed Primary Nairobi Demo Decision Chain (DEC-0142 / INT-8801 / 2026-09-15 10:02:47)
demo_risk_id = "RSK-NBO-20260915-01"
risk_events_data.append({
    "risk_event_id": demo_risk_id,
    "depot_id": "nairobi",
    "detected_at": "2026-09-15 10:02:18",
    "risk_category": "TURNAROUND_RISK",
    "severity": "HIGH",
    "predicted_turnaround_min": 114,
    "baseline_turnaround_min": 65,
    "dwell_delta_min": 49,
    "exposure_at_risk_kes": 1850000,
    "primary_root_cause": "Loading Capacity Deficit (5/8 bays online) + Peak Arrival Surge",
    "affected_orders_count": 6,
    "status": "MITIGATED",
})

demo_decision_id = "DEC-0142"
decisions_data.append({
    "decision_id": demo_decision_id,
    "risk_event_id": demo_risk_id,
    "depot_id": "nairobi",
    "decision_timestamp": "2026-09-15 10:02:45",
    "headline": "Dual-Arm Fast-Track & Re-sequencing for Peak Demand Relief",
    "autonomy_level": "L2_AUTO_EXECUTABLE",
    "decision_status": "EXECUTED",
    "selected_candidate_id": "OPT-03",
    "policy_rule_id": "POL-042",
    "target_orders_count": 6,
})

# 8 stages for DEC-0142
demo_stages = [
    (1, "SIGNAL", "2026-09-15 10:02:18", "COMPLETED", "Trigger Received", "Expected Demand 18 orders vs 11 capacity", "Telemetry ingested from Smart Gate and SCADA DCS"),
    (2, "PREDICT", "2026-09-15 10:02:36", "COMPLETED", "Predicted Dwell Blowout", "114m turnaround (+49m above baseline SLA)", "Forecasted queue blowout with 92.4% confidence"),
    (3, "DIAGNOSE", "2026-09-15 10:02:40", "COMPLETED", "Causal Attribution", "-7 tankers / 90m capacity deficit", "Primary cause: Loading capacity deficit; Secondary: Metering drag"),
    (4, "OPTIMIZE", "2026-09-15 10:02:43", "COMPLETED", "Candidate Ranking", "OPT-03 selected (Score 94/100)", "Evaluated 4 candidate options; chosen for -38m projected recovery"),
    (5, "DECIDE", "2026-09-15 10:02:45", "COMPLETED", "Policy Gate", "POL-042 (L2 Passed)", "Autonomy rule satisfied: Dwell > 25m, zero hazardous cargo conflict"),
    (6, "EXECUTE", "2026-09-15 10:02:47", "COMPLETED", "Actuation Dispatch", "Dispatched to Bays P01 & P04", "Ack latency 142ms; orders LO-NBO-8821 re-sequenced"),
    (7, "VERIFY", "2026-09-15 10:48:15", "COMPLETED", "Closed-Loop Recovery", "Verified -34 min reduction", "Recovery attainment 89.5%; KES 1.42M exposure protected"),
    (8, "LOG", "2026-09-15 10:48:22", "COMPLETED", "Audit Digest Stamped", "SHA-256 Digest Confirmed", "Tamper-evident record sealed to immutable operational audit store"),
]
for seq, sname, stime, sstat, mlabel, mval, psum in demo_stages:
    decision_stages_data.append({
        "stage_id": f"STG-DEC0142-{seq:02d}",
        "decision_id": demo_decision_id,
        "stage_sequence": seq,
        "stage_name": sname,
        "stage_timestamp": stime,
        "stage_status": sstat,
        "metric_label": mlabel,
        "metric_value": mval,
        "payload_summary": psum,
    })

demo_action_id = "ACT-8801"
actions_data.append({
    "action_id": demo_action_id,
    "decision_id": demo_decision_id,
    "depot_id": "nairobi",
    "action_type": "RE_SEQUENCE_QUEUE_AND_DUAL_ARM",
    "control_state": "VERIFIED",
    "target_device_interface": "Gantry Loading Control Gateway (Bays P01 & P04)",
    "dispatched_at": "2026-09-15 10:02:47",
    "ack_latency_ms": 142,
    "execution_result": "SUCCESS_ACTUATION_CONFIRMED",
})

verifications_data.append({
    "verification_id": "VER-8801",
    "decision_id": demo_decision_id,
    "action_id": demo_action_id,
    "verified_at": "2026-09-15 10:48:15",
    "pre_intervention_turnaround_min": 114,
    "post_intervention_turnaround_min": 80,
    "expected_reduction_min": 38,
    "observed_reduction_min": 34,
    "recovery_attainment_pct": 89.5,
    "verification_status": "VERIFIED_FULL",
    "exposure_protected_kes": 1420000,
    "realized_savings_kes": 1150000,
})

audit_events_data.append({
    "audit_event_id": "AUD-8801",
    "decision_id": demo_decision_id,
    "action_id": demo_action_id,
    "audit_timestamp": "2026-09-15 10:48:22",
    "actor": "FLOWGUARD_AUTONOMY_ENGINE",
    "event_type": "CLOSED_LOOP_VERIFICATION_COMPLETE",
    "control_state": "VERIFIED",
    "audit_reference_sha256": hashlib.sha256(b"INT-8801_DEC-0142_ACT-8801_VER-8801").hexdigest(),
    "verification_digest": "VERIFIED: -34m reduction observed across 6 tankers (Recovery Attainment 89.5%)",
})

notifications_data.append({
    "notification_id": "NOTIF-0001",
    "order_id": demo_order_id,
    "omc_id": "vivo",
    "depot_id": "nairobi",
    "recipient_role": "DRIVER",
    "notification_type": "INSTRUCTION_UPDATE",
    "priority": "IMPORTANT",
    "title": "Fast-Track Loading Position Assigned: Bay P04",
    "message": "FlowGuard autonomous deconfliction has reassigned your collection from congested Bay P01 to dual-arm Bay P04.",
    "previous_timing": "Bay P01 (Queue: 3 tankers)",
    "new_timing": "Bay P04 (Immediate ingress)",
    "timestamp": "2026-09-15 10:31:00",
    "requires_acknowledgement": True,
    "is_acknowledged": True,
    "acknowledged_at": "2026-09-15 10:33:00",
})

# Generate ~850 historical risk events, decisions, actions, and verifications over 97 days
risk_counter = 2
decision_counter = 2
action_counter = 2
ver_counter = 2
aud_counter = 2
notif_counter = 2

risk_categories = [
    ("TURNAROUND_RISK", "Gantry Queue Congestion + Slow Metering"),
    ("QUEUE_PRESSURE", "Clustered Transporter Arrivals"),
    ("CAPACITY_PRESSURE", "Loading Position Offline for Maintenance"),
    ("ARRIVAL_CLUSTERING", "Morning Peak Arrival Surge"),
    ("EQUIPMENT_CONSTRAINT", "Flow Meter Temperature Sensor Drift"),
    ("PRODUCT_READINESS", "Tank Recertification Hold"),
]

cur_time = START_DATE
while cur_time < OPERATIONAL_END:
    cur_time += timedelta(hours=random.randint(2, 6))
    if random.random() > 0.45: # Risk event occurs
        depot = random.choices(DEPOTS, weights=[d["weight_share"] for d in DEPOTS])[0]
        depot_id = depot["depot_id"]
        rcat, rcause = random.choice(risk_categories)
        sev = random.choices(["LOW", "MEDIUM", "HIGH", "CRITICAL"], weights=[0.20, 0.45, 0.28, 0.07])[0]
        
        base_t = depot["baseline_turnaround_min"]
        delta_t = random.randint(12, 45) if sev in ["HIGH", "CRITICAL"] else random.randint(6, 20)
        pred_t = base_t + delta_t
        affected_count = random.randint(2, 8)
        exp_kes = affected_count * int(delta_t / 60.0 * 25000) * 10
        
        r_id = f"RSK-{depot_id[:3].upper()}-{risk_counter:05d}"
        risk_events_data.append({
            "risk_event_id": r_id,
            "depot_id": depot_id,
            "detected_at": cur_time.strftime("%Y-%m-%d %H:%M:%S"),
            "risk_category": rcat,
            "severity": sev,
            "predicted_turnaround_min": pred_t,
            "baseline_turnaround_min": base_t,
            "dwell_delta_min": delta_t,
            "exposure_at_risk_kes": exp_kes,
            "primary_root_cause": rcause,
            "affected_orders_count": affected_count,
            "status": "MITIGATED" if random.random() > 0.1 else "MONITORING",
        })
        
        # Associated Decision
        if sev in ["MEDIUM", "HIGH", "CRITICAL"]:
            dec_time = cur_time + timedelta(seconds=random.randint(15, 45))
            d_id = f"DEC-{decision_counter:05d}"
            
            # Autonomy level & status
            a_level = "L2_AUTO_EXECUTABLE" if sev != "CRITICAL" and random.random() > 0.3 else ("L3_APPROVAL_REQUIRED" if sev == "CRITICAL" else "L1_ADVISORY")
            d_status = "EXECUTED" if a_level == "L2_AUTO_EXECUTABLE" else ("APPROVED" if a_level == "L3_APPROVAL_REQUIRED" and random.random() > 0.1 else ("BLOCKED_BY_POLICY" if random.random() > 0.85 else "ADVISORY_POSTED"))
            
            decisions_data.append({
                "decision_id": d_id,
                "risk_event_id": r_id,
                "depot_id": depot_id,
                "decision_timestamp": dec_time.strftime("%Y-%m-%d %H:%M:%S"),
                "headline": f"{rcat.replace('_', ' ').title()} Mitigation at {depot['code']}",
                "autonomy_level": a_level,
                "decision_status": d_status,
                "selected_candidate_id": "OPT-03",
                "policy_rule_id": "POL-042" if a_level == "L2_AUTO_EXECUTABLE" else "POL-018",
                "target_orders_count": affected_count,
            })

            # Generate 8 discrete decision pipeline stages for every decision
            stages_meta = [
                (1, "SIGNAL", dec_time - timedelta(seconds=27), "COMPLETED", "Trigger Received", f"Demand surge at {depot['code']}", "Telemetry ingested from Smart Gate and SCADA DCS"),
                (2, "PREDICT", dec_time - timedelta(seconds=18), "COMPLETED", "Predicted Dwell Blowout", f"{pred_t}m turnaround (+{delta_t}m above baseline SLA)", "Forecasted queue blowout with 91% confidence"),
                (3, "DIAGNOSE", dec_time - timedelta(seconds=12), "COMPLETED", "Causal Attribution", rcause, f"Bottleneck identified at {depot['code']}"),
                (4, "OPTIMIZE", dec_time - timedelta(seconds=6), "COMPLETED", "Candidate Ranking", "OPT-03 selected (Score 92/100)", f"Evaluated candidate options for -{int(delta_t * 0.75)}m recovery"),
                (5, "DECIDE", dec_time, "COMPLETED" if d_status != "BLOCKED_BY_POLICY" else "BLOCKED", f"{a_level} Policy Check", f"Status: {d_status}", "Autonomy rule evaluation completed"),
                (6, "EXECUTE", dec_time + timedelta(seconds=2), "COMPLETED" if d_status in ["EXECUTED", "APPROVED"] else "SKIPPED", "Actuation Dispatch", "Actuation command routed", "Control payload delivered to terminal gateway"),
                (7, "VERIFY", dec_time + timedelta(minutes=45), "COMPLETED" if d_status in ["EXECUTED", "APPROVED"] else "SKIPPED", "Closed-Loop Recovery", f"Observed dwell delta reduction", "Field telemetry feedback verified"),
                (8, "LOG", dec_time + timedelta(minutes=45, seconds=7), "COMPLETED", "Audit Record Sealed", "SHA-256 Digest Confirmed", "Tamper-evident record sealed to immutable operational audit store"),
            ]
            for seq, sname, stime, sstat, mlabel, mval, psum in stages_meta:
                decision_stages_data.append({
                    "stage_id": f"STG-{d_id}-{seq:02d}",
                    "decision_id": d_id,
                    "stage_sequence": seq,
                    "stage_name": sname,
                    "stage_timestamp": stime.strftime("%Y-%m-%d %H:%M:%S"),
                    "stage_status": sstat,
                    "metric_label": mlabel,
                    "metric_value": mval,
                    "payload_summary": psum,
                })
            
            # Action if executed or approved
            if d_status in ["EXECUTED", "APPROVED"]:
                act_time = dec_time + timedelta(seconds=random.randint(2, 5))
                act_id = f"ACT-{action_counter:05d}"
                c_state = "VERIFIED" if random.random() > 0.15 else "PARTIAL"
                
                actions_data.append({
                    "action_id": act_id,
                    "decision_id": d_id,
                    "depot_id": depot_id,
                    "action_type": "RE_SEQUENCE_QUEUE_AND_DUAL_ARM" if random.random() > 0.5 else "DIVERT_TO_AUXILIARY_BAY",
                    "control_state": c_state,
                    "target_device_interface": f"Terminal Loading Actuator ({depot['code']})",
                    "dispatched_at": act_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "ack_latency_ms": random.randint(85, 210),
                    "execution_result": "SUCCESS_ACTUATION_CONFIRMED",
                })
                
                # Verification
                ver_time = act_time + timedelta(minutes=random.randint(30, 65))
                exp_red = int(delta_t * 0.75)
                # Evidence-based observed: not strictly equal to expected!
                obs_red = int(exp_red * random.uniform(0.78, 1.08))
                attainment = round((obs_red / exp_red) * 100, 1) if exp_red > 0 else 100.0
                ver_status = "VERIFIED_FULL" if attainment >= 85 else ("VERIFIED_PARTIAL" if attainment >= 60 else "FAILED_INCONCLUSIVE")
                prot_kes = int(exp_kes * (obs_red / delta_t)) if delta_t > 0 else 0
                real_kes = int(prot_kes * random.uniform(0.80, 0.95))
                
                ver_id = f"VER-{ver_counter:05d}"
                verifications_data.append({
                    "verification_id": ver_id,
                    "decision_id": d_id,
                    "action_id": act_id,
                    "verified_at": ver_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "pre_intervention_turnaround_min": pred_t,
                    "post_intervention_turnaround_min": pred_t - obs_red,
                    "expected_reduction_min": exp_red,
                    "observed_reduction_min": obs_red,
                    "recovery_attainment_pct": attainment,
                    "verification_status": ver_status,
                    "exposure_protected_kes": prot_kes,
                    "realized_savings_kes": real_kes,
                })
                
                # Audit Event
                aud_id = f"AUD-{aud_counter:05d}"
                audit_events_data.append({
                    "audit_event_id": aud_id,
                    "decision_id": d_id,
                    "action_id": act_id,
                    "audit_timestamp": (ver_time + timedelta(seconds=7)).strftime("%Y-%m-%d %H:%M:%S"),
                    "actor": "FLOWGUARD_AUTONOMY_ENGINE",
                    "event_type": "CLOSED_LOOP_VERIFICATION_COMPLETE",
                    "control_state": c_state,
                    "audit_reference_sha256": hashlib.sha256(f"{d_id}_{act_id}_{ver_id}".encode()).hexdigest(),
                    "verification_digest": f"Outcome verified: -{obs_red}m dwell reduction (Attainment {attainment}%)",
                })
                
                # Associated Operational Notification
                omc_pick = random.choice(OMCS)
                notifications_data.append({
                    "notification_id": f"NOTIF-{notif_counter:05d}",
                    "order_id": f"LO-{depot['code'].replace('-', '')}-{random.randint(1001, 9999)}",
                    "omc_id": omc_pick["omc_id"],
                    "depot_id": depot_id,
                    "recipient_role": "OMC" if random.random() > 0.5 else "DRIVER",
                    "notification_type": "PREDICTED_GATE_OUT_CHANGE" if random.random() > 0.4 else "INSTRUCTION_UPDATE",
                    "priority": "IMPORTANT" if sev in ["HIGH", "CRITICAL"] else "INFO",
                    "title": f"Collection Re-sequenced at {depot['name']}",
                    "message": f"Autonomous queue deconfliction has recovered estimated {obs_red}m turnaround delay.",
                    "previous_timing": f"+{delta_t}m projected delay",
                    "new_timing": f"+{delta_t - obs_red}m adjusted window",
                    "timestamp": act_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "requires_acknowledgement": False,
                    "is_acknowledged": True,
                    "acknowledged_at": (act_time + timedelta(minutes=2)).strftime("%Y-%m-%d %H:%M:%S"),
                })
                
                action_counter += 1
                ver_counter += 1
                aud_counter += 1
                notif_counter += 1
                
            decision_counter += 1
        risk_counter += 1

print(f"Generated {len(risk_events_data)} risk events, {len(decisions_data)} decisions, {len(actions_data)} actions, {len(verifications_data)} verifications, {len(audit_events_data)} audit records, {len(notifications_data)} notifications.")

# ==============================================================================
# 5. INJECT CONTROLLED DATA QUALITY ANOMALIES (1–3% INTENTIONAL ANOMALIES)
# ==============================================================================

print("5/7 Injecting controlled data quality anomalies for ETL / Great Expectations validation...")

# 1. Negative durations in loading events (12 records)
for i in range(12):
    idx = random.randint(100, len(loading_events_data) - 100)
    loading_events_data[idx]["loading_duration_minutes"] = -15.0
    invalid_injections.append({
        "table": "09_loading_events.csv",
        "entity_id": loading_events_data[idx]["loading_event_id"],
        "field": "loading_duration_minutes",
        "invalid_value": -15.0,
        "issue_type": "NEGATIVE_DURATION",
        "description": "Negative loading duration indicating sensor telemetry inversion error.",
    })

# 2. Gate-out before Gate-in (10 records)
for i in range(10):
    idx = random.randint(100, len(gate_events_data) - 100)
    if gate_events_data[idx]["event_type"] == "GATE_OUT":
        # Invert timestamp to 2 hours earlier
        curr_dt = datetime.strptime(gate_events_data[idx]["event_timestamp"], "%Y-%m-%d %H:%M:%S")
        inv_dt = curr_dt - timedelta(hours=3)
        gate_events_data[idx]["event_timestamp"] = inv_dt.strftime("%Y-%m-%d %H:%M:%S")
        invalid_injections.append({
            "table": "06_gate_events.csv",
            "entity_id": gate_events_data[idx]["gate_event_id"],
            "field": "event_timestamp",
            "invalid_value": gate_events_data[idx]["event_timestamp"],
            "issue_type": "CHRONOLOGICAL_INVERSION",
            "description": "Gate-out timestamp occurs before gate-in timestamp due to edge gateway clock drift.",
        })

# 3. Foreign key violation in loading orders (15 records: unknown depot / unknown OMC)
for i in range(8):
    idx = random.randint(50, len(orders_data) - 50)
    orders_data[idx]["depot_id"] = "marsabit"
    invalid_injections.append({
        "table": "05_loading_orders.csv",
        "entity_id": orders_data[idx]["order_id"],
        "field": "depot_id",
        "invalid_value": "marsabit",
        "issue_type": "UNKNOWN_FOREIGN_KEY",
        "description": "Referenced depot 'marsabit' does not exist in depots dimension table.",
    })
for i in range(7):
    idx = random.randint(50, len(orders_data) - 50)
    orders_data[idx]["omc_id"] = "unknown_petroleum"
    invalid_injections.append({
        "table": "05_loading_orders.csv",
        "entity_id": orders_data[idx]["order_id"],
        "field": "omc_id",
        "invalid_value": "unknown_petroleum",
        "issue_type": "UNKNOWN_FOREIGN_KEY",
        "description": "Referenced OMC 'unknown_petroleum' does not exist in OMCs dimension table.",
    })

# 4. Duplicate primary key in loading orders (10 records)
for i in range(10):
    src_idx = random.randint(100, 500)
    tgt_idx = random.randint(1000, 2000)
    orders_data[tgt_idx]["order_id"] = orders_data[src_idx]["order_id"]
    invalid_injections.append({
        "table": "05_loading_orders.csv",
        "entity_id": orders_data[tgt_idx]["order_id"],
        "field": "order_id",
        "invalid_value": orders_data[tgt_idx]["order_id"],
        "issue_type": "DUPLICATE_PRIMARY_KEY",
        "description": f"Duplicate order_id duplicate of row index {src_idx}.",
    })

# 5. Negative ordered quantity (10 records)
for i in range(10):
    idx = random.randint(50, len(orders_data) - 50)
    orders_data[idx]["ordered_quantity_litres"] = -36000
    invalid_injections.append({
        "table": "05_loading_orders.csv",
        "entity_id": orders_data[idx]["order_id"],
        "field": "ordered_quantity_litres",
        "invalid_value": -36000,
        "issue_type": "NEGATIVE_QUANTITY",
        "description": "Negative ordered quantity in ERP sales order record.",
    })

# 6. Extreme volume outlier (10 records: 950,000L ordered on a standard road tanker)
for i in range(10):
    idx = random.randint(50, len(orders_data) - 50)
    orders_data[idx]["ordered_quantity_litres"] = 950000
    invalid_injections.append({
        "table": "05_loading_orders.csv",
        "entity_id": orders_data[idx]["order_id"],
        "field": "ordered_quantity_litres",
        "invalid_value": 950000,
        "issue_type": "EXTREME_OUTLIER",
        "description": "Ordered volume 950,000L exceeds physical maximum road tanker capacity (40,000L).",
    })

# 7. Null required foreign key (10 records)
for i in range(10):
    idx = random.randint(50, len(orders_data) - 50)
    orders_data[idx]["truck_id"] = ""
    invalid_injections.append({
        "table": "05_loading_orders.csv",
        "entity_id": orders_data[idx]["order_id"],
        "field": "truck_id",
        "invalid_value": "",
        "issue_type": "NULL_REQUIRED_FIELD",
        "description": "Missing required truck_id in order header.",
    })

# 8. Negative staging wait duration (10 records)
for i in range(10):
    idx = random.randint(100, len(staging_events_data) - 100)
    staging_events_data[idx]["wait_duration_minutes"] = -8.5
    invalid_injections.append({
        "table": "08_staging_events.csv",
        "entity_id": staging_events_data[idx]["staging_id"],
        "field": "wait_duration_minutes",
        "invalid_value": -8.5,
        "issue_type": "NEGATIVE_DURATION",
        "description": "Negative staging queue wait duration.",
    })

print(f"Injected {len(invalid_injections)} intentional data quality anomalies (~1.1% of dataset) for validation testing.")

# ==============================================================================
# 6. EXPORT ALL 20 CSV FILES
# ==============================================================================

print("6/7 Exporting 20 relational CSV files...")

def write_csv(filename, fieldnames, rows):
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"  ✓ Written: {filename} ({len(rows):,} rows)")

# 01 Depots
write_csv(
    "01_depots.csv",
    ["depot_id", "name", "code", "region", "total_positions", "baseline_turnaround_min", "operating_hours_open", "operating_hours_close"],
    [{k: v for k, v in d.items() if k != "weight_share"} for d in DEPOTS]
)

# 02 OMCs
write_csv(
    "02_omcs.csv",
    ["omc_id", "name", "short_name", "account_code", "primary_depot_id", "contact_email", "volume_tier"],
    [{k: v for k, v in o.items() if k != "volume_share"} for o in OMCS]
)

# 03 Products
write_csv(
    "03_products.csv",
    ["product_id", "code", "name", "density_kg_per_l", "standard_flow_rate_lpm", "is_hazardous_priority", "compatible_bays_desc"],
    [{k: v for k, v in p.items() if k != "demand_share"} for p in PRODUCTS]
)

# 04 Trucks
write_csv(
    "04_trucks.csv",
    ["truck_id", "registration", "trailer_registration", "transporter_name", "driver_name", "driver_national_id", "capacity_litres", "compartments_count", "tare_weight_kg", "vehicle_type", "active_status"],
    trucks_data
)

# 05 Loading Orders
write_csv(
    "05_loading_orders.csv",
    ["order_id", "omc_id", "depot_id", "truck_id", "product_id", "ordered_quantity_litres", "order_registered_time", "expected_arrival_time", "scheduled_window_start", "scheduled_window_end", "order_status", "cancellation_reason"],
    orders_data
)

# 06 Gate Events
write_csv(
    "06_gate_events.csv",
    ["gate_event_id", "order_id", "depot_id", "truck_id", "event_type", "event_timestamp", "tare_weight_kg", "gross_weight_kg", "rfid_transponder_id", "gate_lane"],
    gate_events_data
)

# 07 Validation Events
write_csv(
    "07_validation_events.csv",
    ["validation_id", "order_id", "depot_id", "validation_start", "validation_end", "duration_minutes", "validation_outcome", "customs_status", "electronic_manifest_matched", "exception_reason"],
    validation_events_data
)

# 08 Staging Events
write_csv(
    "08_staging_events.csv",
    ["staging_id", "order_id", "depot_id", "staging_area_id", "queue_entry_time", "queue_exit_time", "wait_duration_minutes", "queue_reason", "initial_predicted_wait_min"],
    staging_events_data
)

# 09 Loading Events
write_csv(
    "09_loading_events.csv",
    ["loading_event_id", "order_id", "depot_id", "loading_position_id", "loading_start", "loading_end", "planned_quantity_litres", "actual_quantity_litres", "loading_duration_minutes", "avg_flow_rate_lpm", "dual_arm_used", "loading_status", "exception_reason"],
    loading_events_data
)

# 10 Loading Positions
write_csv(
    "10_loading_positions.csv",
    ["loading_position_id", "depot_id", "code", "bay_number", "product_compatibility", "has_dual_arm", "standard_flow_rate_lpm", "is_high_velocity"],
    positions_data
)

# 11 Equipment Events
write_csv(
    "11_equipment_events.csv",
    ["equipment_event_id", "depot_id", "loading_position_id", "equipment_category", "component_name", "status", "event_timestamp", "resolved_timestamp", "flow_impact_pct", "operational_notes"],
    equipment_events_data
)

# 12 Product Readiness Events
write_csv(
    "12_product_readiness_events.csv",
    ["readiness_id", "depot_id", "product_id", "tank_id", "readiness_status", "certified_volume_litres", "event_timestamp", "resolved_timestamp", "constraint_reason"],
    product_readiness_data
)

# 13 Arrival Signals
write_csv(
    "13_arrival_signals.csv",
    ["signal_id", "order_id", "signal_source", "signal_timestamp", "signal_quality", "estimated_distance_km", "predicted_arrival_window_start", "predicted_arrival_window_end", "confidence_pct"],
    arrival_signals_data
)

# 14 Notifications
write_csv(
    "14_notifications.csv",
    ["notification_id", "order_id", "omc_id", "depot_id", "recipient_role", "notification_type", "priority", "title", "message", "previous_timing", "new_timing", "timestamp", "requires_acknowledgement", "is_acknowledged", "acknowledged_at"],
    notifications_data
)

# 15 Risk Events
write_csv(
    "15_risk_events.csv",
    ["risk_event_id", "depot_id", "detected_at", "risk_category", "severity", "predicted_turnaround_min", "baseline_turnaround_min", "dwell_delta_min", "exposure_at_risk_kes", "primary_root_cause", "affected_orders_count", "status"],
    risk_events_data
)

# 16 Decisions
write_csv(
    "16_decisions.csv",
    ["decision_id", "risk_event_id", "depot_id", "decision_timestamp", "headline", "autonomy_level", "decision_status", "selected_candidate_id", "policy_rule_id", "target_orders_count"],
    decisions_data
)

# 17 Decision Stages
write_csv(
    "17_decision_stages.csv",
    ["stage_id", "decision_id", "stage_sequence", "stage_name", "stage_timestamp", "stage_status", "metric_label", "metric_value", "payload_summary"],
    decision_stages_data
)

# 18 Autonomous Actions
write_csv(
    "18_autonomous_actions.csv",
    ["action_id", "decision_id", "depot_id", "action_type", "control_state", "target_device_interface", "dispatched_at", "ack_latency_ms", "execution_result"],
    actions_data
)

# 19 Verification Events
write_csv(
    "19_verification_events.csv",
    ["verification_id", "decision_id", "action_id", "verified_at", "pre_intervention_turnaround_min", "post_intervention_turnaround_min", "expected_reduction_min", "observed_reduction_min", "recovery_attainment_pct", "verification_status", "exposure_protected_kes", "realized_savings_kes"],
    verifications_data
)

# 20 Audit Events
write_csv(
    "20_audit_events.csv",
    ["audit_event_id", "decision_id", "action_id", "audit_timestamp", "actor", "event_type", "control_state", "audit_reference_sha256", "verification_digest"],
    audit_events_data
)

# ==============================================================================
# 7. GENERATE MANIFEST.JSON
# ==============================================================================

print("7/7 Creating MANIFEST.json and quality anomaly audit file...")

manifest = {
    "dataset_name": "KPC FlowGuard Synthetic Source Dataset",
    "version": "1.0.0",
    "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "random_seed": RANDOM_SEED,
    "date_range": {
        "start": START_DATE.strftime("%Y-%m-%d %H:%M:%S"),
        "historical_end": HISTORICAL_END.strftime("%Y-%m-%d %H:%M:%S"),
        "operational_end": OPERATIONAL_END.strftime("%Y-%m-%d %H:%M:%S"),
        "total_days": total_days,
    },
    "entities_summary": {
        "depots_count": len(DEPOTS),
        "omcs_count": len(OMCS),
        "products_count": len(PRODUCTS),
        "loading_positions_count": len(positions_data),
        "trucks_count": len(trucks_data),
        "loading_orders_count": len(orders_data),
        "gate_events_count": len(gate_events_data),
        "validation_events_count": len(validation_events_data),
        "staging_events_count": len(staging_events_data),
        "loading_events_count": len(loading_events_data),
        "equipment_events_count": len(equipment_events_data),
        "product_readiness_events_count": len(product_readiness_data),
        "arrival_signals_count": len(arrival_signals_data),
        "risk_events_count": len(risk_events_data),
        "decisions_count": len(decisions_data),
        "decision_stages_count": len(decision_stages_data),
        "actions_count": len(actions_data),
        "verification_events_count": len(verifications_data),
        "audit_events_count": len(audit_events_data),
        "notifications_count": len(notifications_data),
    },
    "intentional_anomalies_count": len(invalid_injections),
    "primary_nairobi_demo_order": "LO-NBO-8821",
    "primary_nairobi_demo_decision": "DEC-0142",
    "primary_nairobi_demo_action": "ACT-8801",
    "files": [
        "01_depots.csv", "02_omcs.csv", "03_products.csv", "04_trucks.csv",
        "05_loading_orders.csv", "06_gate_events.csv", "07_validation_events.csv",
        "08_staging_events.csv", "09_loading_events.csv", "10_loading_positions.csv",
        "11_equipment_events.csv", "12_product_readiness_events.csv",
        "13_arrival_signals.csv", "14_notifications.csv", "15_risk_events.csv",
        "16_decisions.csv", "17_decision_stages.csv", "18_autonomous_actions.csv",
        "19_verification_events.csv", "20_audit_events.csv"
    ]
}

with open(os.path.join(OUTPUT_DIR, "MANIFEST.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

with open(os.path.join(OUTPUT_DIR, "INTENTIONAL_ANOMALIES.json"), "w", encoding="utf-8") as f:
    json.dump(invalid_injections, f, indent=2)

print("\nSUCCESS: All 20 synthetic CSV files and MANIFEST.json generated successfully!")
