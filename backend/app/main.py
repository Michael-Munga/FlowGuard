"""FastAPI Main Application for KPC FlowGuard."""

import time
import uuid
import logging
from typing import Callable
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.app.config import settings
from backend.app.services.exceptions import FlowGuardServiceException
from backend.app.api.routes import api_router
from backend.app.api.routes.health import router as health_router

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("flowguard.api")

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# 1. Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 2. Structured Request Logging & Correlation ID Middleware
@app.middleware("http")
async def request_logging_middleware(request: Request, call_next: Callable) -> Response:
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start_time = time.time()

    response: Response = await call_next(request)

    duration_ms = round((time.time() - start_time) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{duration_ms}ms"

    logger.info(
        '[%s] %s %s -> %d (took %sms)',
        request_id[:8],
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


# 3. Centralized Exception Handlers
@app.exception_handler(FlowGuardServiceException)
async def service_exception_handler(request: Request, exc: FlowGuardServiceException) -> JSONResponse:
    logger.warning("Service error on %s: [%s] %s", request.url.path, exc.code, exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            }
        },
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": str(exc.detail),
            }
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request parameter validation failed.",
                "details": {"errors": exc.errors()},
            }
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled server exception on %s: %s", request.url.path, str(exc))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected operational server error occurred.",
            }
        },
    )


# 4. Include Routers
# Root-level health probes for container orchestrators
app.include_router(health_router)

# Operational REST API endpoints
app.include_router(api_router, prefix=settings.API_PREFIX)


# Root redirect to documentation
@app.get("/", include_in_schema=False)
def root_redirect():
    return RedirectResponse(url="/docs")
