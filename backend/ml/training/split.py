"""Chronological dataset splitting for FlowGuard ML models."""

from typing import Tuple
import pandas as pd

TRAIN_SPLIT_CUTOFF = "2026-08-11 00:00:00"
VAL_SPLIT_CUTOFF = "2026-09-01 00:00:00"


def chronological_split(
    df: pd.DataFrame, 
    time_column: str = "order_registered_time"
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Split dataset chronologically into Train (62.3%), Validation (21.7%), and Test (16.0%).
    
    Ensures that past data is never tested on future data and strictly avoids random shuffling.
    
    Intervals:
    - Train:      [2026-06-11, 2026-08-11)
    - Validation: [2026-08-11, 2026-09-01)
    - Test:       [2026-09-01, 2026-09-15]
    """
    df_sorted = df.sort_values(time_column).copy()

    # Convert cutoff to same timezone as dataframe column
    time_series = pd.to_datetime(df_sorted[time_column])
    tz = time_series.dt.tz

    train_cutoff = pd.Timestamp(TRAIN_SPLIT_CUTOFF, tz=tz)
    val_cutoff = pd.Timestamp(VAL_SPLIT_CUTOFF, tz=tz)

    train_df = df_sorted[time_series < train_cutoff].copy()
    val_df = df_sorted[(time_series >= train_cutoff) & (time_series < val_cutoff)].copy()
    test_df = df_sorted[time_series >= val_cutoff].copy()

    # Assert non-empty splits
    if len(train_df) == 0 or len(val_df) == 0 or len(test_df) == 0:
        raise ValueError(
            f"Chronological split produced empty partitions: "
            f"Train={len(train_df)}, Val={len(val_df)}, Test={len(test_df)}"
        )

    # Assert strict temporal ordering
    assert train_df[time_column].max() <= val_df[time_column].min(), "Train/Validation temporal overlap detected!"
    assert val_df[time_column].max() <= test_df[time_column].min(), "Validation/Test temporal overlap detected!"

    return train_df, val_df, test_df
