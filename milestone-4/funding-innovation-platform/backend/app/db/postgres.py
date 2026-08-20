"""
PostgreSQL engine and session factory (primary relational database).

Uses SQLAlchemy 2.0 style sync engine + sessionmaker. A sync engine is
used deliberately for Milestone 1 to keep Alembic migrations and the
ORM layer simple; the API layer remains async-friendly via FastAPI's
threadpool execution of sync dependencies.
"""
import logging
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

logger = logging.getLogger("app.db.postgres")

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    future=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session and guarantees closure."""
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
