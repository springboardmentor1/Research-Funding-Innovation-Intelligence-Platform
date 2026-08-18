import pytest


def test_register_user(client):
    """Test user registration."""
    response = client.post(
        "/auth/register",
        json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "newuser@example.com"


def test_register_duplicate_username(client):
    """Test registration with duplicate username."""
    user_data = {
        "username": "testuser",
        "email": "test1@example.com",
        "password": "password123"
    }
    
    # First registration
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 201
    
    # Duplicate registration
    user_data["email"] = "test2@example.com"
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_user(client, auth_token):
    """Test user login."""
    assert auth_token is not None
    assert isinstance(auth_token, str)


def test_login_invalid_credentials(client):
    """Test login with invalid credentials."""
    # Register a user first
    client.post(
        "/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        }
    )
    
    # Try to login with wrong password
    response = client.post(
        "/auth/login",
        json={"username": "testuser", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "incorrect" in response.json()["detail"]


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
