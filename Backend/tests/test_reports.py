import pytest
from fastapi.testclient import TestClient
from main import app
from database.db import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.user import User
from models.profile import ResearchProfile
import json

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="module")
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    user = User(email="test@report.com", full_name="Report Tester", hashed_password="hashed")
    db.add(user)
    db.commit()
    db.refresh(user)
    
    profile = ResearchProfile(user_id=user.id, bio="Test", research_domains_json=json.dumps(["AI"]))
    db.add(profile)
    db.commit()
    
    yield db
    
    db.close()
    Base.metadata.drop_all(bind=engine)

from auth.auth import get_current_user

def override_get_current_user():
    db = TestingSessionLocal()
    return db.query(User).filter(User.email == "test@report.com").first()

app.dependency_overrides[get_current_user] = override_get_current_user

def test_funding_report_pdf(setup_database):
    response = client.get("/api/v1/reports/funding?format=pdf")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"

def test_funding_report_excel(setup_database):
    response = client.get("/api/v1/reports/funding?format=excel")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

def test_research_trends_report(setup_database):
    response = client.get("/api/v1/reports/research-trends?format=pdf")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
