"""Base repository class with pagination and query helpers."""

from typing import Generic, TypeVar, Type, Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from backend.app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Generic repository providing standardized bounded querying and pagination."""

    def __init__(self, model: Type[ModelType], session: Session):
        self.model = model
        self.session = session

    def get_by_id(self, id_val: Any) -> Optional[ModelType]:
        """Fetch a single record by primary key."""
        return self.session.get(self.model, id_val)

    def list_paginated(
        self,
        limit: int = 50,
        offset: int = 0,
        max_limit: int = 200,
    ) -> List[ModelType]:
        """Fetch paginated records with bounded safety limit."""
        bounded_limit = min(max(1, limit), max_limit)
        stmt = select(self.model).limit(bounded_limit).offset(max(0, offset))
        return list(self.session.scalars(stmt).all())

    def count_all(self) -> int:
        """Count total rows in table."""
        stmt = select(func.count()).select_from(self.model)
        return self.session.scalar(stmt) or 0
