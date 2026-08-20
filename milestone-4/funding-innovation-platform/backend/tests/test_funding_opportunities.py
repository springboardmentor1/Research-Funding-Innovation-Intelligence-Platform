def _create_opportunity(client, headers, **overrides):
    payload = {
        "title": "AI Research Grant 2026",
        "description": "A grant supporting cutting-edge AI research projects.",
        "funding_source_type": "government_grant",
        "amount_min": 10000,
        "amount_max": 50000,
        "research_domains": ["AI"],
        "technology_areas": ["Deep Learning"],
        "organization_name": "National Science Fund",
        "status": "published",
    }
    payload.update(overrides)
    return client.post("/api/v1/funding-opportunities", json=payload, headers=headers)


def test_admin_can_create_opportunity(client, admin_auth):
    resp = _create_opportunity(client, admin_auth["headers"])
    assert resp.status_code == 201
    assert resp.json()["status"] == "published"


def test_researcher_cannot_create_opportunity(client, researcher_auth):
    resp = _create_opportunity(client, researcher_auth["headers"])
    assert resp.status_code == 403


def test_search_and_pagination(client, admin_auth, researcher_auth):
    for i in range(3):
        _create_opportunity(client, admin_auth["headers"], title=f"Grant {i}")
    resp = client.get("/api/v1/funding-opportunities?page=1&page_size=2", headers=researcher_auth["headers"])
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] >= 3
    assert len(body["items"]) == 2


def test_application_workflow(client, admin_auth, researcher_auth):
    create_resp = _create_opportunity(client, admin_auth["headers"])
    opportunity_id = create_resp.json()["id"]

    apply_resp = client.post(
        f"/api/v1/applications/opportunities/{opportunity_id}",
        json={"notes": "Excited to apply"},
        headers=researcher_auth["headers"],
    )
    assert apply_resp.status_code == 201

    duplicate_resp = client.post(
        f"/api/v1/applications/opportunities/{opportunity_id}",
        json={"notes": "Again"},
        headers=researcher_auth["headers"],
    )
    assert duplicate_resp.status_code == 409


def test_bookmark_flow(client, admin_auth, researcher_auth):
    create_resp = _create_opportunity(client, admin_auth["headers"])
    opportunity_id = create_resp.json()["id"]

    bookmark_resp = client.post(
        f"/api/v1/bookmarks/{opportunity_id}", headers=researcher_auth["headers"]
    )
    assert bookmark_resp.status_code in (200, 201)

    list_resp = client.get("/api/v1/bookmarks/me", headers=researcher_auth["headers"])
    assert list_resp.status_code == 200
    assert list_resp.json()["total"] >= 1


def test_analytics_overview_admin_only(client, admin_auth, researcher_auth):
    denied = client.get("/api/v1/admin/analytics/overview", headers=researcher_auth["headers"])
    assert denied.status_code == 403

    allowed = client.get("/api/v1/admin/analytics/overview", headers=admin_auth["headers"])
    assert allowed.status_code == 200
    assert "total_users" in allowed.json()
