"""Tests for Funding endpoints."""
import pytest


class TestFundingAPI:
    """Test GET /funding endpoints."""

    def test_get_all_funding(self, client):
        """GET /funding should return all funding opportunities."""
        response = client.get("/funding")
        assert response.status_code == 200
        data = response.json()
        assert "count" in data
        assert "funding_opportunities" in data
        assert isinstance(data["funding_opportunities"], list)

    def test_get_funding_by_area(self, client):
        """GET /funding?area=AI should filter by area."""
        response = client.get("/funding?area=AI")
        assert response.status_code == 200
        data = response.json()
        assert "query" in data
        assert data["query"] == "AI"
        assert "funding_opportunities" in data

    def test_get_funding_no_match(self, client):
        """GET /funding?area=nonexistent should return empty list."""
        response = client.get("/funding?area=zzz_nonexistent_area_zzz")
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
