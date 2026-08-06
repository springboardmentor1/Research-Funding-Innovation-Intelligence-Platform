from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "sqlite:///./rfip_dev.db"
    secret_key: str = "dev-secret-change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # comma-separated list of allowed frontend origins in production, e.g.
    # "https://rfip.vercel.app,https://rfip-staging.vercel.app"
    allowed_origins: str = "*"

    # Secondary database (MongoDB): used to cache OpenAlex research trend responses.
    mongo_url: str = "mongodb://localhost:27017"
    mongo_db_name: str = "rfip_cache"
    trend_cache_ttl_seconds: int = 21600  # 6 hours

    @property
    def cors_origins(self) -> list[str]:
        if self.allowed_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"

settings = Settings()
