import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import get_db, Base, engine
from app.models.user import User

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield

def test_user_registration_and_login():
    email = "test.pytest.user@example.com"
    password = "securepassword123"
    
    # 1. Register User
    reg_payload = {
        "full_name": "Pytest User",
        "email": email,
        "password": password,
        "role": "Researcher"
    }
    res_reg = client.post("/auth/register", json=reg_payload)
    assert res_reg.status_code in [201, 400]  # 201 Created or 400 if already exists

    # 2. Login User
    login_payload = {
        "email": email,
        "password": password
    }
    res_login = client.post("/auth/login-json", json=login_payload)
    assert res_login.status_code == 200
    token_data = res_login.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 3. Access Protected /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["email"] == email
