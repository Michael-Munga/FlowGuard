# FlowGuard ETL Pipeline & Quarantine Architecture

## 1. Overview
The FlowGuard ETL pipeline extracts raw synthetic SCADA, ERP, and IoT telematics from CSV source files, executes Great Expectations quality checks, isolates invalid or anomalous records into quarantine, and loads clean normalized records into canonical PostgreSQL tables in strict topological dependency order.

```
Source CSVs (synthetic_flowguard_data/)
      │
      ▼
1. File & Schema Discovery
      │
      ▼
2. Great Expectations Quality Suite (data_quality/)
      │
      ▼
3. Business Rule Validation & Anomaly Detection (etl/validators/)
      ├──────────────────────┐
      │                      │
   [Valid]               [Invalid]
      │                      │
      ▼                      ▼
4. Data Cleaning &       Quarantine Manager (etl/quarantine/)
   Type Normalization        ├─ CSV Files (etl/quarantine/*_quarantined.csv)
      │                      └─ DB Table (quarantine_records)
      ▼
5. Truncate Canonical Tables (Idempotent Guarantee)
      │
      ▼
6. Bulk Insert in Topological Order (20 Tables)
      │
      ▼
7. Update etl_runs Audit Record & Write Reports
```

---

## 2. Ingestion Stages

### Stage 1: File & Schema Discovery
Checks that all 20 required CSV files exist in `synthetic_flowguard_data/`. Reads them into pandas DataFrames.

### Stage 2: Great Expectations Quality Gate
Evaluates 40 expectations across master and event tables:
- File column count and naming
- Primary key nullability and uniqueness
- Set containment for depots (`nairobi`, `mombasa`, `nakuru`, `eldoret`, `kisumu`), OMCs, and products
- Numerical range assertions (quantities > 0, durations >= 0)

Outputs: `data_quality/reports/great_expectations_report.json`.

### Stage 3: Business Rule Validation & Anomaly Quarantine
Applies row-level domain rules and intercepts all 78 intentional anomalies:
- Duplicate primary keys on orders
- Unknown foreign key references (depots, OMCs, trucks, products)
- Non-positive ordered quantities
- Outlier volumes exceeding 100,000L road tanker axle limits
- Negative loading durations
- Negative staging wait durations
- Chronological inversions (departure timestamp preceding arrival timestamp)
- Orphaned child records whose parent orders were quarantined

### Stage 4: Cleaning & Type Normalization
Standardizes records:
- Trims whitespace from text fields
- Parses ISO 8601 timestamps into Python datetime objects
- Converts `NaN` / `NaT` into SQL `NULL`
- Casts boolean flags (`has_dual_arm`, `is_high_velocity`, `electronic_manifest_matched`)

### Stage 5: Idempotent Database Ingestion
Truncates canonical tables in reverse topological dependency order:
```sql
TRUNCATE TABLE audit_events, verification_events, ... depots CASCADE;
```
Bulk inserts validated records in forward topological order using SQLAlchemy's high-throughput `bulk_insert_mappings()`.

### Stage 6: Audit & Run Tracking
Logs execution metadata to `etl_runs` table:
- `run_id` (e.g. `ETL-20260915-XXXX`)
- `start_time`, `end_time`, `duration_seconds`
- `rows_read` (89,954)
- `rows_loaded` (89,338)
- `rows_quarantined` (616)
- `status` (`SUCCESS`)

---

## 3. How to Run

### Execute Full ETL Pipeline
```bash
python -m etl.run
```

### Run Standalone Quality Check
```bash
python -m data_quality.checkpoints.run_quality_gate
```

### Inspect Quarantine Records
Quarantined CSV files are stored in `etl/quarantine/`:
- `05_loading_orders_quarantined.csv`
- `06_gate_events_quarantined.csv`
- `08_staging_events_quarantined.csv`
- `09_loading_events_quarantined.csv`
- `quarantine_manifest.json`

To query quarantine records directly from PostgreSQL:
```sql
SELECT source_table, validation_rule, count(*) 
FROM quarantine_records 
GROUP BY source_table, validation_rule;
```
