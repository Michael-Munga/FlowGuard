"""ETL specific configuration."""
from backend.app.config import settings

SOURCE_DATA_DIR = settings.source_data_path
QUARANTINE_DIR = settings.quarantine_path
REPORTS_DIR = settings.reports_path

REQUIRED_CSV_FILES = [
    "01_depots.csv",
    "02_omcs.csv",
    "03_products.csv",
    "04_trucks.csv",
    "05_loading_orders.csv",
    "06_gate_events.csv",
    "07_validation_events.csv",
    "08_staging_events.csv",
    "09_loading_events.csv",
    "10_loading_positions.csv",
    "11_equipment_events.csv",
    "12_product_readiness_events.csv",
    "13_arrival_signals.csv",
    "14_notifications.csv",
    "15_risk_events.csv",
    "16_decisions.csv",
    "17_decision_stages.csv",
    "18_autonomous_actions.csv",
    "19_verification_events.csv",
    "20_audit_events.csv",
]
