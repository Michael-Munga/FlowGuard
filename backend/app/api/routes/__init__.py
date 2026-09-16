"""API routes router aggregation.

The health_router is intentionally NOT included here — it is mounted
directly on the FastAPI app in main.py (no /api prefix) so that liveness
and readiness probes are reachable at /health and /ready without the /api
prefix. Including it here would create duplicate shadow routes at
/api/health and /api/ready that can confuse FastAPI route resolution.
"""

from fastapi import APIRouter
from backend.app.api.routes.depots import router as depots_router
from backend.app.api.routes.orders import router as orders_router
from backend.app.api.routes.risks import router as risks_router
from backend.app.api.routes.decisions import router as decisions_router
from backend.app.api.routes.metrics import router as metrics_router
from backend.app.api.routes.predictions import router as predictions_router
from backend.app.api.routes.optimization import router as optimization_router

api_router = APIRouter()
api_router.include_router(depots_router)
api_router.include_router(orders_router)
api_router.include_router(risks_router)
api_router.include_router(decisions_router)
api_router.include_router(metrics_router)
api_router.include_router(predictions_router)
api_router.include_router(optimization_router)

__all__ = ["api_router"]
