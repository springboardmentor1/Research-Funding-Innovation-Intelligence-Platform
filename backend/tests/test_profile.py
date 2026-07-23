import pytest


def test_create_profile(client, auth_token):
    """Test creating a research profile."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Get user ID from auth response
    response = client.post(
        "/auth/login",
        json={"username": "testuser", "password": "testpass123"}
    )
    user_id = response.json()["user"]["id"]
    
    profile_data = {
        "user_id": user_id,
        "name": "Dr. Test User",
        "university": "MIT",
        "department": "Computer Science",
        "research_interests": "AI, Machine Learning",
        "keywords": "ai,ml,deep learning",
        "research_area": "Artificial Intelligence"
    }
    
    response = client.post("/profile/", json=profile_data, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Dr. Test User"
    assert data["university"] == "MIT"


def test_get_profile(client, auth_token):
    """Test retrieving a profile."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # First get user ID
    response = client.post(
        "/auth/login",
        json={"username": "testuser", "password": "testpass123"}
    )
    user_id = response.json()["user"]["id"]
    
    # Create profile
    profile_data = {
        "user_id": user_id,
        "name": "Dr. Test User",
        "university": "MIT",
        "department": "Computer Science",
        "research_interests": "AI",
        "keywords": "ai,ml",
        "research_area": "AI"
    }
    client.post("/profile/", json=profile_data, headers=headers)
    
    # Get profile
    response = client.get(f"/profile/{user_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Dr. Test User"


def test_update_profile(client, auth_token):
    """Test updating a profile."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Get user ID
    response = client.post(
        "/auth/login",
        json={"username": "testuser", "password": "testpass123"}
    )
    user_id = response.json()["user"]["id"]
    
    # Create profile
    profile_data = {
        "user_id": user_id,
        "name": "Dr. Original",
        "university": "MIT",
        "department": "CS",
        "research_interests": "AI",
        "keywords": "ai",
        "research_area": "AI"
    }
    client.post("/profile/", json=profile_data, headers=headers)
    
    # Update profile
    update_data = {"name": "Dr. Updated"}
    response = client.put(f"/profile/{user_id}", json=update_data, headers=headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Dr. Updated"
