from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Research Funding & Innovation Intelligence Platform"
    
    POSTGRES_USER: str = "rfi_user"
    POSTGRES_PASSWORD: str = "rfi_password"
    POSTGRES_DB: str = "rfi_db"
    DATABASE_URL: str = "postgresql+asyncpg://rfi_user:rfi_password@localhost:5432/rfi_db"
    
    MONGO_USER: str = "mongo_admin"
    MONGO_PASSWORD: str = "mongo_password"
    MONGODB_URL: str = "mongodb://mongo_admin:mongo_password@localhost:27017/"
    
    SECRET_KEY: str = "supersecretkey"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"

settings = Settings()
