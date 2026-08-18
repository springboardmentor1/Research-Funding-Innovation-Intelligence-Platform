"""
Centralized application configuration.

All environment-dependent values are loaded here via pydantic-settings so
that the rest of the codebase never touches `os.environ` directly.
"""
from typing import List, Union

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ---- Application ----
    APP_NAME: str = "Research Funding & Innovation Intelligence Platform"
    APP_ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = True

    BACKEND_CORS_ORIGINS: Union[List[str], str] = ["http://localhost:5173"]

    # ---- Security ----
    SECRET_KEY: str = "change-this-super-secret-key-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080

    # ---- PostgreSQL ----
    POSTGRES_USER: str = "innovation_user"
    POSTGRES_PASSWORD: str = "innovation_pass"
    POSTGRES_DB: str = "innovation_platform"
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str = ""

    # ---- MongoDB ----
    MONGO_HOST: str = "mongo"
    MONGO_PORT: int = 27017
    MONGO_DB: str = "innovation_platform_logs"
    MONGO_URI: str = "mongodb://mongo:27017"

    # ---- OAuth2 (Google) ----
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/oauth/google/callback"

    # ---- Logging ----
    LOG_LEVEL: str = "INFO"

    # ---- File storage (Milestone 2) ----
    UPLOAD_ROOT: str = "/app/uploads"
    UPLOAD_PUBLIC_PREFIX: str = "/uploads"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [origin.strip() for origin in v.split(",")]
        if isinstance(v, str):
            import json

            return json.loads(v)
        return v

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_url(cls, v: str, info) -> str:
        if v:
            return v
        data = info.data
        return (
            f"postgresql+psycopg2://{data.get('POSTGRES_USER')}:"
            f"{data.get('POSTGRES_PASSWORD')}@{data.get('POSTGRES_HOST')}:"
            f"{data.get('POSTGRES_PORT')}/{data.get('POSTGRES_DB')}"
        )


settings = Settings()
