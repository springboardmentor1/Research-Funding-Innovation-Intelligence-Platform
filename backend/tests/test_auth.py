"""
Tests for authentication, password hashing, and role-based access.

These are the highest-value tests in the suite: auth is security-critical, and
a regression here (say, a refactor that stops hashing passwords) would be
catastrophic and silent. A test makes it loud.
"""

from app.core.security import hash_password, verify_password, create_access_token, decode_access_token


# ------------------------------------------------------------------ unit: hashing
def test_password_is_hashed_not_plaintext():
    h = hash_password("secret123")
    assert h != "secret123"
    assert h.startswith("$argon2")


def test_same_password_hashes_differently():
    # per-call random salt => two different hashes for the same input
    assert hash_password("secret123") != hash_password("secret123")


def test_verify_correct_and_wrong():
    h = hash_password("secret123")
    assert verify_password("secret123", h) is True
    assert verify_password("wrongpass", h) is False


def test_verify_survives_malformed_hash():
    # a corrupt stored hash must read as "wrong password", not crash
    assert verify_password("anything", "not-a-real-hash") is False


# ------------------------------------------------------------------ unit: tokens
def test_token_roundtrip():
    token = create_access_token(user_id=42, role="researcher")
    payload = decode_access_token(token)
    assert payload["sub"] == "42"
    assert payload["role"] == "researcher"


def test_tampered_token_rejected():
    token = create_access_token(user_id=1, role="researcher")
    assert decode_access_token(token[:-4] + "aaaa") is None


def test_expired_token_rejected():
    token = create_access_token(user_id=1, role="researcher", expires_minutes=-1)
    assert decode_access_token(token) is None


# ------------------------------------------------------------------ integration: endpoints
def test_register_returns_201_without_password(client):
    r = client.post("/api/v1/auth/register", json={
        "email": "new@example.com", "password": "testpass123",
        "full_name": "New", "role": "researcher",
    })
    assert r.status_code == 201
    body = r.json()
    assert body["email"] == "new@example.com"
    assert "password" not in body
    assert "hashed_password" not in body


def test_duplicate_email_rejected(client):
    payload = {"email": "dup@example.com", "password": "testpass123", "role": "researcher"}
    assert client.post("/api/v1/auth/register", json=payload).status_code == 201
    assert client.post("/api/v1/auth/register", json=payload).status_code == 409


def test_login_returns_token(client):
    client.post("/api/v1/auth/register", json={
        "email": "log@example.com", "password": "testpass123", "role": "researcher",
    })
    r = client.post("/api/v1/auth/token", data={
        "username": "log@example.com", "password": "testpass123",
    })
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_wrong_password_401(client):
    client.post("/api/v1/auth/register", json={
        "email": "wp@example.com", "password": "testpass123", "role": "researcher",
    })
    r = client.post("/api/v1/auth/token", data={
        "username": "wp@example.com", "password": "WRONG",
    })
    assert r.status_code == 401


def test_me_requires_token(client):
    assert client.get("/api/v1/auth/me").status_code == 401


def test_me_returns_current_user(client, auth_headers):
    r = client.get("/api/v1/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["email"] == "test@example.com"


# ------------------------------------------------------------------ integration: RBAC
def test_researcher_denied_admin_endpoint(client, auth_headers):
    # auth_headers is a researcher; the admin route must return 403 (not 401)
    r = client.get("/api/v1/auth/admin/users", headers=auth_headers)
    assert r.status_code == 403


def test_admin_allowed_admin_endpoint(client):
    client.post("/api/v1/auth/register", json={
        "email": "admin@example.com", "password": "testpass123", "role": "admin",
    })
    tok = client.post("/api/v1/auth/token", data={
        "username": "admin@example.com", "password": "testpass123",
    }).json()["access_token"]
    r = client.get("/api/v1/auth/admin/users",
                   headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200
