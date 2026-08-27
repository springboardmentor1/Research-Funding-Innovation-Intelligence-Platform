import pytest
from fastapi.testclient import TestClient
from main import app
from database.db import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.user import User

# Setup in-memory SQLite database for testing
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
    
    # Create test users with different roles
    admin = User(email="admin@test.com", full_name="Admin", hashed_password="hashed", role="Administrator")
    researcher = User(email="res@test.com", full_name="Researcher", hashed_password="hashed", role="Researcher")
    startup = User(email="startup@test.com", full_name="Startup", hashed_password="hashed", role="Startup Founder")
    manager = User(email="mgr@test.com", full_name="Manager", hashed_password="hashed", role="Innovation Manager")
    
    db.add_all([admin, researcher, startup, manager])
    db.commit()
    
    yield db
    
    db.close()
    Base.metadata.drop_all(bind=engine)

def get_token(role: str):
    # This is a mocked helper. We'll bypass auth for simplicity in these tests
    # or login properly. For this test, we'll hit the login endpoint.
    if role == "Admin":
        email = "admin@test.com"
    elif role == "Researcher":
        email = "res@test.com"
    elif role == "Startup Founder":
        email = "startup@test.com"
    else:
        email = "mgr@test.com"
        
    response = client.post("/api/auth/login", json={"email": email, "password": "password"})
    return response.json().get("access_token")

# We'll mock get_current_user instead to easily switch users
from auth.auth import get_current_user

def override_get_current_user_researcher():
    db = TestingSessionLocal()
    return db.query(User).filter(User.role == "Researcher").first()

def override_get_current_user_startup():
    db = TestingSessionLocal()
    return db.query(User).filter(User.role == "Startup Founder").first()

def test_researcher_dashboard_access(setup_database):
    app.dependency_overrides[get_current_user] = override_get_current_user_researcher
    response = client.get("/api/v1/dashboards/researcher")
    assert response.status_code in [200, 404] # 404 if profile not found, but not 403

def test_startup_cannot_access_researcher(setup_database):
    app.dependency_overrides[get_current_user] = override_get_current_user_startup
    response = client.get("/api/v1/dashboards/researcher")
    assert response.status_code == 403

def test_startup_dashboard_access(setup_database):
    app.dependency_overrides[get_current_user] = override_get_current_user_startup
    response = client.get("/api/v1/dashboards/startup")
    assert response.status_code in [200, 404]
