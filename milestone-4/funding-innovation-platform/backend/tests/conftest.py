"""
Shared pytest fixtures.

Runs against a **real PostgreSQL** test database (not SQLite) because
several models use Postgres-native ARRAY columns and enum types created
by Alembic migrations (`create_type=False` — see app/models/*). The test
database URL is taken from TEST_DATABASE_URL (falls back to a sensible
local default matching docker-compose's `postgres` service / .env).

Schema is created once per test session by running Alembic migrations
against the test database. Each test function runs inside a savepoint
that is rolled back afterward, so tests never see each other's data and
the schema only needs to be built once.
"""
import os
import uuid

os.environ.setdefault(
    "DATABASE_URL",
    os.environ.get(
        "TEST_DATABASE_URL",
        "postgresql+psycopg2://innovation_user:innovation_pass@localhost:5432/innovation_platform_test",
    ),
)
# No MongoDB server is available in the CI/sandbox test environment. Activity
# logging (app/db/mongo.py::log_activity) already swallows connection
# failures by design ("audit logging must not block or break the primary
# request flow"), so tests exercise that exact fallback path — but with a
# short server-selection timeout so a genuinely absent Mongo fails fast
# instead of hanging on the driver's 30s default.
os.environ.setdefault(
    "MONGO_URI", "mongodb://localhost:27017/?serverSelectionTimeoutMS=1000&connectTimeoutMS=1000"
)
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only")

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.db.postgres import get_db
from app.main import app

BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEST_DATABASE_URL = os.environ["DATABASE_URL"]

engine = create_engine(TEST_DATABASE_URL, future=True)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


@pytest.fixture(scope="session", autouse=True)
def _apply_migrations():
    """Run Alembic migrations against the test database once per session."""
    alembic_cfg = Config(os.path.join(BACKEND_ROOT, "alembic.ini"))
    alembic_cfg.set_main_option("script_location", os.path.join(BACKEND_ROOT, "alembic"))
    alembic_cfg.set_main_option("sqlalchemy.url", TEST_DATABASE_URL)
    command.upgrade(alembic_cfg, "head")
    yield
    # Leave the schema in place — cheap to reuse across local test runs;
    # CI spins up a fresh database container per run anyway.


@pytest.fixture(autouse=True)
def _clean_tables():
    """Truncate every app table before each test for full isolation,
    without paying the cost of re-running migrations per test."""
    with engine.begin() as conn:
        tables = conn.execute(
            text(
                "SELECT tablename FROM pg_tables WHERE schemaname='public' "
                "AND tablename NOT IN ('alembic_version')"
            )
        ).scalars().all()
        if tables:
            conn.execute(text(f"TRUNCATE TABLE {', '.join(tables)} RESTART IDENTITY CASCADE"))
    yield


@pytest.fixture()
def db_session():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db_session):
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def _register(client: TestClient, role: str, email: str | None = None) -> dict:
    suffix = uuid.uuid4().hex[:8]
    email = email or f"{role}-{suffix}@test.com"
    payload = {
        "email": email,
        "username": f"{role}_{suffix}",
        "full_name": f"{role.title()} {suffix}",
        "password": "Password123!x",
        "role": role,
    }
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


@pytest.fixture()
def researcher_auth(client):
    data = _register(client, "researcher")
    return {"token": data["access_token"], "user": data["user"], "headers": {"Authorization": f"Bearer {data['access_token']}"}}


@pytest.fixture()
def startup_founder_auth(client):
    data = _register(client, "startup_founder")
    return {"token": data["access_token"], "user": data["user"], "headers": {"Authorization": f"Bearer {data['access_token']}"}}


@pytest.fixture()
def innovation_manager_auth(client):
    data = _register(client, "innovation_manager")
    return {"token": data["access_token"], "user": data["user"], "headers": {"Authorization": f"Bearer {data['access_token']}"}}


@pytest.fixture()
def admin_auth(client):
    data = _register(client, "administrator")
    return {"token": data["access_token"], "user": data["user"], "headers": {"Authorization": f"Bearer {data['access_token']}"}}
