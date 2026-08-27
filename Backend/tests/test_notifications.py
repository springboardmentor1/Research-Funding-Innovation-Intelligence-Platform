import pytest
from fastapi.testclient import TestClient
from main import app
from database.db import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.user import User
from models.notification import Notification

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
    
    user = User(email="test@notif.com", full_name="Test", hashed_password="hashed")
    db.add(user)
    db.commit()
    
    notif = Notification(user_id=user.id, title="Test Notif", message="Hello", type="system")
    db.add(notif)
    db.commit()
    
    yield db
    
    db.close()
    Base.metadata.drop_all(bind=engine)

from auth.auth import get_current_user

def override_get_current_user():
    db = TestingSessionLocal()
    return db.query(User).filter(User.email == "test@notif.com").first()

app.dependency_overrides[get_current_user] = override_get_current_user

def test_get_notifications(setup_database):
    response = client.get("/api/v1/notifications")
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_mark_as_read(setup_database):
    response = client.post("/api/v1/notifications/1/read")
    assert response.status_code == 200
    assert response.json()["is_read"] == True

def test_update_preferences(setup_database):
    response = client.put("/api/v1/notifications/preferences", json={"preferences": {"email_alerts": True}})
    assert response.status_code == 200
    assert response.json()["preferences"]["email_alerts"] == True
