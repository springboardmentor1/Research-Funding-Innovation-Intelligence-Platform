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
def auth_header():
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    email = "pytest.reporter@example.com"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            full_name="Pytest Reporter",
            email=email,
            hashed_password=get_password_hash("password123"),
            role="Administrator"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    token = create_access_token(subject=user.id)
    return {"Authorization": f"Bearer {token}"}

def test_report_types_endpoint(auth_header):
    res = client.get("/reports/types", headers=auth_header)
    assert res.status_code == 200
    assert "report_types" in res.json()

def test_report_generation_and_download(auth_header):
    payload = {
        "report_type": "patent_landscape",
        "format": "csv",
        "domain": "Robotics & AI"
    }
    res_gen = client.post("/reports/generate", json=payload, headers=auth_header)
    assert res_gen.status_code == 200
    data = res_gen.json()
    assert "report_id" in data
    
    report_id = data["report_id"]
    res_dl = client.get(f"/reports/download/{report_id}", headers=auth_header)
    assert res_dl.status_code == 200
    assert len(res_dl.content) > 0
