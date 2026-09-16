"""FlowGuard backend configuration loaded from environment variables."""

import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # API Metadata
    API_TITLE: str = "Kenya Pipeline Company (KPC) FlowGuard API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = (
        "High-performance operational REST service for KPC depot monitoring, "
        "order tracking, congestion risk detection, and autonomous control verification."
    )
    API_PREFIX: str = "/api"

    # Server & CORS
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    # Database settings
    DATABASE_URL: str = "postgresql+psycopg2://flowguard:flowguard@localhost:5432/flowguard"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_ECHO: bool = False

    # Pipeline directories (relative to repository root or absolute)
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    SOURCE_DATA_DIR: str = "synthetic_flowguard_data"
    QUARANTINE_DIR: str = "etl/quarantine"
    REPORTS_DIR: str = "data_quality/reports"

    # Environment
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def source_data_path(self) -> Path:
        p = Path(self.SOURCE_DATA_DIR)
        return p if p.is_absolute() else self.BASE_DIR / p

    @property
    def quarantine_path(self) -> Path:
        p = Path(self.QUARANTINE_DIR)
        return p if p.is_absolute() else self.BASE_DIR / p

    @property
    def reports_path(self) -> Path:
        p = Path(self.REPORTS_DIR)
        return p if p.is_absolute() else self.BASE_DIR / p


settings = Settings()
