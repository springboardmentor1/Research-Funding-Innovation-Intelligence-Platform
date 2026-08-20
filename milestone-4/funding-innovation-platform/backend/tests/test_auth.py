def test_register_and_login(client):
    payload = {
        "email": "newuser@test.com",
        "username": "newuser1",
        "full_name": "New User",
        "password": "Password123!x",
        "role": "researcher",
    }
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 201
    body = resp.json()
    assert body["user"]["email"] == "newuser@test.com"
    assert body["user"]["role"] == "researcher"
    assert "access_token" in body and "refresh_token" in body

    login_resp = client.post(
        "/api/v1/auth/login", json={"email": "newuser@test.com", "password": "Password123!x"}
    )
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()


def test_register_rejects_weak_password(client):
    payload = {
        "email": "weak@test.com",
        "username": "weakpw",
        "full_name": "Weak Pw",
        "password": "weak",
        "role": "researcher",
    }
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 422


def test_login_rejects_wrong_password(client, researcher_auth):
    email = researcher_auth["user"]["email"]
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": "WrongPass123!"})
    assert resp.status_code == 401


def test_unauthenticated_request_rejected(client):
    resp = client.get("/api/v1/research-profile/me")
    assert resp.status_code == 401


def test_refresh_token_flow(client):
    payload = {
        "email": "refresher@test.com",
        "username": "refresher",
        "full_name": "Refresh User",
        "password": "Password123!x",
        "role": "researcher",
    }
    reg = client.post("/api/v1/auth/register", json=payload).json()
    resp = client.post("/api/v1/auth/refresh", json={"refresh_token": reg["refresh_token"]})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_rbac_blocks_non_admin_from_user_management(client, researcher_auth):
    resp = client.get("/api/v1/users", headers=researcher_auth["headers"])
    assert resp.status_code == 403


def test_rbac_allows_admin_user_management(client, admin_auth):
    resp = client.get("/api/v1/users", headers=admin_auth["headers"])
    assert resp.status_code == 200
