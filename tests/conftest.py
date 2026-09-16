"""Pytest test configuration and database fixtures."""

import sys
from pathlib import Path
import pytest
from sqlalchemy.orm import Session

# Add repo root to sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.app.db.session import engine, SessionLocal
from backend.app.config import settings


@pytest.fixture(scope="session")
def db_engine():
    """Session-scoped database engine."""
    return engine


@pytest.fixture(scope="function")
def db_session():
    """Function-scoped database session with rollback/cleanup."""
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()
