import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Import and patch the database module BEFORE anything else
import database.db as db_module
from database.db import Base

# Import all models to register them with Base.metadata
from database.models import (  # noqa: F401
    User, LoginHistory, Profile, ResearchPaper,
    FundingOpportunity, Patent, Recommendation, PublicationTrend,
)


@pytest.fixture(scope="function")
def test_db():
    """Create a fresh in-memory test database for each test.

    Uses StaticPool so the same in-memory DB is shared across threads
    (required because TestClient runs handlers in a threadpool).
    """
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=test_engine
    )

    # Monkey-patch the db module so everything uses the test engine
    original_engine = db_module.engine
    original_session = db_module.SessionLocal

    db_module.engine = test_engine
    db_module.SessionLocal = TestingSessionLocal

    # Create all tables on the test engine
    Base.metadata.create_all(bind=test_engine)

    yield TestingSessionLocal

    # Restore originals
    db_module.engine = original_engine
    db_module.SessionLocal = original_session
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()


@pytest.fixture
def client(test_db):
    """Create a test client that uses the patched test database."""
    from main import app

    # Override FastAPI dependency
    def override_get_db():
        db = test_db()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[db_module.get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def auth_token(client):
    """Create a test user and return auth token."""
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123"
    }

    # Register user
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 201

    # Login
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    return response.json()["access_token"]



