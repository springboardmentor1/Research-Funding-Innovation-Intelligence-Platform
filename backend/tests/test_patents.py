"""Tests for Patents endpoints."""
import pytest


class TestPatentsAPI:
    """Test GET /patents endpoints."""

    def test_get_all_patents(self, client):
        """GET /patents should return all patents."""
        response = client.get("/patents")
        assert response.status_code == 200
        data = response.json()
        assert "count" in data
        assert "patents" in data
        assert isinstance(data["patents"], list)
        assert data["count"] > 0

    def test_search_patents_by_technology(self, client):
        """GET /patents?technology=AI should filter patents."""
        response = client.get("/patents?technology=AI")
        assert response.status_code == 200
        data = response.json()
        assert "query" in data
        assert "patents" in data

    def test_patents_no_match(self, client):
        """GET /patents?technology=zzz should return empty."""
        response = client.get("/patents?technology=zzz_nonexistent_zzz")
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
