"""Health and readiness probe routes."""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.db.session import get_db
from backend.app.schemas.common import HealthResponse, ReadyResponse

router = APIRouter(tags=["Health & Probes"])
logger = logging.getLogger("flowguard.api.health")


@router.get("/health", response_model=HealthResponse, summary="Liveness probe")
def get_health() -> HealthResponse:
    """Return process liveness state."""
    return HealthResponse(
        status="ok",
        version=settings.API_VERSION,
        environment=settings.ENVIRONMENT,
    )


@router.get("/ready", response_model=ReadyResponse, summary="Readiness probe")
def get_ready(db: Session = Depends(get_db)) -> ReadyResponse:
    """Verify database connectivity and query execution readiness."""
    try:
        db.execute(text("SELECT 1;"))
        return ReadyResponse(
            status="ready",
            database="ok",
            version=settings.API_VERSION,
        )
    except Exception as e:
        logger.error("Readiness check failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "unavailable", "database": "failed", "error": str(e)},
        )
