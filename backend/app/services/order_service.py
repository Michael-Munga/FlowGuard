"""Order service orchestrating loading order lifecycle queries and OMC collections."""

from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from backend.app.repositories.order_repository import OrderRepository
from backend.app.db.models import LoadingOrder
from backend.app.schemas.common import PaginationMetadata, PaginatedResponse
from backend.app.schemas.order import (
    OrderSummary,
    OrderDetailResponse,
    OrderMilestones,
    MilestoneArrivalSignal,
    MilestoneGateEvent,
    MilestoneValidation,
    MilestoneStaging,
    MilestoneLoading,
    OmcSummaryResponse,
)
from backend.app.services.exceptions import EntityNotFoundError


class OrderService:
    """Service layer for loading order operations and tracking."""

    def __init__(self, session: Session):
        self.session = session
        self.repo = OrderRepository(session)

    def get_order_detail(self, order_id: str) -> OrderDetailResponse:
        """Fetch complete order detail with full milestone progression."""
        raw = self.repo.get_order_with_lifecycle(order_id)
        if not raw:
            raise EntityNotFoundError("Order", order_id)

        milestones_raw = raw.get("milestones", {})
        milestones = OrderMilestones(
            arrival_signal=MilestoneArrivalSignal(**milestones_raw["arrival_signal"]) if milestones_raw.get("arrival_signal") else None,
            gate_events=[MilestoneGateEvent(**g) for g in milestones_raw.get("gate_events", [])],
            validation=MilestoneValidation(**milestones_raw["validation"]) if milestones_raw.get("validation") else None,
            staging=MilestoneStaging(**milestones_raw["staging"]) if milestones_raw.get("staging") else None,
            loading=MilestoneLoading(**milestones_raw["loading"]) if milestones_raw.get("loading") else None,
        )

        return OrderDetailResponse(
            order_id=raw["order_id"],
            omc_id=raw["omc_id"],
            omc_name=raw["omc_name"],
            depot_id=raw["depot_id"],
            depot_name=raw["depot_name"],
            truck_id=raw["truck_id"],
            truck_registration=raw["truck_registration"],
            driver_name=raw["driver_name"],
            product_id=raw["product_id"],
            product_name=raw["product_name"],
            ordered_quantity_litres=raw["ordered_quantity_litres"],
            order_registered_time=raw["order_registered_time"],
            expected_arrival_time=raw["expected_arrival_time"],
            order_status=raw["order_status"],
            milestones=milestones,
        )

    def list_omc_orders(
        self,
        omc_id: str,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> PaginatedResponse[OrderSummary]:
        """Fetch paginated orders for an OMC."""
        bounded_limit = min(max(1, limit), 200)
        bounded_offset = max(0, offset)

        orders = self.repo.list_omc_orders(omc_id, status=status, limit=bounded_limit, offset=bounded_offset)

        # Count total matching orders
        conditions = [LoadingOrder.omc_id == omc_id]
        if status:
            conditions.append(LoadingOrder.order_status == status)
        total_stmt = select(func.count(LoadingOrder.order_id)).where(and_(*conditions))
        total = self.session.scalar(total_stmt) or 0

        items = [
            OrderSummary(
                order_id=o.order_id,
                omc_id=o.omc_id,
                depot_id=o.depot_id,
                truck_id=o.truck_id,
                product_id=o.product_id,
                ordered_quantity_litres=float(o.ordered_quantity_litres),
                order_registered_time=o.order_registered_time.isoformat() if o.order_registered_time else "",
                expected_arrival_time=o.expected_arrival_time.isoformat() if o.expected_arrival_time else "",
                order_status=o.order_status,
            )
            for o in orders
        ]

        has_more = (bounded_offset + len(items)) < total

        return PaginatedResponse[OrderSummary](
            items=items,
            pagination=PaginationMetadata(
                limit=bounded_limit,
                offset=bounded_offset,
                total=total,
                has_more=has_more,
            ),
        )

    def get_omc_summary(self, omc_id: str) -> OmcSummaryResponse:
        """Fetch aggregate summary of collection orders for an OMC."""
        summary = self.repo.get_omc_summary(omc_id)
        return OmcSummaryResponse(**summary)
