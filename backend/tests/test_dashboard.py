"""Tests for Dashboard endpoints."""
import pytest


class TestDashboardAPI:
    """Test Dashboard endpoints."""

    def test_executive_dashboard(self, client):
        """GET /dashboard/executive should return aggregated summary."""
        response = client.get("/dashboard/executive")
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data
        summary = data["summary"]
        assert "total_papers" in summary
        assert "total_funding" in summary
        assert "total_patents" in summary
        assert "top_research_topic" in summary
        assert "top_technology" in summary
        assert "average_innovation_score" in summary

    def test_executive_dashboard_has_charts_data(self, client):
        """Executive dashboard should include data for charts."""
        response = client.get("/dashboard/executive")
        assert response.status_code == 200
        data = response.json()
        assert "publication_trends" in data
        assert "funding_by_area" in data
        assert "patent_trends" in data
        assert "emerging_technologies" in data
        assert "top_scored_patents" in data
        assert "commercialization_distribution" in data

    def test_user_dashboard_not_found(self, client):
        """GET /dashboard/99999 should return 404."""
        response = client.get("/dashboard/99999")
        assert response.status_code == 404

    def test_user_dashboard_valid(self, client, auth_token):
        """GET /dashboard/1 should return user dashboard for valid user."""
        response = client.get("/dashboard/1")
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert "stats" in data
