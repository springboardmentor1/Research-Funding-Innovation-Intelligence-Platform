"""
Shared test fixtures.

THE DATABASE DECISION
---------------------
Tests run against a SEPARATE Postgres database, `rfiip_test`, created once and
wiped between tests. Two options were considered:

  SQLite in-memory  - fast and needs no server, BUT the models use Postgres
                      ARRAY columns (research_domains, applicants, cpc_codes)
                      which SQLite cannot compile. Faking them would mean
                      editing production models purely for tests - a change
                      with real risk, to make the test environment LESS like
                      production. Rejected.

  Postgres test DB  - uses the same engine as production, so array queries,
                      constraints, and types behave identically. Needs a
                      one-time `CREATE DATABASE rfiip_test`. Chosen.

Isolation comes from recreating the schema per test, not from a separate
engine per test. get_db is overridden so the app talks to the test database.
"""

import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# A dedicated test database on the same local Postgres. Override with the
# TEST_DATABASE_URL env var if your credentials differ.
TEST_DB_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://postgres:postgresql@localhost:5432/rfiip_test",
)
os.environ["DATABASE_URL"] = TEST_DB_URL
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production")

from app.db import Base, get_db          # noqa: E402
from app.main import app                 # noqa: E402

engine = create_engine(TEST_DB_URL)
TestSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)


@pytest.fixture(autouse=True)
def _fresh_schema():
    """Recreate every table before each test, drop after. Guarantees each
    test starts from an identical empty schema."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    def _get_test_db():
        db = TestSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _get_test_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    """Register + log in a researcher, return auth headers."""
    client.post("/api/v1/auth/register", json={
        "email": "test@example.com", "password": "testpass123",
        "full_name": "Test User", "role": "researcher",
    })
    r = client.post("/api/v1/auth/token", data={
        "username": "test@example.com", "password": "testpass123",
    })
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
