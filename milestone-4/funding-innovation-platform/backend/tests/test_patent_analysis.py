def _create_profile_with_patent(client, headers, **patent_overrides):
    client.post(
        "/api/v1/research-profile/me",
        json={"research_domains": ["AI"], "keywords": [], "technology_areas": [], "organization": "Test Univ"},
        headers=headers,
    )
    payload = {
        "title": "Novel Neural Architecture",
        "assignee": "Test Univ",
        "filing_date": "2024-06-01",
        "classification": "G06N",
        "technology_domain": "AI",
        "citation_count": 8,
    }
    payload.update(patent_overrides)
    return client.post("/api/v1/research-profile/me/patents", json=payload, headers=headers)


def test_patent_search_and_trend(client, researcher_auth):
    resp = _create_profile_with_patent(client, researcher_auth["headers"])
    assert resp.status_code in (200, 201)

    search_resp = client.get("/api/v1/patent-analysis/search", headers=researcher_auth["headers"])
    assert search_resp.status_code == 200
    assert search_resp.json()["total"] >= 1

    trend_resp = client.get("/api/v1/patent-analysis/trend", headers=researcher_auth["headers"])
    assert trend_resp.status_code == 200
    assert any(point["year"] == 2024 for point in trend_resp.json())


def test_patent_competitors_and_innovation_map(client, researcher_auth):
    _create_profile_with_patent(client, researcher_auth["headers"])

    competitors_resp = client.get("/api/v1/patent-analysis/competitors", headers=researcher_auth["headers"])
    assert competitors_resp.status_code == 200
    assert any(c["assignee"] == "Test Univ" for c in competitors_resp.json())

    map_resp = client.get("/api/v1/patent-analysis/innovation-map", headers=researcher_auth["headers"])
    assert map_resp.status_code == 200


def test_patent_analysis_requires_auth(client):
    resp = client.get("/api/v1/patent-analysis/trend")
    assert resp.status_code == 401
