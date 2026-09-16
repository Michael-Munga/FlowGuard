"""Quarantine management for invalid or anomalous records.

Captures failing records with audit context, writing them to both local quarantine
CSVs and PostgreSQL quarantine_records table.
"""

import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
import pandas as pd
from sqlalchemy.orm import Session
from backend.app.db.models.quarantine import QuarantineRecord


class QuarantineItem:
    """Represents a single quarantined record and its failure diagnostics."""

    def __init__(
        self,
        source_table: str,
        source_row_id: Optional[str],
        failure_reason: str,
        validation_rule: str,
        raw_record: Dict[str, Any],
    ):
        self.quarantine_id = f"Q-{uuid.uuid4().hex[:12].upper()}"
        self.source_table = source_table
        self.source_row_id = source_row_id or "UNKNOWN"
        self.failure_reason = failure_reason
        self.validation_rule = validation_rule
        self.raw_record = raw_record
        self.quarantined_at = datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "quarantine_id": self.quarantine_id,
            "source_table": self.source_table,
            "source_row_id": self.source_row_id,
            "failure_reason": self.failure_reason,
            "validation_rule": self.validation_rule,
            "raw_record": json.dumps(self.raw_record, default=str),
            "quarantined_at": self.quarantined_at.isoformat(),
        }


class QuarantineManager:
    """Manages the lifecycle of quarantined records during an ETL run."""

    def __init__(self, quarantine_dir: Path, run_id: str):
        self.quarantine_dir = quarantine_dir
        self.run_id = run_id
        self.items: List[QuarantineItem] = []
        self.quarantine_dir.mkdir(parents=True, exist_ok=True)

    def quarantine(
        self,
        source_table: str,
        source_row_id: Optional[str],
        failure_reason: str,
        validation_rule: str,
        raw_record: Dict[str, Any],
    ) -> QuarantineItem:
        """Record an invalid record into the quarantine batch."""
        item = QuarantineItem(
            source_table=source_table,
            source_row_id=source_row_id,
            failure_reason=failure_reason,
            validation_rule=validation_rule,
            raw_record=raw_record,
        )
        self.items.append(item)
        return item

    def get_count(self) -> int:
        return len(self.items)

    def persist_to_disk(self) -> Dict[str, int]:
        """Save quarantined records grouped by source table to CSV files."""
        if not self.items:
            return {}

        counts_by_table: Dict[str, int] = {}
        grouped_items: Dict[str, List[Dict[str, Any]]] = {}

        for item in self.items:
            table = item.source_table.replace(".csv", "")
            if table not in grouped_items:
                grouped_items[table] = []
            flat_row = item.to_dict()
            # Unpack raw_record for human readability in CSV
            flat_row["raw_record_payload"] = flat_row.pop("raw_record")
            grouped_items[table].append(flat_row)

        for table, rows in grouped_items.items():
            df = pd.DataFrame(rows)
            csv_path = self.quarantine_dir / f"{table}_quarantined.csv"
            df.to_csv(csv_path, index=False)
            counts_by_table[table] = len(rows)

        # Write manifest summary
        summary_path = self.quarantine_dir / "quarantine_manifest.json"
        manifest = {
            "run_id": self.run_id,
            "generated_at": datetime.utcnow().isoformat(),
            "total_quarantined": len(self.items),
            "tables_affected": counts_by_table,
        }
        with open(summary_path, "w") as f:
            json.dump(manifest, f, indent=2)

        return counts_by_table

    def persist_to_db(self, db_session: Session):
        """Insert all quarantine items into PostgreSQL quarantine_records table."""
        if not self.items:
            return

        db_records = [
            QuarantineRecord(
                quarantine_id=item.quarantine_id,
                run_id=self.run_id,
                source_table=item.source_table,
                source_row_id=item.source_row_id,
                failure_reason=item.failure_reason,
                validation_rule=item.validation_rule,
                raw_record=json.dumps(item.raw_record, default=str),
                quarantined_at=item.quarantined_at,
            )
            for item in self.items
        ]
        db_session.bulk_save_objects(db_records)
        db_session.flush()
