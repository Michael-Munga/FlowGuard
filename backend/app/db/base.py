"""Declarative base and common model mixins."""

from datetime import datetime
from sqlalchemy import Column, DateTime, String
from sqlalchemy.orm import DeclarativeBase, declared_attr


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy declarative models."""
    pass


class SourceTraceabilityMixin:
    """Mixin tracking ETL ingestion origin for auditing and provenance."""
    @declared_attr
    def etl_run_id(cls):
        return Column(String(64), nullable=True, index=True)

    @declared_attr
    def ingested_at(cls):
        return Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
