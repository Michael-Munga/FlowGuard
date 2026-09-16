"""Common generic schemas for pagination, errors, and health checks."""

from typing import TypeVar, Generic, List, Optional, Dict, Any
from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginationMetadata(BaseModel):
    """Pagination metadata included in collection responses."""
    limit: int = Field(..., description="Maximum items requested in page")
    offset: int = Field(..., description="Number of items skipped from start")
    total: int = Field(..., description="Total available items matching filter")
    has_more: bool = Field(..., description="Whether subsequent items exist beyond this page")


class PaginatedResponse(BaseModel, Generic[T]):
    """Standardized wrapper for paginated collections."""
    items: List[T] = Field(..., description="Collection of items in current page")
    pagination: PaginationMetadata = Field(..., description="Pagination navigation metadata")


class ErrorDetail(BaseModel):
    """Standardized error payload detail."""
    code: str = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Human-readable error explanation")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional context or validation details")


class ErrorResponse(BaseModel):
    """Standard top-level error response envelope."""
    error: ErrorDetail


class HealthResponse(BaseModel):
    """Liveness probe response."""
    status: str = Field("ok", description="Liveness state")
    version: str = Field(..., description="API version")
    environment: str = Field(..., description="Deployment environment")


class ReadyResponse(BaseModel):
    """Readiness probe response verifying downstream database connectivity."""
    status: str = Field("ready", description="Readiness state")
    database: str = Field("ok", description="Database connection health")
    version: str = Field(..., description="API version")
