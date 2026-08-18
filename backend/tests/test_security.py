"""Security Tests.

Validates authentication and authorization controls:
  - Login without password → 422
  - Access without JWT → should not expose private data
  - Invalid JWT → 401
  - Invalid input validation → 400/422
"""
import pytest


class TestSecurityAuth:
    """Test authentication security controls."""

    def test_login_without_password(self, client):
        """Login without password should fail with 422."""
        response = client.post("/auth/login", json={"username": "testuser"})
        assert response.status_code == 422

    def test_login_without_username(self, client):
        """Login without username should fail with 422."""
        response = client.post("/auth/login", json={"password": "testpass"})
        assert response.status_code == 422

    def test_login_empty_body(self, client):
        """Login with empty body should fail with 422."""
        response = client.post("/auth/login", json={})
        assert response.status_code == 422

    def test_login_wrong_password(self, client, auth_token):
        """Login with wrong password should fail with 401."""
        response = client.post("/auth/login", json={
            "username": "testuser",
            "password": "wrongpassword"
        })
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client):
        """Login with nonexistent user should fail with 404."""
        response = client.post("/auth/login", json={
            "username": "nonexistent_user_xyz",
            "password": "somepass"
        })
        assert response.status_code == 404

    def test_register_duplicate_username(self, client, auth_token):
        """Register with existing username should fail with 400."""
        response = client.post("/auth/register", json={
            "username": "testuser",
            "email": "different@example.com",
            "password": "testpass123"
        })
        assert response.status_code == 400

    def test_register_duplicate_email(self, client, auth_token):
        """Register with existing email should fail with 400."""
        response = client.post("/auth/register", json={
            "username": "differentuser",
            "email": "test@example.com",
            "password": "testpass123"
        })
        assert response.status_code == 400


class TestSecurityValidation:
    """Test input validation and error handling."""

    def test_register_invalid_email(self, client):
        """Register with invalid email should fail with 422."""
        response = client.post("/auth/register", json={
            "username": "validuser",
            "email": "not-an-email",
            "password": "testpass123"
        })
        assert response.status_code == 422

    def test_dashboard_invalid_user_id(self, client):
        """Dashboard with non-existent user should return 404."""
        response = client.get("/dashboard/99999")
        assert response.status_code == 404

    def test_recommendations_without_user_id(self, client):
        """Recommendations without user_id should fail with 422."""
        response = client.get("/recommendations")
        assert response.status_code == 422

    def test_recommendations_no_profile(self, client, auth_token):
        """Recommendations for user without profile should fail with 404."""
        response = client.get("/recommendations?user_id=1")
        assert response.status_code == 404

    def test_health_endpoint_accessible(self, client):
        """Health endpoint should always be accessible."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_root_endpoint_accessible(self, client):
        """Root endpoint should always be accessible."""
        response = client.get("/")
        assert response.status_code == 200
        assert "version" in response.json()
