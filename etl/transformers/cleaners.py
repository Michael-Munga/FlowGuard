"""Data cleaners and normalization transformers for FlowGuard ETL."""

from datetime import datetime
from typing import Dict, Any, List
import pandas as pd
import numpy as np


class DataCleaner:
    """Normalizes raw DataFrames, standardizes nulls, parses timestamps, and casts types."""

    @staticmethod
    def clean_dataframe(df: pd.DataFrame, datetime_cols: List[str] = None, bool_cols: List[str] = None) -> List[Dict[str, Any]]:
        """Clean DataFrame and return list of dictionaries ready for SQLAlchemy ORM insertion."""
        if df.empty:
            return []

        df = df.copy()

        # Clean string columns
        for col in df.select_dtypes(include=["object"]).columns:
            df[col] = df[col].apply(lambda x: x.strip() if isinstance(x, str) else x)

        # Parse datetime columns
        if datetime_cols:
            for dt_col in datetime_cols:
                if dt_col in df.columns:
                    df[dt_col] = pd.to_datetime(df[dt_col], errors="coerce")

        # Parse boolean columns
        if bool_cols:
            for b_col in bool_cols:
                if b_col in df.columns:
                    df[b_col] = df[b_col].apply(lambda x: True if str(x).lower() in ("true", "1", "yes", "t") else False if pd.notna(x) else False)

        # Replace numpy NaN with None for proper SQL NULL handling
        df = df.replace({np.nan: None})

        # Convert records to dictionary
        records = df.to_dict(orient="records")

        # Ensure NaT is converted to None in timestamps
        for rec in records:
            for k, v in rec.items():
                if pd.isna(v) or v is pd.NaT:
                    rec[k] = None

        return records
