def _build_full_profile(client, headers):
    client.post(
        "/api/v1/research-profile/me",
        json={
            "biography": "Prolific researcher",
            "organization": "Test University",
            "research_domains": ["AI"],
            "keywords": ["ML"],
            "technology_areas": ["Deep Learning"],
        },
        headers=headers,
    )
    client.post(
        "/api/v1/research-profile/me/publications",
        json={"title": "Paper One", "citation_count": 50, "publication_date": "2025-01-01"},
        headers=headers,
    )
    client.post(
        "/api/v1/research-profile/me/patents",
        json={"title": "Patent One", "assignee": "Test University", "citation_count": 20, "filing_date": "2024-01-01"},
        headers=headers,
    )


def test_recompute_and_get_innovation_score(client, researcher_auth):
    headers = researcher_auth["headers"]
    _build_full_profile(client, headers)

    resp = client.post("/api/v1/innovation-score/me/recompute", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert 0 <= body["overall_score"] <= 100
    assert set(["research_novelty", "patent_strength", "technology_maturity", "market_potential", "funding_relevance"]).issubset(body)

    get_resp = client.get("/api/v1/innovation-score/me", headers=headers)
    assert get_resp.status_code == 200


def test_leaderboard(client, researcher_auth):
    headers = researcher_auth["headers"]
    _build_full_profile(client, headers)
    client.post("/api/v1/innovation-score/me/recompute", headers=headers)

    resp = client.get("/api/v1/innovation-score/leaderboard", headers=headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_commercialization_generate_and_list(client, researcher_auth):
    headers = researcher_auth["headers"]
    _build_full_profile(client, headers)
    client.post("/api/v1/innovation-score/me/recompute", headers=headers)

    gen_resp = client.post("/api/v1/commercialization/me/generate", headers=headers)
    assert gen_resp.status_code == 201
    assert isinstance(gen_resp.json(), list)

    list_resp = client.get("/api/v1/commercialization/me", headers=headers)
    assert list_resp.status_code == 200
    assert "total" in list_resp.json()
