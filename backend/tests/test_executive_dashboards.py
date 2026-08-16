import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import get_db, Base, engine
from app.models.user import User
from app.utils.security import get_password_hash, create_access_token

client = TestClient(app)

@pytest.fixture
def auth_tokens():
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    roles = ["Administrator", "Innovation Manager", "Researcher", "Startup Founder"]
    tokens = {}
    for role in roles:
        email = f"pytest.{role.lower().replace(' ', '')}@example.com"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                full_name=f"Pytest {role}",
                email=email,
                hashed_password=get_password_hash("password123"),
                role=role
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        tokens[role] = create_access_token(subject=user.id)
    return tokens

def test_admin_dashboard_access(auth_tokens):
    headers_admin = {"Authorization": f"Bearer {auth_tokens['Administrator']}"}
    res = client.get("/executive/admin", headers=headers_admin)
    assert res.status_code == 200
    assert "system_health" in res.json()

def test_rbac_restriction(auth_tokens):
    headers_researcher = {"Authorization": f"Bearer {auth_tokens['Researcher']}"}
    res = client.get("/executive/admin", headers=headers_researcher)
    assert res.status_code == 403

def test_manager_dashboard_access(auth_tokens):
    headers_manager = {"Authorization": f"Bearer {auth_tokens['Innovation Manager']}"}
    res = client.get("/executive/manager", headers=headers_manager)
    assert res.status_code == 200
    assert "tech_transfer_pipeline" in res.json()

def test_researcher_dashboard_access(auth_tokens):
    headers_researcher = {"Authorization": f"Bearer {auth_tokens['Researcher']}"}
    res = client.get("/executive/researcher", headers=headers_researcher)
    assert res.status_code == 200
    assert "bibliometrics" in res.json()

def test_startup_dashboard_access(auth_tokens):
    headers_startup = {"Authorization": f"Bearer {auth_tokens['Startup Founder']}"}
    res = client.get("/executive/startup", headers=headers_startup)
    assert res.status_code == 200
    assert "startup_standing" in res.json()
