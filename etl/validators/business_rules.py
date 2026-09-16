"""Domain business rules and row-level data validation logic for FlowGuard ETL.

Detects schema violations, range extremes, chronological inversions, and
foreign key anomalies, separating valid records from quarantine candidates.
"""

from typing import Dict, List, Tuple, Set, Any, Optional
import pandas as pd
from datetime import datetime
from etl.quarantine.manager import QuarantineManager


VALID_DEPOTS = {"nairobi", "mombasa", "nakuru", "eldoret", "kisumu"}
VALID_OMCS = {"vivo", "totalenergies", "rubis", "ola", "lakeoil", "hass", "petrocity"}
VALID_PRODUCTS = {"PMS", "AGO", "DPK", "JET-A1"}
MAX_LEGAL_TANKER_VOLUME_LITRES = 100000


class BusinessRuleValidator:
    """Applies domain business rules and routes failing rows to QuarantineManager."""

    def __init__(self, quarantine_mgr: QuarantineManager):
        self.qm = quarantine_mgr
        self.valid_order_ids: Set[str] = set()
        self.valid_truck_ids: Set[str] = set()
        self.valid_position_ids: Set[str] = set()
        self.valid_decision_ids: Set[str] = set()
        self.valid_action_ids: Set[str] = set()

    def validate_depots(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 01_depots.csv master records."""
        valid_rows = []
        for _, row in df.iterrows():
            depot_id = str(row["depot_id"]).strip()
            if depot_id not in VALID_DEPOTS:
                self.qm.quarantine(
                    source_table="01_depots.csv",
                    source_row_id=depot_id,
                    failure_reason=f"Unknown depot_id '{depot_id}' not in recognized KPC stations",
                    validation_rule="RULE_VALID_DEPOT_ID",
                    raw_record=row.to_dict(),
                )
                continue
            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_omcs(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 02_omcs.csv master records."""
        valid_rows = []
        for _, row in df.iterrows():
            omc_id = str(row["omc_id"]).strip()
            if omc_id not in VALID_OMCS:
                self.qm.quarantine(
                    source_table="02_omcs.csv",
                    source_row_id=omc_id,
                    failure_reason=f"Unknown omc_id '{omc_id}' not in authorized marketing companies",
                    validation_rule="RULE_VALID_OMC_ID",
                    raw_record=row.to_dict(),
                )
                continue
            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_products(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 03_products.csv master records."""
        valid_rows = []
        for _, row in df.iterrows():
            product_id = str(row["product_id"]).strip()
            if product_id not in VALID_PRODUCTS:
                self.qm.quarantine(
                    source_table="03_products.csv",
                    source_row_id=product_id,
                    failure_reason=f"Unknown product_id '{product_id}'",
                    validation_rule="RULE_VALID_PRODUCT_ID",
                    raw_record=row.to_dict(),
                )
                continue
            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_trucks(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 04_trucks.csv fleet records."""
        valid_rows = []
        for _, row in df.iterrows():
            truck_id = str(row["truck_id"]).strip()
            if not truck_id or truck_id.lower() == "nan":
                self.qm.quarantine(
                    source_table="04_trucks.csv",
                    source_row_id=truck_id,
                    failure_reason="Missing truck_id primary identifier",
                    validation_rule="RULE_NULL_TRUCK_ID",
                    raw_record=row.to_dict(),
                )
                continue
            self.valid_truck_ids.add(truck_id)
            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_loading_positions(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 10_loading_positions.csv hardware positions."""
        valid_rows = []
        for _, row in df.iterrows():
            pos_id = str(row["loading_position_id"]).strip()
            depot_id = str(row["depot_id"]).strip()
            if depot_id not in VALID_DEPOTS:
                self.qm.quarantine(
                    source_table="10_loading_positions.csv",
                    source_row_id=pos_id,
                    failure_reason=f"Position references invalid depot_id '{depot_id}'",
                    validation_rule="RULE_POSITION_DEPOT_FK",
                    raw_record=row.to_dict(),
                )
                continue
            self.valid_position_ids.add(pos_id)
            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_loading_orders(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 05_loading_orders.csv transactions and isolate anomalies."""
        valid_rows = []
        seen_order_ids: Set[str] = set()

        for _, row in df.iterrows():
            order_id = str(row["order_id"]).strip()
            raw_dict = row.to_dict()

            # 1. Check for null or invalid primary key
            if not order_id or order_id.lower() == "nan":
                self.qm.quarantine(
                    source_table="05_loading_orders.csv",
                    source_row_id=order_id,
                    failure_reason="Null or missing order_id primary identifier",
                    validation_rule="RULE_NULL_REQUIRED_FIELD",
                    raw_record=raw_dict,
                )
                continue

            # 2. Check for duplicate primary key
            if order_id in seen_order_ids:
                self.qm.quarantine(
                    source_table="05_loading_orders.csv",
                    source_row_id=order_id,
                    failure_reason=f"Duplicate order_id '{order_id}' detected",
                    validation_rule="RULE_UNIQUE_ORDER_ID",
                    raw_record=raw_dict,
                )
                continue

            # 3. Check for required timestamps nullability
            if pd.isna(row.get("order_registered_time")) or pd.isna(row.get("expected_arrival_time")):
                self.qm.quarantine(
                    source_table="05_loading_orders.csv",
                    source_row_id=order_id,
                    failure_reason="Required order schedule timestamps contain NULL values",
                    validation_rule="RULE_NULL_REQUIRED_FIELD",
                    raw_record=raw_dict,
                )
                continue

            # 4. Check foreign key constraints
            depot_id = str(row.get("depot_id", "")).strip()
            if depot_id not in VALID_DEPOTS:
                self.qm.quarantine(
                    source_table="05_loading_orders.csv",
                    source_row_id=order_id,
                    failure_reason=f"Unknown depot_id '{depot_id}' foreign key reference",
                    validation_rule="RULE_UNKNOWN_FOREIGN_KEY",
                    raw_record=raw_dict,
                )
                continue

            omc_id = str(row.get("omc_id", "")).strip()
            if omc_id not in VALID_OMCS:
                self.qm.quarantine(
                    source_table="05_loading_orders.csv",
                    source_row_id=order_id,
                    failure_reason=f"Unknown omc_id '{omc_id}' foreign key reference",
                    validation_rule="RULE_UNKNOWN_FOREIGN_KEY",
                    raw_record=raw_dict,
                )
                continue

            product_id = str(row.get("product_id", "")).strip()
            if product_id not in VALID_PRODUCTS:
                self.qm.quarantine(
                    source_table="05_loading_orders.csv",
                    source_row_id=order_id,
                    failure_reason=f"Unknown product_id '{product_id}' foreign key reference",
                    validation_rule="RULE_UNKNOWN_FOREIGN_KEY",
                    raw_record=raw_dict,
                )
                continue

            truck_id = str(row.get("truck_id", "")).strip()
            if truck_id not in self.valid_truck_ids:
                self.qm.quarantine(
                    source_table="05_loading_orders.csv",
                    source_row_id=order_id,
                    failure_reason=f"Unknown truck_id '{truck_id}' foreign key reference",
                    validation_rule="RULE_UNKNOWN_FOREIGN_KEY",
                    raw_record=raw_dict,
                )
                continue

            # 5. Check quantity constraints
            try:
                qty = float(row.get("ordered_quantity_litres", 0))
            except (ValueError, TypeError):
                qty = 0

            if qty <= 0:
                self.qm.quarantine(
                    source_table="05_loading_orders.csv",
                    source_row_id=order_id,
                    failure_reason=f"Non-positive ordered_quantity_litres ({qty}L)",
                    validation_rule="RULE_NEGATIVE_QUANTITY",
                    raw_record=raw_dict,
                )
                continue

            if qty > MAX_LEGAL_TANKER_VOLUME_LITRES:
                self.qm.quarantine(
                    source_table="05_loading_orders.csv",
                    source_row_id=order_id,
                    failure_reason=f"Extreme ordered_quantity_litres ({qty}L) exceeds legal road axle limit of 100,000L",
                    validation_rule="RULE_EXTREME_OUTLIER",
                    raw_record=raw_dict,
                )
                continue

            # Passed all rules
            seen_order_ids.add(order_id)
            self.valid_order_ids.add(order_id)
            valid_rows.append(row)

        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_gate_events(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 06_gate_events.csv and check chronological sequencing."""
        valid_rows = []
        # Group by order_id to detect chronological inversion
        events_by_order: Dict[str, List[Dict[str, Any]]] = {}

        for _, row in df.iterrows():
            event_id = str(row["gate_event_id"]).strip()
            order_id = str(row["order_id"]).strip()
            raw_dict = row.to_dict()

            # Referential integrity check
            if order_id not in self.valid_order_ids:
                self.qm.quarantine(
                    source_table="06_gate_events.csv",
                    source_row_id=event_id,
                    failure_reason=f"Gate event references quarantined or non-existent order_id '{order_id}'",
                    validation_rule="RULE_ORPHANED_FOREIGN_KEY",
                    raw_record=raw_dict,
                )
                continue

            if order_id not in events_by_order:
                events_by_order[order_id] = []
            events_by_order[order_id].append((event_id, raw_dict, row))

        # Check chronological consistency per order
        for order_id, order_events in events_by_order.items():
            if len(order_events) > 1:
                # Find arrival and departure
                arrival_ts = None
                departure_ts = None
                departure_event = None

                for evt_id, raw, original_row in order_events:
                    evt_type = str(raw.get("event_type", "")).upper()
                    ts_str = str(raw.get("event_timestamp", ""))
                    try:
                        ts = pd.to_datetime(ts_str)
                    except Exception:
                        ts = None

                    if evt_type in ("ARRIVAL", "ENTRY_WEIGHING") and arrival_ts is None:
                        arrival_ts = ts
                    elif evt_type in ("DEPARTURE", "EXIT_WEIGHING"):
                        departure_ts = ts
                        departure_event = (evt_id, raw, original_row)

                if arrival_ts is not None and departure_ts is not None and departure_ts < arrival_ts:
                    # Inversion detected! Quarantine the departure event
                    evt_id, raw, _ = departure_event
                    self.qm.quarantine(
                        source_table="06_gate_events.csv",
                        source_row_id=evt_id,
                        failure_reason=f"Chronological inversion: Departure ({departure_ts}) occurred before Arrival ({arrival_ts})",
                        validation_rule="RULE_CHRONOLOGICAL_INVERSION",
                        raw_record=raw,
                    )
                    # Add all other events except the inverted one
                    for e_id, _, o_row in order_events:
                        if e_id != evt_id:
                            valid_rows.append(o_row)
                    continue

            for _, _, original_row in order_events:
                valid_rows.append(original_row)

        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_validation_events(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 07_validation_events.csv."""
        valid_rows = []
        for _, row in df.iterrows():
            val_id = str(row["validation_id"]).strip()
            order_id = str(row["order_id"]).strip()
            raw_dict = row.to_dict()

            if order_id not in self.valid_order_ids:
                self.qm.quarantine(
                    source_table="07_validation_events.csv",
                    source_row_id=val_id,
                    failure_reason=f"Validation references quarantined or non-existent order_id '{order_id}'",
                    validation_rule="RULE_ORPHANED_FOREIGN_KEY",
                    raw_record=raw_dict,
                )
                continue
            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_staging_events(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 08_staging_events.csv and check wait duration >= 0."""
        valid_rows = []
        for _, row in df.iterrows():
            staging_id = str(row["staging_id"]).strip()
            order_id = str(row["order_id"]).strip()
            raw_dict = row.to_dict()

            if order_id not in self.valid_order_ids:
                self.qm.quarantine(
                    source_table="08_staging_events.csv",
                    source_row_id=staging_id,
                    failure_reason=f"Staging event references quarantined or non-existent order_id '{order_id}'",
                    validation_rule="RULE_ORPHANED_FOREIGN_KEY",
                    raw_record=raw_dict,
                )
                continue

            try:
                wait_min = float(row.get("wait_duration_minutes", 0))
            except (ValueError, TypeError):
                wait_min = 0

            if wait_min < 0:
                self.qm.quarantine(
                    source_table="08_staging_events.csv",
                    source_row_id=staging_id,
                    failure_reason=f"Negative staging wait duration ({wait_min} mins)",
                    validation_rule="RULE_NEGATIVE_DURATION",
                    raw_record=raw_dict,
                )
                continue

            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_loading_events(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 09_loading_events.csv and check loading duration >= 0."""
        valid_rows = []
        for _, row in df.iterrows():
            loading_id = str(row["loading_event_id"]).strip()
            order_id = str(row["order_id"]).strip()
            pos_id = str(row.get("loading_position_id", "")).strip()
            raw_dict = row.to_dict()

            if order_id not in self.valid_order_ids:
                self.qm.quarantine(
                    source_table="09_loading_events.csv",
                    source_row_id=loading_id,
                    failure_reason=f"Loading event references quarantined or non-existent order_id '{order_id}'",
                    validation_rule="RULE_ORPHANED_FOREIGN_KEY",
                    raw_record=raw_dict,
                )
                continue

            try:
                load_min = float(row.get("loading_duration_minutes", 0))
            except (ValueError, TypeError):
                load_min = 0

            if load_min < 0:
                self.qm.quarantine(
                    source_table="09_loading_events.csv",
                    source_row_id=loading_id,
                    failure_reason=f"Negative meter loading duration ({load_min} mins)",
                    validation_rule="RULE_NEGATIVE_DURATION",
                    raw_record=raw_dict,
                )
                continue

            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_equipment_events(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 11_equipment_events.csv."""
        valid_rows = []
        for _, row in df.iterrows():
            eq_id = str(row["equipment_event_id"]).strip()
            depot_id = str(row["depot_id"]).strip()
            if depot_id not in VALID_DEPOTS:
                self.qm.quarantine(
                    source_table="11_equipment_events.csv",
                    source_row_id=eq_id,
                    failure_reason=f"Equipment event references invalid depot '{depot_id}'",
                    validation_rule="RULE_FOREIGN_KEY_DEPOT",
                    raw_record=row.to_dict(),
                )
                continue
            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_product_readiness(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 12_product_readiness_events.csv."""
        valid_rows = []
        for _, row in df.iterrows():
            readiness_id = str(row["readiness_id"]).strip()
            depot_id = str(row["depot_id"]).strip()
            prod_id = str(row["product_id"]).strip()
            if depot_id not in VALID_DEPOTS or prod_id not in VALID_PRODUCTS:
                self.qm.quarantine(
                    source_table="12_product_readiness_events.csv",
                    source_row_id=readiness_id,
                    failure_reason="Invalid depot or product reference in readiness event",
                    validation_rule="RULE_UNKNOWN_FOREIGN_KEY",
                    raw_record=row.to_dict(),
                )
                continue
            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_arrival_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 13_arrival_signals.csv."""
        valid_rows = []
        for _, row in df.iterrows():
            sig_id = str(row["signal_id"]).strip()
            order_id = str(row["order_id"]).strip()
            if order_id not in self.valid_order_ids:
                self.qm.quarantine(
                    source_table="13_arrival_signals.csv",
                    source_row_id=sig_id,
                    failure_reason=f"Arrival signal references quarantined or non-existent order_id '{order_id}'",
                    validation_rule="RULE_ORPHANED_FOREIGN_KEY",
                    raw_record=row.to_dict(),
                )
                continue
            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_notifications(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 14_notifications.csv."""
        valid_rows = []
        for _, row in df.iterrows():
            notif_id = str(row["notification_id"]).strip()
            order_id = row.get("order_id")
            if pd.notna(order_id) and str(order_id).strip() and str(order_id).strip() not in self.valid_order_ids:
                # If order was quarantined, we can nullify or quarantine
                self.qm.quarantine(
                    source_table="14_notifications.csv",
                    source_row_id=notif_id,
                    failure_reason=f"Notification references quarantined order_id '{order_id}'",
                    validation_rule="RULE_ORPHANED_FOREIGN_KEY",
                    raw_record=row.to_dict(),
                )
                continue
            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_risk_events(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 15_risk_events.csv."""
        valid_rows = []
        for _, row in df.iterrows():
            risk_id = str(row["risk_event_id"]).strip()
            depot_id = str(row["depot_id"]).strip()
            if depot_id not in VALID_DEPOTS:
                self.qm.quarantine(
                    source_table="15_risk_events.csv",
                    source_row_id=risk_id,
                    failure_reason=f"Risk event references invalid depot '{depot_id}'",
                    validation_rule="RULE_FOREIGN_KEY_DEPOT",
                    raw_record=row.to_dict(),
                )
                continue
            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_decisions(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 16_decisions.csv."""
        valid_rows = []
        for _, row in df.iterrows():
            dec_id = str(row["decision_id"]).strip()
            depot_id = str(row["depot_id"]).strip()
            if depot_id not in VALID_DEPOTS:
                self.qm.quarantine(
                    source_table="16_decisions.csv",
                    source_row_id=dec_id,
                    failure_reason=f"Decision references invalid depot '{depot_id}'",
                    validation_rule="RULE_FOREIGN_KEY_DEPOT",
                    raw_record=row.to_dict(),
                )
                continue
            self.valid_decision_ids.add(dec_id)
            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_decision_stages(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 17_decision_stages.csv."""
        valid_rows = []
        for _, row in df.iterrows():
            stg_id = str(row["stage_id"]).strip()
            dec_id = str(row["decision_id"]).strip()
            if dec_id not in self.valid_decision_ids:
                self.qm.quarantine(
                    source_table="17_decision_stages.csv",
                    source_row_id=stg_id,
                    failure_reason=f"Decision stage references invalid decision_id '{dec_id}'",
                    validation_rule="RULE_ORPHANED_FOREIGN_KEY",
                    raw_record=row.to_dict(),
                )
                continue
            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_autonomous_actions(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 18_autonomous_actions.csv."""
        valid_rows = []
        for _, row in df.iterrows():
            act_id = str(row["action_id"]).strip()
            dec_id = str(row["decision_id"]).strip()
            if dec_id not in self.valid_decision_ids:
                self.qm.quarantine(
                    source_table="18_autonomous_actions.csv",
                    source_row_id=act_id,
                    failure_reason=f"Action references invalid decision_id '{dec_id}'",
                    validation_rule="RULE_ORPHANED_FOREIGN_KEY",
                    raw_record=row.to_dict(),
                )
                continue
            self.valid_action_ids.add(act_id)
            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_verification_events(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 19_verification_events.csv."""
        valid_rows = []
        for _, row in df.iterrows():
            ver_id = str(row["verification_id"]).strip()
            dec_id = str(row["decision_id"]).strip()
            act_id = str(row["action_id"]).strip()
            if dec_id not in self.valid_decision_ids or act_id not in self.valid_action_ids:
                self.qm.quarantine(
                    source_table="19_verification_events.csv",
                    source_row_id=ver_id,
                    failure_reason=f"Verification references invalid decision '{dec_id}' or action '{act_id}'",
                    validation_rule="RULE_ORPHANED_FOREIGN_KEY",
                    raw_record=row.to_dict(),
                )
                continue
            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)

    def validate_audit_events(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate 20_audit_events.csv."""
        valid_rows = []
        for _, row in df.iterrows():
            aud_id = str(row["audit_event_id"]).strip()
            dec_id = str(row["decision_id"]).strip()
            act_id = str(row["action_id"]).strip()
            if dec_id not in self.valid_decision_ids or act_id not in self.valid_action_ids:
                self.qm.quarantine(
                    source_table="20_audit_events.csv",
                    source_row_id=aud_id,
                    failure_reason=f"Audit references invalid decision '{dec_id}' or action '{act_id}'",
                    validation_rule="RULE_ORPHANED_FOREIGN_KEY",
                    raw_record=row.to_dict(),
                )
                continue
            valid_rows.append(row)
        return pd.DataFrame(valid_rows, columns=df.columns)
