"""Tests for Reports endpoints (PDF and Excel export)."""
import pytest


class TestReportsAPI:
    """Test report generation endpoints."""

    # ── PDF Reports ───────────────────────────────────────────────────────

    def test_funding_pdf(self, client):
        """GET /reports/funding/pdf should return a PDF file."""
        response = client.get("/reports/funding/pdf")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert "funding_report.pdf" in response.headers.get("content-disposition", "")
        # PDF should start with %PDF
        assert response.content[:5] == b"%PDF-"

    def test_research_pdf(self, client):
        """GET /reports/research/pdf should return a PDF file."""
        response = client.get("/reports/research/pdf")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert response.content[:5] == b"%PDF-"

    def test_patent_pdf(self, client):
        """GET /reports/patent/pdf should return a PDF file."""
        response = client.get("/reports/patent/pdf")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert response.content[:5] == b"%PDF-"

    def test_innovation_pdf(self, client):
        """GET /reports/innovation/pdf should return a PDF file."""
        response = client.get("/reports/innovation/pdf")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert response.content[:5] == b"%PDF-"

    def test_commercialization_pdf(self, client):
        """GET /reports/commercialization/pdf should return a PDF file."""
        response = client.get("/reports/commercialization/pdf")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert response.content[:5] == b"%PDF-"

    # ── Excel Reports ─────────────────────────────────────────────────────

    def test_funding_excel(self, client):
        """GET /reports/funding/excel should return an Excel file."""
        response = client.get("/reports/funding/excel")
        assert response.status_code == 200
        content_type = response.headers["content-type"]
        assert "spreadsheetml" in content_type or "excel" in content_type
        assert "funding_report.xlsx" in response.headers.get("content-disposition", "")
        # XLSX files start with PK (zip format)
        assert response.content[:2] == b"PK"

    def test_patent_excel(self, client):
        """GET /reports/patent/excel should return an Excel file."""
        response = client.get("/reports/patent/excel")
        assert response.status_code == 200
        assert response.content[:2] == b"PK"

    def test_research_excel(self, client):
        """GET /reports/research/excel should return an Excel file."""
        response = client.get("/reports/research/excel")
        assert response.status_code == 200
        assert response.content[:2] == b"PK"

    def test_innovation_excel(self, client):
        """GET /reports/innovation/excel should return an Excel file."""
        response = client.get("/reports/innovation/excel")
        assert response.status_code == 200
        assert response.content[:2] == b"PK"

    def test_commercialization_excel(self, client):
        """GET /reports/commercialization/excel should return an Excel file."""
        response = client.get("/reports/commercialization/excel")
        assert response.status_code == 200
        assert response.content[:2] == b"PK"

