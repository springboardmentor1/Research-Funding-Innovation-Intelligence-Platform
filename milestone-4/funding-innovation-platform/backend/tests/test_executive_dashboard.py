def test_executive_dashboard_summary_shape(client, admin_auth):
    resp = client.get("/api/v1/executive-dashboard/summary", headers=admin_auth["headers"])
    assert resp.status_code == 200
    body = resp.json()
    expected_keys = {
        "total_users",
        "total_opportunities",
        "total_applications",
        "total_bookmarks",
        "publication_trend",
        "citation_analytics",
        "patent_trend",
        "total_patents_tracked",
        "technology_maturity_counts",
        "innovation_leaderboard_top5",
        "commercialization_by_type",
    }
    assert expected_keys.issubset(body.keys())


def test_executive_dashboard_counts_users(client, admin_auth, researcher_auth, startup_founder_auth):
    resp = client.get("/api/v1/executive-dashboard/summary", headers=admin_auth["headers"])
    assert resp.status_code == 200
    # admin + researcher + startup_founder fixtures each register a user
    assert resp.json()["total_users"] >= 3


def test_executive_dashboard_denied_for_researcher(client, researcher_auth):
    resp = client.get("/api/v1/executive-dashboard/summary", headers=researcher_auth["headers"])
    assert resp.status_code == 403


def test_executive_dashboard_denied_for_startup_founder(client, startup_founder_auth):
    resp = client.get("/api/v1/executive-dashboard/summary", headers=startup_founder_auth["headers"])
    assert resp.status_code == 403


def test_executive_dashboard_allowed_for_innovation_manager(client, innovation_manager_auth):
    resp = client.get("/api/v1/executive-dashboard/summary", headers=innovation_manager_auth["headers"])
    assert resp.status_code == 200
