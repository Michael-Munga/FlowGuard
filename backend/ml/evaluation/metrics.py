"""Evaluation metrics calculation for regression models and baseline comparisons."""

from typing import Dict, Any
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, median_absolute_error, r2_score


def calculate_regression_metrics(
    y_true: pd.Series, 
    y_pred: np.ndarray,
    is_turnaround: bool = False
) -> Dict[str, float]:
    """Compute comprehensive regression metrics for evaluation.
    
    Includes:
    - MAE: Mean Absolute Error (minutes)
    - RMSE: Root Mean Squared Error (minutes)
    - MedAE: Median Absolute Error (minutes)
    - P90_AE: 90th percentile absolute error (minutes)
    - R2: Coefficient of determination
    - Pct within 5, 10, 15 min (operational tolerance bands)
    """
    y_true_arr = np.array(y_true, dtype=float)
    y_pred_arr = np.array(y_pred, dtype=float)

    abs_errors = np.abs(y_true_arr - y_pred_arr)

    metrics = {
        "mae": float(round(mean_absolute_error(y_true_arr, y_pred_arr), 2)),
        "rmse": float(round(mean_squared_error(y_true_arr, y_pred_arr, squared=False), 2)),
        "medae": float(round(median_absolute_error(y_true_arr, y_pred_arr), 2)),
        "p90_ae": float(round(np.percentile(abs_errors, 90), 2)),
        "r2": float(round(r2_score(y_true_arr, y_pred_arr), 4)),
        "pct_within_5min": float(round(float((abs_errors <= 5.0).mean() * 100), 1)),
        "pct_within_10min": float(round(float((abs_errors <= 10.0).mean() * 100), 1)),
        "pct_within_15min": float(round(float((abs_errors <= 15.0).mean() * 100), 1)),
    }

    return metrics
