"""
Application configuration.

Every value comes from environment variables (loaded from .env), never from
hardcoded literals. This is what lets the same code run on your laptop, in a
container, and in production without editing source.
"""

import os
from dotenv import load_dotenv

load_dotenv()   # reads .env from the project root into os.environ


class Settings:
    # --- databases -------------------------------------------------------
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@localhost:5432/rfiip",
    )
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB: str = os.getenv("MONGO_DB", "rfiip_raw")

    # --- auth ------------------------------------------------------------
    # SECRET_KEY signs your JWTs. If it leaks, anyone can forge a token
    # claiming to be an admin. Never commit the real value.
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-only-change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    )

    # --- external APIs ---------------------------------------------------
    OPENALEX_MAILTO: str = os.getenv("OPENALEX_MAILTO", "you@example.com")
    GRANTS_API: str = "https://api.grants.gov/v1/api/search2"

    # --- app -------------------------------------------------------------
    PROJECT_NAME: str = "Research Funding & Innovation Intelligence Platform"
    API_V1: str = "/api/v1"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]


settings = Settings()
