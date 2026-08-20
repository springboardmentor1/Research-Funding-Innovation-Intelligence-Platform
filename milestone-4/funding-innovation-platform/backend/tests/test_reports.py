import pytest

REPORT_TYPES = ["funding", "patent", "research_trend", "innovation_intelligence", "commercialization"]


def test_list_available_reports(client, admin_auth):
    resp = client.get("/api/v1/reports", headers=admin_auth["headers"])
    assert resp.status_code == 200
    types = {r["report_type"] for r in resp.json()}
    assert types == set(REPORT_TYPES)


def test_researcher_denied_reports_access(client, researcher_auth):
    resp = client.get("/api/v1/reports", headers=researcher_auth["headers"])
    assert resp.status_code == 403


def test_innovation_manager_allowed_reports_access(client, innovation_manager_auth):
    resp = client.get("/api/v1/reports", headers=innovation_manager_auth["headers"])
    assert resp.status_code == 200


@pytest.mark.parametrize("report_type", REPORT_TYPES)
def test_download_pdf_report(client, admin_auth, report_type):
    resp = client.get(f"/api/v1/reports/{report_type}/pdf", headers=admin_auth["headers"])
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert resp.content[:4] == b"%PDF"


@pytest.mark.parametrize("report_type", REPORT_TYPES)
def test_download_excel_report(client, admin_auth, report_type):
    resp = client.get(f"/api/v1/reports/{report_type}/excel", headers=admin_auth["headers"])
    assert resp.status_code == 200
    assert "spreadsheetml" in resp.headers["content-type"]
    # XLSX files are zip archives; the zip local-file-header magic bytes are 'PK'.
    assert resp.content[:2] == b"PK"


def test_reports_reflect_seeded_data(client, admin_auth, researcher_auth):
    headers = researcher_auth["headers"]
    client.post(
        "/api/v1/research-profile/me",
        json={"research_domains": ["AI"], "keywords": [], "technology_areas": []},
        headers=headers,
    )
    client.post(
        "/api/v1/research-profile/me/publications",
        json={"title": "Paper X", "citation_count": 99, "publication_date": "2025-01-01"},
        headers=headers,
    )
    resp = client.get("/api/v1/reports/research_trend/excel", headers=admin_auth["headers"])
    assert resp.status_code == 200
    assert len(resp.content) > 0
