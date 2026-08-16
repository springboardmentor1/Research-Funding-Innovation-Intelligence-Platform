"""
API-level tests for admin ingestion endpoints.
Uses FastAPI TestClient + in-memory SQLite.
Authentication dependencies are overridden directly to avoid PostgreSQL.
The get_db dependency is properly overridden as a generator that yields from the test SQLite engine.
"""
import types
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.connection import Base, get_db
from app.services.auth_service import get_current_user, RoleChecker
# Import ALL models so Base.metadata knows about every table
from app.models.user import User  # noqa: F401
from app.models.profile import ResearchProfile  # noqa: F401
from app.models.publication import Publication  # noqa: F401
from app.models.patent import Patent  # noqa: F401
from app.models.report import Report  # noqa: F401
from app.models.ingestion_job import DataIngestionJob  # noqa: F401
from app.models.global_publication import GlobalPublication  # noqa: F401
from app.models.global_patent import GlobalPatent  # noqa: F401

SQLITE_URL = "sqlite:///:memory:"

# SimpleNamespace avoids SQLAlchemy instrumentation issues
mock_admin = types.SimpleNamespace(
    id="admin-uuid-001",
    full_name="Admin User",
    email="admin@test.com",
    role="Administrator",
)

mock_regular = types.SimpleNamespace(
    id="regular-uuid-001",
    full_name="Regular User",
    email="user@test.com",
    role="Researcher",
)

admin_role_checker = RoleChecker(["Administrator"])

# Build the test engine once at module level so all tests share the same DB.
# create_all is called AFTER all models are imported above, so every table exists.
_test_engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=_test_engine)
_TestSession = sessionmaker(autocommit=False, autoflush=False, bind=_test_engine)


def _override_get_db():
    """Generator override for get_db — yields a SQLite session."""
    db = _TestSession()
    try:
        yield db
    finally:
        db.close()


def _admin_dep():
    return mock_admin


def _regular_dep():
    return mock_regular


@pytest.fixture(scope="module")
def test_app():
    """
    Module-scoped fixture.
    APScheduler is mocked so it never starts (no PostgreSQL required).
    get_current_user and RoleChecker are overridden to return mock users.
    """
    mock_scheduler = MagicMock()
    mock_scheduler.start = MagicMock()
    mock_scheduler.shutdown = MagicMock()

    with patch("app.main.create_scheduler", return_value=mock_scheduler):
        from app.main import app

        app.dependency_overrides[get_db] = _override_get_db
        app.dependency_overrides[get_current_user] = _admin_dep
        app.dependency_overrides[admin_role_checker] = _admin_dep

        client = TestClient(app, raise_server_exceptions=False)
        yield client, app

        app.dependency_overrides.clear()


class TestAdminIngestionEndpoints:

    def test_trigger_publication_ingestion_as_admin(self, test_app, mocker):
        client, app = test_app
        app.dependency_overrides[get_current_user] = _admin_dep
        app.dependency_overrides[admin_role_checker] = _admin_dep
        mocker.patch("app.routes.admin_ingestion._run_pub_ingestion_bg")
        resp = client.post(
            "/admin/ingestion/publications",
            json={"query": "machine learning", "max_records": 10},
            headers={"Authorization": "Bearer fake_admin_token"},
        )
        assert resp.status_code == 202
        data = resp.json()
        assert "job_id" in data
        assert data["status"] == "pending"

    def test_trigger_patent_ingestion_as_admin(self, test_app, mocker):
        client, app = test_app
        app.dependency_overrides[get_current_user] = _admin_dep
        app.dependency_overrides[admin_role_checker] = _admin_dep
        mocker.patch("app.routes.admin_ingestion._run_patent_ingestion_bg")
        resp = client.post(
            "/admin/ingestion/patents",
            json={"query": "neural network", "max_records": 10},
            headers={"Authorization": "Bearer fake_admin_token"},
        )
        assert resp.status_code == 202

    def test_unauthorized_user_cannot_trigger_ingestion(self, test_app):
        client, app = test_app
        from fastapi import HTTPException

        def reject_non_admin():
            raise HTTPException(status_code=403, detail="Forbidden")

        app.dependency_overrides[admin_role_checker] = reject_non_admin
        app.dependency_overrides[get_current_user] = _regular_dep
        resp = client.post(
            "/admin/ingestion/publications",
            json={"query": "AI", "max_records": 10},
            headers={"Authorization": "Bearer fake_user_token"},
        )
        assert resp.status_code == 403

    def test_unauthenticated_request_rejected(self, test_app):
        client, app = test_app
        # Remove overrides so real OAuth2 kicks in — no token → 401
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(admin_role_checker, None)
        resp = client.post(
            "/admin/ingestion/publications",
            json={"query": "AI", "max_records": 10},
        )
        assert resp.status_code == 401

    def test_list_jobs_as_admin(self, test_app, mocker):
        client, app = test_app
        app.dependency_overrides[get_current_user] = _admin_dep
        app.dependency_overrides[admin_role_checker] = _admin_dep
        mocker.patch("app.routes.admin_ingestion._run_pub_ingestion_bg")
        client.post(
            "/admin/ingestion/publications",
            json={"query": "AI", "max_records": 10},
            headers={"Authorization": "Bearer fake_admin_token"},
        )
        resp = client.get(
            "/admin/ingestion/jobs",
            headers={"Authorization": "Bearer fake_admin_token"},
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_job_by_id(self, test_app, mocker):
        client, app = test_app
        app.dependency_overrides[get_current_user] = _admin_dep
        app.dependency_overrides[admin_role_checker] = _admin_dep
        mocker.patch("app.routes.admin_ingestion._run_pub_ingestion_bg")
        create_resp = client.post(
            "/admin/ingestion/publications",
            json={"query": "AI", "max_records": 10},
            headers={"Authorization": "Bearer fake_admin_token"},
        )
        assert create_resp.status_code == 202
        job_id = create_resp.json()["job_id"]
        resp = client.get(
            f"/admin/ingestion/jobs/{job_id}",
            headers={"Authorization": "Bearer fake_admin_token"},
        )
        assert resp.status_code == 200
        assert resp.json()["id"] == job_id

    def test_get_nonexistent_job_returns_404(self, test_app):
        client, app = test_app
        app.dependency_overrides[get_current_user] = _admin_dep
        app.dependency_overrides[admin_role_checker] = _admin_dep
        resp = client.get(
            "/admin/ingestion/jobs/nonexistent-id-xyz",
            headers={"Authorization": "Bearer fake_admin_token"},
        )
        assert resp.status_code == 404

    def test_max_records_validation(self, test_app):
        client, app = test_app
        app.dependency_overrides[get_current_user] = _admin_dep
        app.dependency_overrides[admin_role_checker] = _admin_dep
        resp = client.post(
            "/admin/ingestion/publications",
            json={"query": "AI", "max_records": 999_999},
            headers={"Authorization": "Bearer fake_admin_token"},
        )
        assert resp.status_code == 400
