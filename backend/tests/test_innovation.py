"""Tests for Innovation endpoints."""
import pytest


class TestInnovationAPI:
    """Test Innovation module endpoints."""

    def test_innovation_scores(self, client):
        """GET /innovation/scores should return scored patents."""
        response = client.get("/innovation/scores?top_n=5")
        assert response.status_code == 200
        data = response.json()
        assert "patents" in data
        assert "distribution" in data
        assert isinstance(data["patents"], list)

    def test_innovation_scores_have_breakdown(self, client):
        """Innovation scores should include scoring breakdown."""
        response = client.get("/innovation/scores?top_n=3")
        assert response.status_code == 200
        data = response.json()
        if data["patents"]:
            patent = data["patents"][0]
            assert "innovation_score" in patent
            assert "breakdown" in patent
            breakdown = patent["breakdown"]
            assert "research_novelty" in breakdown
            assert "patent_strength" in breakdown
            assert "technology_maturity" in breakdown
            assert "market_potential" in breakdown
            assert "funding_relevance" in breakdown

    def test_commercialization(self, client):
        """GET /innovation/commercialization should return recommendations."""
        response = client.get("/innovation/commercialization")
        assert response.status_code == 200
        data = response.json()
        assert "total_patents" in data
        assert "distribution" in data
        assert "top_commercializable" in data

    def test_innovation_dashboard(self, client):
        """GET /innovation/dashboard should return aggregated data."""
        response = client.get("/innovation/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data
        assert "patent_trends" in data
        assert "technology_ranking" in data
        assert "emerging_technologies" in data

    def test_patent_landscape(self, client):
        """GET /innovation/patent-landscape should return distributions."""
        response = client.get("/innovation/patent-landscape")
        assert response.status_code == 200
        data = response.json()
        assert "total_patents" in data
        assert "by_technology" in data
        assert "by_country" in data

    def test_patent_trends(self, client):
        """GET /innovation/patent-trends should return yearly data."""
        response = client.get("/innovation/patent-trends")
        assert response.status_code == 200
        data = response.json()
        assert "trends" in data
        assert isinstance(data["trends"], list)

    def test_technology_intelligence(self, client):
        """GET /innovation/technology-intelligence should return tech ranking."""
        response = client.get("/innovation/technology-intelligence")
        assert response.status_code == 200
        data = response.json()
        assert "technologies" in data
        assert "growth_matrix" in data

    def test_emerging_technologies(self, client):
        """GET /innovation/emerging-technologies should return emerging techs."""
        response = client.get("/innovation/emerging-technologies?top_n=5")
        assert response.status_code == 200
        data = response.json()
        assert "emerging" in data
