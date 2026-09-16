# FlowGuard Backend & Data Foundation

## 1. Architecture Overview
This directory contains the operational data foundation for Kenya Pipeline Company (KPC) FlowGuard. The system translates raw telemetry and transactional events into a strongly typed, query-optimized PostgreSQL relational layer.

```
CSV Source Data (synthetic_flowguard_data/)
      ↓
ETL Validation Pipeline (etl/run.py)
      ↓
Great Expectations Quality Suite (data_quality/)
      ↓
Invalid-Row Quarantine (etl/quarantine/ & DB quarantine_records)
      ↓
Canonical PostgreSQL Operational Schema (20 tables)
      ↓
Composite & Partial Indexes (0.04ms - 3.8ms query response)
      ↓
Repository Layer (backend/app/repositories/)
      ↓
Future FastAPI Backend (next phase)
```

---

## 2. Prerequisites & Environment Setup
- Python 3.8+ with virtualenv or pyenv
- PostgreSQL 15+ (local native service or Docker Compose)

### Python Dependencies Installation
```bash
pip install -r requirements.txt
# or
pip install -e .
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration values:
```env
DATABASE_URL=postgresql+psycopg2://flowguard:flowguard@localhost:5432/flowguard
SOURCE_DATA_DIR=synthetic_flowguard_data
QUARANTINE_DIR=etl/quarantine
REPORTS_DIR=data_quality/reports
ENVIRONMENT=development
LOG_LEVEL=INFO
```

---

## 3. PostgreSQL Setup

### Option A: Local Native PostgreSQL
Ensure the `flowguard` database and user exist:
```bash
psql -c "CREATE DATABASE flowguard;"
psql -c "CREATE ROLE flowguard WITH LOGIN PASSWORD 'flowguard' CREATEDB;"
psql -c "GRANT ALL PRIVILEGES ON DATABASE flowguard TO flowguard;"
psql -d flowguard -c "GRANT ALL ON SCHEMA public TO flowguard;"
```

### Option B: Docker Compose
```bash
docker compose up -d postgres
```

---

## 4. Database Migrations (Alembic)
Schema definitions are managed with Alembic.

To apply all canonical migrations:
```bash
alembic upgrade head
```

To roll back a migration:
```bash
alembic downgrade -1
```

To create a new migration after modifying SQLAlchemy models:
```bash
alembic revision --autogenerate -m "describe_changes"
```

---

## 5. ETL Pipeline Execution
Run the idempotent batch ETL loader:
```bash
python -m etl.run
```
The pipeline automatically:
1. Discovers the 20 source CSV files in `synthetic_flowguard_data/`.
2. Evaluates the Great Expectations quality suite (40 expectations).
3. Applies domain business rules, isolating anomalies to `etl/quarantine/` and `quarantine_records`.
4. Normalizes valid data types, timestamps, and boolean flags.
5. Ingests valid records into PostgreSQL in strict topological dependency order.
6. Records execution audit metrics in the `etl_runs` table.

---

## 6. Standalone Data Quality Gate
To run only the Great Expectations validation gate without modifying the database:
```bash
python -m data_quality.checkpoints.run_quality_gate
```
Outputs:
- Console summary
- Machine-readable report: `data_quality/reports/great_expectations_report.json`

---

## 7. Quarantine Mechanics
Invalid or anomalous records are captured with forensic diagnostic metadata:
- Source table and row identifier
- Triggered business rule (e.g. `RULE_NEGATIVE_QUANTITY`, `RULE_CHRONOLOGICAL_INVERSION`)
- Human-readable failure reason
- Full JSON string of original raw record
- Ingestion timestamp

Persisted in two locations:
1. CSV files in `etl/quarantine/<table_name>_quarantined.csv`
2. Database table `quarantine_records` linked to the specific `etl_run_id`.

---

## 8. Running Automated Tests
Execute the full test suite using pytest:
```bash
pytest -v
```
Covers:
- Dataset schema and manifest consistency (`test_dataset_schema.py`)
- Data quality and Great Expectations anomaly detection (`test_data_quality.py`)
- SQLAlchemy declarative models, constraints, and indexes (`test_database_models.py`)
- ETL idempotency, audit run tracking, and scenario data (`test_etl.py`)
- Repository queries, pagination boundaries, and lifecycle traces (`test_repository_queries.py`)

---

## 9. Performance & Index Verification
Empirical query execution benchmarks are documented in [`PERFORMANCE_NOTES.md`](file:///home/daudi/plp/hackathon3/backend/PERFORMANCE_NOTES.md).

To run query benchmarks:
```bash
python -c "
from backend.app.db.session import engine
from sqlalchemy import text
with engine.connect() as conn:
    print(conn.execute(text('EXPLAIN ANALYZE SELECT * FROM loading_orders WHERE depot_id=\'nairobi\' AND order_status=\'LOADING\';')).fetchall())
"
```
