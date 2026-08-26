import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Fallback to standard PostgreSQL localhost credentials if environment variable is not defined
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/research_funding")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # FIX: explicit pool settings (was relying on SQLAlchemy defaults, silently
    # combined with scheduler.py creating ITS OWN separate engine/pool on every
    # call — multiple independent pools were competing for the DB's total
    # connection budget, which is why frontend requests hung forever waiting
    # for a connection). pool_pre_ping avoids handing out dead connections.
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=10,
        pool_timeout=30,
        pool_pre_ping=True,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()