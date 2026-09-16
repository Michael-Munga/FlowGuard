"""Standalone Data Quality Gate Runner.

Runs the FlowGuard Great Expectations suite across all 20 source CSV datasets,
evaluates integrity constraints, and outputs results.
"""

import sys
import json
import logging
from pathlib import Path
import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.app.config import settings
from etl.config import REQUIRED_CSV_FILES
from data_quality.expectations.suite import FlowGuardQualitySuite

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("flowguard.quality_gate")


def run_quality_gate() -> int:
    """Run data quality evaluation."""
    source_dir = settings.source_data_path
    logger.info("Evaluating Data Quality on dataset in %s...", source_dir)

    dfs = {}
    for f in REQUIRED_CSV_FILES:
        path = source_dir / f
        if not path.exists():
            logger.error("Missing source file: %s", f)
            return 1
        dfs[f] = pd.read_csv(path)

    suite = FlowGuardQualitySuite(dfs)
    results = suite.run_all_checks()

    reports_dir = settings.reports_path
    reports_dir.mkdir(parents=True, exist_ok=True)
    report_file = reports_dir / "great_expectations_report.json"
    with open(report_file, "w") as fp:
        json.dump(results, fp, indent=2)

    logger.info("================================================================================")
    logger.info("FLOWGUARD DATA QUALITY GATE RESULTS")
    logger.info("================================================================================")
    logger.info("Total Expectations Evaluated: %d", results["total_expectations"])
    logger.info("Passed Expectations: %d", results["passed_expectations"])
    logger.info("Flagged / Anomalous Expectations: %d", results["failed_expectations"])

    for tbl, res in results["table_results"].items():
        status = "PASSED" if res["failed"] == 0 else f"FLAGGED ({res['failed']} checks failed)"
        logger.info("  • %-30s : %s", tbl, status)

    logger.info("Full JSON report saved to: %s", report_file)
    logger.info("================================================================================")
    return 0


if __name__ == "__main__":
    sys.exit(run_quality_gate())
