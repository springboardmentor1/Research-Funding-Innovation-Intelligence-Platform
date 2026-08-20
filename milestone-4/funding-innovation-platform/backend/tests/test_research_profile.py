def test_create_and_get_profile(client, researcher_auth):
    headers = researcher_auth["headers"]
    payload = {
        "biography": "AI researcher",
        "organization": "Test University",
        "research_domains": ["AI", "Robotics"],
        "keywords": ["ML", "NLP"],
        "technology_areas": ["Deep Learning"],
    }
    resp = client.post("/api/v1/research-profile/me", json=payload, headers=headers)
    assert resp.status_code == 201
    body = resp.json()
    assert body["organization"] == "Test University"
    assert body["research_domains"] == ["AI", "Robotics"]

    get_resp = client.get("/api/v1/research-profile/me", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["organization"] == "Test University"


def test_add_publication_and_patent(client, researcher_auth):
    headers = researcher_auth["headers"]
    client.post(
        "/api/v1/research-profile/me",
        json={"research_domains": ["AI"], "keywords": [], "technology_areas": []},
        headers=headers,
    )

    pub_resp = client.post(
        "/api/v1/research-profile/me/publications",
        json={
            "title": "Deep Learning Advances",
            "authors": "Researcher One",
            "journal": "AI Journal",
            "publication_date": "2025-05-01",
            "citation_count": 42,
        },
        headers=headers,
    )
    assert pub_resp.status_code in (200, 201)
    assert pub_resp.json()["citation_count"] == 42

    patent_resp = client.post(
        "/api/v1/research-profile/me/patents",
        json={
            "title": "Novel Neural Architecture",
            "assignee": "Test University",
            "filing_date": "2024-01-15",
            "classification": "G06N",
            "technology_domain": "AI",
            "citation_count": 5,
        },
        headers=headers,
    )
    assert patent_resp.status_code in (200, 201)
    assert patent_resp.json()["technology_domain"] == "AI"


def test_profile_requires_authentication(client):
    resp = client.get("/api/v1/research-profile/me")
    assert resp.status_code == 401
