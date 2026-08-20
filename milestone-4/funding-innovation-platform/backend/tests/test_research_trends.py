def _seed_publications(client, headers):
    client.post(
        "/api/v1/research-profile/me",
        json={"research_domains": ["AI", "Robotics"], "keywords": ["ML"], "technology_areas": []},
        headers=headers,
    )
    client.post(
        "/api/v1/research-profile/me/publications",
        json={"title": "Deep Learning Advances", "citation_count": 42, "publication_date": "2025-05-01"},
        headers=headers,
    )
    client.post(
        "/api/v1/research-profile/me/publications",
        json={"title": "Robotics Frontiers", "citation_count": 10, "publication_date": "2024-03-01"},
        headers=headers,
    )


def test_publication_trend(client, researcher_auth):
    _seed_publications(client, researcher_auth["headers"])
    resp = client.get("/api/v1/research-trends/publication-trend", headers=researcher_auth["headers"])
    assert resp.status_code == 200
    years = {p["year"] for p in resp.json()}
    assert {2024, 2025}.issubset(years)


def test_citation_analytics(client, researcher_auth):
    _seed_publications(client, researcher_auth["headers"])
    resp = client.get("/api/v1/research-trends/citation-analytics", headers=researcher_auth["headers"])
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_publications"] == 2
    assert body["total_citations"] == 52
    assert body["max_citations"] == 42


def test_emerging_topics_and_hotspots(client, researcher_auth):
    _seed_publications(client, researcher_auth["headers"])
    topics_resp = client.get("/api/v1/research-trends/emerging-topics", headers=researcher_auth["headers"])
    assert topics_resp.status_code == 200
    topic_names = {t["topic"] for t in topics_resp.json()}
    assert "AI" in topic_names or "Robotics" in topic_names

    hotspots_resp = client.get("/api/v1/research-trends/hotspots", headers=researcher_auth["headers"])
    assert hotspots_resp.status_code == 200
    assert len(hotspots_resp.json()) >= 1


def test_top_cited_publications(client, researcher_auth):
    _seed_publications(client, researcher_auth["headers"])
    resp = client.get("/api/v1/research-trends/top-cited", headers=researcher_auth["headers"])
    assert resp.status_code == 200
    top = resp.json()
    assert top[0]["citation_count"] == 42


def test_overview_composite_payload(client, researcher_auth):
    _seed_publications(client, researcher_auth["headers"])
    resp = client.get("/api/v1/research-trends/overview", headers=researcher_auth["headers"])
    assert resp.status_code == 200
    body = resp.json()
    for key in ("publication_trend", "emerging_topics", "research_hotspots", "domain_trends", "citation_analytics", "top_cited_publications"):
        assert key in body


def test_research_trends_requires_auth(client):
    resp = client.get("/api/v1/research-trends/overview")
    assert resp.status_code == 401


def test_research_trends_empty_platform(client, researcher_auth):
    """With no publications at all, every endpoint should return empty
    collections / zeroed summaries rather than erroring."""
    resp = client.get("/api/v1/research-trends/overview", headers=researcher_auth["headers"])
    assert resp.status_code == 200
    body = resp.json()
    assert body["publication_trend"] == []
    assert body["citation_analytics"]["total_publications"] == 0
