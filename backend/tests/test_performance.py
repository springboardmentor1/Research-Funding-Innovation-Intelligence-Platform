"""Performance Tests.

Measures actual API response times for key endpoints.
Records real measurements — not fabricated numbers.
"""
import pytest
import time


class TestPerformance:
    """Measure and verify API response times."""

    def _timed_get(self, client, url):
        """Make a GET request and return (response, elapsed_ms)."""
        start = time.perf_counter()
        response = client.get(url)
        elapsed_ms = (time.perf_counter() - start) * 1000
        return response, elapsed_ms

    def test_health_response_time(self, client):
        """Health endpoint should respond under 100ms."""
        response, elapsed = self._timed_get(client, "/health")
        assert response.status_code == 200
        assert elapsed < 100, f"Health endpoint took {elapsed:.0f}ms (expected < 100ms)"
        print(f"  Health endpoint: {elapsed:.0f}ms")

    def test_root_response_time(self, client):
        """Root endpoint should respond under 100ms."""
        response, elapsed = self._timed_get(client, "/")
        assert response.status_code == 200
        assert elapsed < 100, f"Root endpoint took {elapsed:.0f}ms (expected < 100ms)"
        print(f"  Root endpoint: {elapsed:.0f}ms")

    def test_funding_response_time(self, client):
        """Funding endpoint should respond under 2000ms."""
        response, elapsed = self._timed_get(client, "/funding")
        assert response.status_code == 200
        assert elapsed < 2000, f"Funding endpoint took {elapsed:.0f}ms (expected < 2000ms)"
        print(f"  Funding API: {elapsed:.0f}ms")

    def test_patents_response_time(self, client):
        """Patents endpoint should respond under 2000ms."""
        response, elapsed = self._timed_get(client, "/patents")
        assert response.status_code == 200
        assert elapsed < 2000, f"Patents endpoint took {elapsed:.0f}ms (expected < 2000ms)"
        print(f"  Patents API: {elapsed:.0f}ms")

    def test_publication_trends_response_time(self, client):
        """Publication trends should respond under 2000ms."""
        response, elapsed = self._timed_get(client, "/analytics/publication-trends")
        assert response.status_code == 200
        assert elapsed < 2000, f"Publication trends took {elapsed:.0f}ms (expected < 2000ms)"
        print(f"  Publication Trends: {elapsed:.0f}ms")

    def test_executive_dashboard_response_time(self, client):
        """Executive dashboard should respond under 10000ms."""
        response, elapsed = self._timed_get(client, "/dashboard/executive")
        assert response.status_code == 200
        assert elapsed < 10000, f"Executive dashboard took {elapsed:.0f}ms (expected < 10000ms)"
        print(f"  Executive Dashboard: {elapsed:.0f}ms")

    def test_innovation_scores_response_time(self, client):
        """Innovation scores should respond under 5000ms."""
        response, elapsed = self._timed_get(client, "/innovation/scores?top_n=10")
        assert response.status_code == 200
        assert elapsed < 5000, f"Innovation scores took {elapsed:.0f}ms (expected < 5000ms)"
        print(f"  Innovation Scores: {elapsed:.0f}ms")

    def test_analytics_dashboard_response_time(self, client):
        """Analytics intelligence dashboard should respond under 5000ms."""
        response, elapsed = self._timed_get(client, "/analytics/dashboard")
        assert response.status_code == 200
        assert elapsed < 5000, f"Analytics dashboard took {elapsed:.0f}ms (expected < 5000ms)"
        print(f"  Analytics Dashboard: {elapsed:.0f}ms")
