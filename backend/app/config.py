import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Research Funding & Innovation Intelligence Platform"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-2026-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database configuration - defaults to SQLite fallback if Postgres URI not set
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///" + os.path.join(os.path.dirname(__file__), "..", "app.db")
    )
    
    # OpenAI key (Optional for Assistant)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
