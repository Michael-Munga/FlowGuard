"""In-process singleton model loader and cache for FlowGuard ML models.

Ensures that machine learning model artifacts (.joblib) are loaded into memory once
per application process rather than on each HTTP request, eliminating disk I/O latency.
"""

import os
import json
import logging
from typing import Optional, Dict, Any, Tuple
import joblib

logger = logging.getLogger("flowguard.ml.loader")

ARRIVAL_MODEL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../models/arrival/arrival_model_v1.joblib")
)
ARRIVAL_METADATA_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../models/arrival/metadata.json")
)
TURNAROUND_MODEL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../models/turnaround/turnaround_model_v1.joblib")
)
TURNAROUND_METADATA_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../models/turnaround/metadata.json")
)


class ModelLoader:
    """Thread-safe, in-process singleton cache for trained FlowGuard models."""

    _arrival_model: Optional[Any] = None
    _arrival_metadata: Optional[Dict[str, Any]] = None
    _turnaround_model: Optional[Any] = None
    _turnaround_metadata: Optional[Dict[str, Any]] = None

    @classmethod
    def get_arrival_model(cls) -> Tuple[Any, Dict[str, Any]]:
        """Retrieve cached arrival prediction pipeline and metadata, loading on first access."""
        if cls._arrival_model is None:
            if not os.path.exists(ARRIVAL_MODEL_PATH):
                raise FileNotFoundError(
                    f"Arrival model artifact not found at '{ARRIVAL_MODEL_PATH}'. "
                    "Run 'python -m backend.ml.training.train_arrival' first."
                )
            logger.info("Loading Arrival Prediction pipeline into memory from %s", ARRIVAL_MODEL_PATH)
            cls._arrival_model = joblib.load(ARRIVAL_MODEL_PATH)

            if os.path.exists(ARRIVAL_METADATA_PATH):
                with open(ARRIVAL_METADATA_PATH, "r") as f:
                    cls._arrival_metadata = json.load(f)
            else:
                cls._arrival_metadata = {"model_version": "v1.0.0"}

        return cls._arrival_model, cls._arrival_metadata

    @classmethod
    def get_turnaround_model(cls) -> Tuple[Any, Dict[str, Any]]:
        """Retrieve cached turnaround prediction pipeline and metadata, loading on first access."""
        if cls._turnaround_model is None:
            if not os.path.exists(TURNAROUND_MODEL_PATH):
                raise FileNotFoundError(
                    f"Turnaround model artifact not found at '{TURNAROUND_MODEL_PATH}'. "
                    "Run 'python -m backend.ml.training.train_turnaround' first."
                )
            logger.info("Loading Turnaround Prediction pipeline into memory from %s", TURNAROUND_MODEL_PATH)
            cls._turnaround_model = joblib.load(TURNAROUND_MODEL_PATH)

            if os.path.exists(TURNAROUND_METADATA_PATH):
                with open(TURNAROUND_METADATA_PATH, "r") as f:
                    cls._turnaround_metadata = json.load(f)
            else:
                cls._turnaround_metadata = {"model_version": "v1.0.0"}

        return cls._turnaround_model, cls._turnaround_metadata

    @classmethod
    def warm_up(cls) -> None:
        """Pre-load all model artifacts into memory during application startup."""
        cls.get_arrival_model()
        cls.get_turnaround_model()
        logger.info("FlowGuard ML models successfully initialized in memory cache.")
