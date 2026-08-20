def test_manager_can_create_technology(client, innovation_manager_auth):
    payload = {"name": "Quantum Sensing", "domain": "Quantum", "description": "Emerging quantum sensing tech.", "maturity_level": "emerging"}
    resp = client.post("/api/v1/technologies", json=payload, headers=innovation_manager_auth["headers"])
    assert resp.status_code == 201
    assert resp.json()["name"] == "Quantum Sensing"


def test_researcher_cannot_create_technology(client, researcher_auth):
    payload = {"name": "Quantum Sensing 2", "domain": "Quantum", "maturity_level": "emerging"}
    resp = client.post("/api/v1/technologies", json=payload, headers=researcher_auth["headers"])
    assert resp.status_code == 403


def test_maturity_breakdown_and_search(client, innovation_manager_auth, researcher_auth):
    client.post(
        "/api/v1/technologies",
        json={"name": "Federated Learning", "domain": "AI", "maturity_level": "growth"},
        headers=innovation_manager_auth["headers"],
    )
    breakdown_resp = client.get("/api/v1/technologies/analysis/maturity-breakdown", headers=researcher_auth["headers"])
    assert breakdown_resp.status_code == 200

    search_resp = client.get("/api/v1/technologies?q=Federated", headers=researcher_auth["headers"])
    assert search_resp.status_code == 200
    assert search_resp.json()["total"] >= 1
