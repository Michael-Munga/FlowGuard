"""PostgreSQL dataset extraction for FlowGuard machine learning training and inference."""

from typing import Optional, Dict, Any
import pandas as pd
import numpy as np
from sqlalchemy import Engine, text

from backend.ml.features.definitions import (
    validate_arrival_features,
    validate_turnaround_features,
    ARRIVAL_ALL_FEATURES,
    TURNAROUND_ALL_FEATURES,
)


def extract_arrival_dataset(engine: Engine) -> pd.DataFrame:
    """Extract canonical historical arrival training dataset from PostgreSQL.
    
    Prediction Point: Pre-arrival reference time (signal_timestamp or order_registered_time).
    Target: minutes_to_arrival (reference_time -> gate ARRIVAL event).
    Zero Target Leakage: Excludes all post-arrival operational data.
    """
    query = text("""
        SELECT 
            o.order_id,
            o.depot_id,
            o.omc_id,
            o.product_id,
            CAST(o.ordered_quantity_litres AS FLOAT) as ordered_quantity_litres,
            COALESCE(s.signal_timestamp, o.order_registered_time) as reference_time,
            o.order_registered_time,
            o.expected_arrival_time,
            EXTRACT(EPOCH FROM (o.expected_arrival_time - COALESCE(s.signal_timestamp, o.order_registered_time))) / 60.0 as planned_lead_time_min,
            EXTRACT(HOUR FROM COALESCE(s.signal_timestamp, o.order_registered_time)) as hour_of_day,
            EXTRACT(DOW FROM COALESCE(s.signal_timestamp, o.order_registered_time)) as day_of_week,
            CASE WHEN s.signal_id IS NOT NULL THEN 1.0 ELSE 0.0 END as has_telematics_signal,
            CAST(COALESCE(s.estimated_distance_km, 25.0) AS FLOAT) as estimated_distance_km,
            COALESCE(s.signal_quality, 'NONE') as signal_quality,
            CAST(COALESCE(s.confidence_pct, 0.0) AS FLOAT) as signal_confidence_pct,
            CAST(d.baseline_turnaround_min AS FLOAT) as depot_baseline_turnaround_min,
            CAST(d.total_positions AS FLOAT) as depot_total_positions,
            EXTRACT(EPOCH FROM (ga.event_timestamp - COALESCE(s.signal_timestamp, o.order_registered_time))) / 60.0 as minutes_to_arrival
        FROM loading_orders o
        JOIN depots d ON o.depot_id = d.depot_id
        LEFT JOIN (
            SELECT DISTINCT ON (order_id) order_id, signal_id, signal_timestamp, signal_quality, estimated_distance_km, confidence_pct
            FROM arrival_signals
            ORDER BY order_id, signal_timestamp DESC
        ) s ON o.order_id = s.order_id
        JOIN gate_events ga ON o.order_id = ga.order_id AND ga.event_type = 'ARRIVAL'
        WHERE o.order_status = 'COMPLETED'
        ORDER BY reference_time ASC;
    """)

    with engine.connect() as conn:
        df = pd.read_sql(query, conn)

    # Validate leakage protection
    validate_arrival_features([col for col in df.columns if col != "minutes_to_arrival"])

    # Cast categoricals to str for scikit-learn OneHotEncoder
    for c in ["depot_id", "omc_id", "product_id", "signal_quality"]:
        df[c] = df[c].astype(str)

    return df


def extract_turnaround_dataset(engine: Engine) -> pd.DataFrame:
    """Extract canonical historical turnaround training dataset from PostgreSQL.
    
    Prediction Point: Gate-In physical weighbridge time.
    Target: turnaround_minutes (GATE_IN -> GATE_OUT duration).
    Zero Target Leakage: Excludes post-gate-in inspection, loading, and completion timestamps.
    """
    query = text("""
        WITH bay_stats AS (
            SELECT 
                depot_id,
                COUNT(*) as total_bays,
                SUM(CASE WHEN has_dual_arm THEN 1 ELSE 0 END) as dual_arm_bays,
                SUM(CASE WHEN product_compatibility ILIKE '%PMS%' THEN 1 ELSE 0 END) as pms_bays,
                SUM(CASE WHEN product_compatibility ILIKE '%AGO%' THEN 1 ELSE 0 END) as ago_bays,
                SUM(CASE WHEN product_compatibility ILIKE '%IK%' THEN 1 ELSE 0 END) as ik_bays,
                SUM(CASE WHEN product_compatibility ILIKE '%DPK%' THEN 1 ELSE 0 END) as dpk_bays
            FROM loading_positions
            GROUP BY depot_id
        )
        SELECT 
            o.order_id,
            o.depot_id,
            o.omc_id,
            o.product_id,
            CAST(o.ordered_quantity_litres AS FLOAT) as ordered_quantity_litres,
            o.order_registered_time,
            CAST(d.baseline_turnaround_min AS FLOAT) as depot_baseline_turnaround_min,
            CAST(d.total_positions AS FLOAT) as depot_total_positions,
            CAST(bs.dual_arm_bays AS FLOAT) as dual_arm_bays,
            CAST(CASE 
                WHEN o.product_id = 'PMS' THEN bs.pms_bays
                WHEN o.product_id = 'AGO' THEN bs.ago_bays
                WHEN o.product_id = 'IK' THEN bs.ik_bays
                ELSE bs.dpk_bays
            END AS FLOAT) as compatible_bays_count,
            gi.event_timestamp as gate_in_time,
            EXTRACT(HOUR FROM gi.event_timestamp) as gate_in_hour,
            EXTRACT(DOW FROM gi.event_timestamp) as gate_in_day_of_week,
            CAST(COALESCE(gi.tare_weight_kg, 14000) AS FLOAT) as tare_weight_kg,
            COALESCE(gi.gate_lane, 'Tare Weighbridge Scale 1') as gate_lane,
            EXTRACT(EPOCH FROM (go.event_timestamp - gi.event_timestamp)) / 60.0 as turnaround_minutes
        FROM loading_orders o
        JOIN depots d ON o.depot_id = d.depot_id
        JOIN bay_stats bs ON o.depot_id = bs.depot_id
        JOIN gate_events gi ON o.order_id = gi.order_id AND gi.event_type = 'GATE_IN'
        JOIN gate_events go ON o.order_id = go.order_id AND go.event_type = 'GATE_OUT'
        WHERE o.order_status = 'COMPLETED'
        ORDER BY gi.event_timestamp ASC;
    """)

    with engine.connect() as conn:
        df = pd.read_sql(query, conn)
        gates = pd.read_sql(text("""
            SELECT depot_id, event_type, event_timestamp
            FROM gate_events
            WHERE event_type IN ('GATE_IN', 'GATE_OUT')
            ORDER BY event_timestamp ASC;
        """), conn)

    # Compute point-in-time active trucks inside depot concurrently
    gates["delta"] = np.where(gates["event_type"] == "GATE_IN", 1, -1)
    gates["active_trucks"] = gates.groupby("depot_id")["delta"].cumsum()

    # Align each truck's gate_in_time with depot active concurrency right before entry
    df = df.sort_values("gate_in_time")
    merged = pd.merge_asof(
        df,
        gates[["depot_id", "event_timestamp", "active_trucks"]].rename(columns={"event_timestamp": "gate_in_time"}),
        on="gate_in_time",
        by="depot_id",
        direction="backward",
    )
    df["active_trucks_in_depot"] = merged["active_trucks"].fillna(2.0).astype(float)
    df["estimated_bay_utilization"] = df["active_trucks_in_depot"] / df["depot_total_positions"]

    # Validate leakage protection
    validate_turnaround_features([col for col in df.columns if col != "turnaround_minutes"])

    # Cast categoricals to str for scikit-learn OneHotEncoder
    for c in ["depot_id", "omc_id", "product_id", "gate_lane"]:
        df[c] = df[c].astype(str)

    return df


def extract_order_features_for_arrival(engine: Engine, order_id: str) -> Optional[pd.DataFrame]:
    """Extract single-order operational feature row for real-time online arrival inference."""
    query = text("""
        SELECT 
            o.order_id,
            o.depot_id,
            o.omc_id,
            o.product_id,
            CAST(o.ordered_quantity_litres AS FLOAT) as ordered_quantity_litres,
            COALESCE(s.signal_timestamp, o.order_registered_time) as reference_time,
            o.order_registered_time,
            o.expected_arrival_time,
            EXTRACT(EPOCH FROM (o.expected_arrival_time - COALESCE(s.signal_timestamp, o.order_registered_time))) / 60.0 as planned_lead_time_min,
            EXTRACT(HOUR FROM COALESCE(s.signal_timestamp, o.order_registered_time)) as hour_of_day,
            EXTRACT(DOW FROM COALESCE(s.signal_timestamp, o.order_registered_time)) as day_of_week,
            CASE WHEN s.signal_id IS NOT NULL THEN 1.0 ELSE 0.0 END as has_telematics_signal,
            CAST(COALESCE(s.estimated_distance_km, 25.0) AS FLOAT) as estimated_distance_km,
            COALESCE(s.signal_quality, 'NONE') as signal_quality,
            CAST(COALESCE(s.confidence_pct, 0.0) AS FLOAT) as signal_confidence_pct,
            CAST(d.baseline_turnaround_min AS FLOAT) as depot_baseline_turnaround_min,
            CAST(d.total_positions AS FLOAT) as depot_total_positions
        FROM loading_orders o
        JOIN depots d ON o.depot_id = d.depot_id
        LEFT JOIN (
            SELECT DISTINCT ON (order_id) order_id, signal_id, signal_timestamp, signal_quality, estimated_distance_km, confidence_pct
            FROM arrival_signals
            WHERE order_id = :order_id
            ORDER BY order_id, signal_timestamp DESC
        ) s ON o.order_id = s.order_id
        WHERE o.order_id = :order_id;
    """)

    with engine.connect() as conn:
        df = pd.read_sql(query, conn, params={"order_id": order_id})

    if df.empty:
        return None

    # Cast categoricals
    for c in ["depot_id", "omc_id", "product_id", "signal_quality"]:
        df[c] = df[c].astype(str)

    return df


def extract_order_features_for_turnaround(engine: Engine, order_id: str) -> Optional[pd.DataFrame]:
    """Extract single-order operational feature row for real-time online turnaround inference."""
    query = text("""
        WITH bay_stats AS (
            SELECT 
                depot_id,
                COUNT(*) as total_bays,
                SUM(CASE WHEN has_dual_arm THEN 1 ELSE 0 END) as dual_arm_bays,
                SUM(CASE WHEN product_compatibility ILIKE '%PMS%' THEN 1 ELSE 0 END) as pms_bays,
                SUM(CASE WHEN product_compatibility ILIKE '%AGO%' THEN 1 ELSE 0 END) as ago_bays,
                SUM(CASE WHEN product_compatibility ILIKE '%IK%' THEN 1 ELSE 0 END) as ik_bays,
                SUM(CASE WHEN product_compatibility ILIKE '%DPK%' THEN 1 ELSE 0 END) as dpk_bays
            FROM loading_positions
            GROUP BY depot_id
        )
        SELECT 
            o.order_id,
            o.depot_id,
            o.omc_id,
            o.product_id,
            CAST(o.ordered_quantity_litres AS FLOAT) as ordered_quantity_litres,
            CAST(d.baseline_turnaround_min AS FLOAT) as depot_baseline_turnaround_min,
            CAST(d.total_positions AS FLOAT) as depot_total_positions,
            CAST(bs.dual_arm_bays AS FLOAT) as dual_arm_bays,
            CAST(CASE 
                WHEN o.product_id = 'PMS' THEN bs.pms_bays
                WHEN o.product_id = 'AGO' THEN bs.ago_bays
                WHEN o.product_id = 'IK' THEN bs.ik_bays
                ELSE bs.dpk_bays
            END AS FLOAT) as compatible_bays_count,
            COALESCE(gi.event_timestamp, NOW()) as gate_in_time,
            EXTRACT(HOUR FROM COALESCE(gi.event_timestamp, NOW())) as gate_in_hour,
            EXTRACT(DOW FROM COALESCE(gi.event_timestamp, NOW())) as gate_in_day_of_week,
            CAST(COALESCE(gi.tare_weight_kg, 14800) AS FLOAT) as tare_weight_kg,
            COALESCE(gi.gate_lane, 'Tare Weighbridge Scale 1') as gate_lane
        FROM loading_orders o
        JOIN depots d ON o.depot_id = d.depot_id
        JOIN bay_stats bs ON o.depot_id = bs.depot_id
        LEFT JOIN gate_events gi ON o.order_id = gi.order_id AND gi.event_type = 'GATE_IN'
        WHERE o.order_id = :order_id;
    """)

    with engine.connect() as conn:
        df = pd.read_sql(query, conn, params={"order_id": order_id})
        if df.empty:
            return None
        
        depot_id = df["depot_id"].iloc[0]
        gate_in_time = df["gate_in_time"].iloc[0]

        # Calculate current active concurrency in depot
        active_count_query = text("""
            SELECT COUNT(*) 
            FROM gate_events gi
            LEFT JOIN gate_events go ON gi.order_id = go.order_id AND go.event_type = 'GATE_OUT'
            WHERE gi.depot_id = :depot_id 
              AND gi.event_type = 'GATE_IN' 
              AND gi.event_timestamp <= :gate_in_time
              AND (go.event_timestamp IS NULL OR go.event_timestamp > :gate_in_time);
        """)
        active_trucks = conn.execute(active_count_query, {
            "depot_id": depot_id,
            "gate_in_time": gate_in_time,
        }).scalar() or 2

    df["active_trucks_in_depot"] = float(active_trucks)
    df["estimated_bay_utilization"] = df["active_trucks_in_depot"] / df["depot_total_positions"]

    for c in ["depot_id", "omc_id", "product_id", "gate_lane"]:
        df[c] = df[c].astype(str)

    return df
