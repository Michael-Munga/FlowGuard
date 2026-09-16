"""Fleet repository handling road fuel tanker fleet queries and history."""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from backend.app.repositories.base import BaseRepository
from backend.app.db.models import Truck, LoadingOrder


class FleetRepository(BaseRepository[Truck]):
    """Repository handling road fuel tanker fleet queries and operational history."""

    def __init__(self, session: Session):
        super().__init__(Truck, session)

    def get_by_registration(self, registration: str) -> Optional[Truck]:
        """Fetch truck by Kenyan vehicle registration plate."""
        clean_reg = registration.strip().upper()
        stmt = select(Truck).where(Truck.registration == clean_reg)
        return self.session.scalars(stmt).first()

    def get_truck_history(
        self,
        truck_id: str,
        limit: int = 20,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """Fetch historical loading orders completed by this tanker vehicle."""
        bounded_limit = min(max(1, limit), 100)
        stmt = (
            select(LoadingOrder)
            .where(LoadingOrder.truck_id == truck_id)
            .order_by(desc(LoadingOrder.order_registered_time))
            .limit(bounded_limit)
            .offset(max(0, offset))
        )
        orders = self.session.scalars(stmt).all()
        return [
            {
                "order_id": o.order_id,
                "depot_id": o.depot_id,
                "omc_id": o.omc_id,
                "product_id": o.product_id,
                "quantity_litres": float(o.ordered_quantity_litres),
                "order_status": o.order_status,
                "registered_time": o.order_registered_time.isoformat() if o.order_registered_time else None,
            }
            for o in orders
        ]
