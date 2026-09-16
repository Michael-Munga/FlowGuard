"""Scikit-learn preprocessing pipelines for tabular operational features."""

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

from backend.ml.features.definitions import (
    ARRIVAL_CATEGORICAL_FEATURES,
    ARRIVAL_NUMERIC_FEATURES,
    TURNAROUND_CATEGORICAL_FEATURES,
    TURNAROUND_NUMERIC_FEATURES,
)


def create_arrival_preprocessor() -> ColumnTransformer:
    """Build preprocessing transformer for the Arrival Prediction Model."""
    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="constant", fill_value="UNKNOWN")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])

    numeric_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    return ColumnTransformer(
        transformers=[
            ("cat", categorical_pipeline, ARRIVAL_CATEGORICAL_FEATURES),
            ("num", numeric_pipeline, ARRIVAL_NUMERIC_FEATURES),
        ],
        remainder="drop",
    )


def create_turnaround_preprocessor() -> ColumnTransformer:
    """Build preprocessing transformer for the Turnaround Prediction Model."""
    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="constant", fill_value="UNKNOWN")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])

    numeric_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    return ColumnTransformer(
        transformers=[
            ("cat", categorical_pipeline, TURNAROUND_CATEGORICAL_FEATURES),
            ("num", numeric_pipeline, TURNAROUND_NUMERIC_FEATURES),
        ],
        remainder="drop",
    )
