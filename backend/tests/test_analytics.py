"""Tests for Analytics endpoints."""
import pytest


class TestAnalyticsAPI:
    """Test Analytics module endpoints."""

    def test_publication_trends(self, client):
        """GET /analytics/publication-trends should return trend data."""
        response = client.get("/analytics/publication-trends")
        assert response.status_code == 200
        data = response.json()
        assert "trends" in data
        assert "total_papers" in data

    def test_publication_trends_with_area(self, client):
        """GET /analytics/publication-trends?area=AI should filter."""
        response = client.get("/analytics/publication-trends?area=AI")
        assert response.status_code == 200
        data = response.json()
        assert "trends" in data

    def test_top_keywords(self, client):
        """GET /analytics/top-keywords should return keyword list."""
        response = client.get("/analytics/top-keywords?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert "topics" in data
        assert isinstance(data["topics"], list)

    def test_area_distribution(self, client):
        """GET /analytics/area-distribution should return area counts."""
        response = client.get("/analytics/area-distribution")
        assert response.status_code == 200
        data = response.json()
        assert "areas" in data

    def test_intelligence_dashboard(self, client):
        """GET /analytics/dashboard should return intelligence data."""
        response = client.get("/analytics/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data
        assert "publication_trends" in data
        assert "top_keywords" in data

    def test_funding_analytics(self, client):
        """GET /analytics/funding should return funding breakdown."""
        response = client.get("/analytics/funding")
        assert response.status_code == 200
        data = response.json()
        assert "total_opportunities" in data
        assert "by_area" in data
        assert "by_agency" in data
        assert "deadlines" in data

    def test_patent_analytics(self, client):
        """GET /analytics/patents should return patent breakdown."""
        response = client.get("/analytics/patents")
        assert response.status_code == 200
        data = response.json()
        assert "total_patents" in data
        assert "by_technology" in data
        assert "trends" in data
        assert "top_assignees" in data

    def test_innovation_analytics(self, client):
        """GET /analytics/innovation should return score data."""
        response = client.get("/analytics/innovation")
        assert response.status_code == 200
        data = response.json()
        assert "average_score" in data
        assert "distribution" in data
        assert "top_innovations" in data

    def test_commercialization_analytics(self, client):
        """GET /analytics/commercialization should return recommendations."""
        response = client.get("/analytics/commercialization")
        assert response.status_code == 200
        data = response.json()
        assert "total_patents" in data
        assert "distribution" in data
        assert "opportunities" in data
