"""Tests for Research endpoints."""
import pytest


class TestResearchAPI:
    """Test GET /research endpoints."""

    def test_search_papers_requires_topic(self, client):
        """GET /research/search without topic should return 422."""
        response = client.get("/research/search")
        assert response.status_code == 422

    def test_search_papers_with_topic(self, client):
        """GET /research/search?topic=AI should return results."""
        response = client.get("/research/search?topic=AI&limit=3")
        # May be 200 or 503 if OpenAlex is unreachable, both are valid
        assert response.status_code in [200, 503]

    def test_get_saved_papers(self, client):
        """GET /research/saved should return saved papers."""
        response = client.get("/research/saved")
        assert response.status_code == 200
        data = response.json()
        assert "count" in data
        assert "papers" in data
        assert isinstance(data["papers"], list)

    def test_search_with_limit(self, client):
        """GET /research/search?topic=AI&limit=2 should respect limit."""
        response = client.get("/research/search?topic=AI&limit=2")
        if response.status_code == 200:
            data = response.json()
            assert data["count"] <= 2
