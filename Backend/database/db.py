import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables
load_dotenv()

# Load DATABASE_URL from environment or fallback to sqlite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./innovation_platform.db")

is_sqlite = DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI Dependency to provide a database session to endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
