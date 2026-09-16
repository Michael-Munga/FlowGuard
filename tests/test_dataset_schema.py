"""Tests for verifying raw dataset schema integrity, column sets, and file presence."""

import json
from pathlib import Path
import pandas as pd
import pytest
from etl.config import REQUIRED_CSV_FILES
from backend.app.config import settings


def test_all_source_files_exist():
    """Verify that all 20 required CSV files exist in source data directory."""
    source_dir = settings.source_data_path
    assert source_dir.exists(), f"Source directory {source_dir} must exist"
    for f in REQUIRED_CSV_FILES:
        file_path = source_dir / f
        assert file_path.exists(), f"Missing required file {f}"
        assert file_path.stat().st_size > 0, f"File {f} must not be empty"


def test_manifest_consistency():
    """Verify MANIFEST.json accurately reflects table catalog."""
    manifest_path = settings.source_data_path / "MANIFEST.json"
    assert manifest_path.exists(), "MANIFEST.json must exist"
    with open(manifest_path) as fp:
        manifest = json.load(fp)

    assert "files" in manifest
    assert len(manifest["files"]) == 20
    for file_name in manifest["files"]:
        assert (settings.source_data_path / file_name).exists()


def test_depots_schema_and_pks():
    """Verify 01_depots.csv primary keys and column count."""
    df = pd.read_csv(settings.source_data_path / "01_depots.csv")
    assert len(df) == 5
    assert list(df.columns) == [
        "depot_id", "name", "code", "region", "total_positions",
        "baseline_turnaround_min", "operating_hours_open", "operating_hours_close"
    ]
    assert df["depot_id"].nunique() == 5
    assert not df["depot_id"].isnull().any()


def test_omcs_schema_and_pks():
    """Verify 02_omcs.csv primary keys and column count."""
    df = pd.read_csv(settings.source_data_path / "02_omcs.csv")
    assert len(df) == 7
    assert "omc_id" in df.columns
    assert df["omc_id"].nunique() == 7
    assert not df["omc_id"].isnull().any()


def test_products_schema_and_pks():
    """Verify 03_products.csv products integrity."""
    df = pd.read_csv(settings.source_data_path / "03_products.csv")
    assert len(df) == 4
    assert set(df["product_id"]) == {"PMS", "AGO", "DPK", "JET-A1"}
