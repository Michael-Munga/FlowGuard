"""Loading order and OMC collection visibility API routes."""

from typing import Optional
from fastapi import APIRouter, Depends, Path, Query
from backend.app.api.deps import get_order_service
from backend.app.services.order_service import OrderService
from backend.app.schemas.common import PaginatedResponse
from backend.app.schemas.order import (
    OrderDetailResponse,
    OrderSummary,
    OmcSummaryResponse,
)

router = APIRouter(tags=["Loading Orders & OMC Operations"])


@router.get(
    "/orders/{order_id}",
    response_model=OrderDetailResponse,
    summary="Get order detail with full milestone progression",
)
def get_order_detail(
    order_id: str = Path(..., description="Loading order ID (e.g. LO-NBO-8821)"),
    service: OrderService = Depends(get_order_service),
) -> OrderDetailResponse:
    """Retrieve full commercial and physical milestone trail for a specific order."""
    return service.get_order_detail(order_id)


@router.get(
    "/omcs/{omc_id}/orders",
    response_model=PaginatedResponse[OrderSummary],
    summary="List paginated collection orders for an OMC",
)
def list_omc_orders(
    omc_id: str = Path(..., description="OMC identifier (e.g. vivo, totalenergies)"),
    status: Optional[str] = Query(None, description="Filter by order lifecycle status"),
    limit: int = Query(50, ge=1, le=200, description="Items per page (default: 50, max: 200)"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    service: OrderService = Depends(get_order_service),
) -> PaginatedResponse[OrderSummary]:
    """Retrieve bounded list of uplift orders registered by a specific Oil Marketing Company."""
    return service.list_omc_orders(omc_id=omc_id, status=status, limit=limit, offset=offset)


@router.get(
    "/omcs/{omc_id}/summary",
    response_model=OmcSummaryResponse,
    summary="Get OMC collection orders status breakdown",
)
def get_omc_summary(
    omc_id: str = Path(..., description="OMC identifier"),
    service: OrderService = Depends(get_order_service),
) -> OmcSummaryResponse:
    """Retrieve aggregated order status breakdown for an OMC."""
    return service.get_omc_summary(omc_id)
