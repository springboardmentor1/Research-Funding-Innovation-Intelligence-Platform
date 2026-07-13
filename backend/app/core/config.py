"""
Configuration module for the Research Funding & Innovation Intelligence Platform.

Provides settings management using Pydantic Settings with environment variable support.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Application configuration settings.
    Loads values from environment variables or .env file.
    """
    APP_NAME: str = "FastAPI App"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    DATABASE_URL: str

    MONGODB_URL: str
    MONGODB_DB_NAME: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Data Collector Settings
    OPENALEX_MAILTO: Optional[str] = "admin@example.com"
    ORCID_CLIENT_ID: Optional[str] = None
    ORCID_CLIENT_SECRET: Optional[str] = None
    ORCID_SANDBOX: bool = True
    PATENTSVIEW_API_KEY: Optional[str] = None
    EXPORT_DIR: str = "data_exports"

    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
