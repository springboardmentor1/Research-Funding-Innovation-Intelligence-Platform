from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from pymongo import MongoClient
from pymongo.database import Database
from typing import Generator
from app.core.config import get_settings

settings = get_settings()

# ── PostgreSQL ────────────────────────────────────────────────────────────────
# NOTE: Using sync psycopg2. If traffic grows, migrate to asyncpg + async session.
engine = create_engine(
    settings.postgres_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── MongoDB ───────────────────────────────────────────────────────────────────
_mongo_client: MongoClient | None = None


def get_mongo_client() -> MongoClient:
    global _mongo_client
    if _mongo_client is None:
        _mongo_client = MongoClient(settings.mongo_url, serverSelectionTimeoutMS=5000)
    return _mongo_client


def get_mongo_db() -> Database:
    client = get_mongo_client()
    return client[settings.mongo_db]