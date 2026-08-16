"""
Tests for app/services/openalex_service.py
All external HTTP calls are mocked.
"""
import pytest
from unittest.mock import patch, MagicMock

from app.services import openalex_service


# -----------------------------------------------------------------------
# normalize_publication tests
# -----------------------------------------------------------------------

class TestNormalizePublication:
    def test_valid_work(self, sample_openalex_work):
        result = openalex_service.normalize_publication(sample_openalex_work)
        assert result is not None
        assert result["external_id"] == "https://openalex.org/W1234567890"
        assert result["source"] == "openalex"
        assert result["title"] == "Deep Learning for Natural Language Processing"
        assert result["doi"] == "10.1234/test.2024.001"  # stripped https://doi.org/
        assert result["publication_year"] == 2024
        assert result["citation_count"] == 42
        assert result["open_access"] == "gold"
        assert "Jane Doe" in result["authors"]
        assert "Artificial Intelligence" in result["topics"]

    def test_abstract_reconstruction(self, sample_openalex_work):
        result = openalex_service.normalize_publication(sample_openalex_work)
        assert "This paper presents a novel approach" in result["abstract"]

    def test_missing_id_returns_none(self, sample_openalex_work):
        sample_openalex_work.pop("id")
        result = openalex_service.normalize_publication(sample_openalex_work)
        assert result is None

    def test_missing_title_returns_none(self, sample_openalex_work):
        sample_openalex_work["title"] = None
        sample_openalex_work["display_name"] = None
        result = openalex_service.normalize_publication(sample_openalex_work)
        assert result is None

    def test_malformed_abstract_handled(self, sample_openalex_work):
        sample_openalex_work["abstract_inverted_index"] = "not_a_dict"
        result = openalex_service.normalize_publication(sample_openalex_work)
        assert result is not None
        assert result["abstract"] is None

    def test_no_authors(self, sample_openalex_work):
        sample_openalex_work["authorships"] = []
        result = openalex_service.normalize_publication(sample_openalex_work)
        assert result is not None
        assert result["authors"] == []


# -----------------------------------------------------------------------
# iter_works (pagination) tests
# -----------------------------------------------------------------------

class TestIterWorks:
    def _make_response(self, works, next_cursor=None):
        return {
            "results": works,
            "meta": {
                "count": len(works),
                "next_cursor": next_cursor,
            },
        }

    @patch("app.services.openalex_service._get")
    def test_single_page(self, mock_get, sample_openalex_work):
        mock_get.return_value = self._make_response([sample_openalex_work], next_cursor=None)
        works = list(openalex_service.iter_works("AI", max_records=100))
        assert len(works) == 1
        assert mock_get.call_count == 1

    @patch("app.services.openalex_service._get")
    def test_multi_page_pagination(self, mock_get, sample_openalex_work):
        work2 = {**sample_openalex_work, "id": "https://openalex.org/W2"}
        mock_get.side_effect = [
            self._make_response([sample_openalex_work], next_cursor="cursor_page2"),
            self._make_response([work2], next_cursor=None),
        ]
        works = list(openalex_service.iter_works("AI", max_records=200))
        assert len(works) == 2
        assert mock_get.call_count == 2

    @patch("app.services.openalex_service._get")
    def test_empty_response(self, mock_get):
        mock_get.return_value = self._make_response([])
        works = list(openalex_service.iter_works("nothing", max_records=100))
        assert works == []

    @patch("app.services.openalex_service._get")
    def test_api_failure_stops_iteration(self, mock_get):
        mock_get.return_value = None
        works = list(openalex_service.iter_works("AI", max_records=100))
        assert works == []

    @patch("app.services.openalex_service.requests.get")
    def test_timeout_retries_then_stops(self, mock_requests_get):
        import requests as req
        mock_requests_get.side_effect = req.exceptions.Timeout()
        works = list(openalex_service.iter_works("AI", max_records=10))
        assert works == []

    @patch("app.services.openalex_service.requests.get")
    def test_http_429_retries(self, mock_requests_get):
        rate_limited = MagicMock()
        rate_limited.status_code = 429
        ok = MagicMock()
        ok.status_code = 200
        ok.json.return_value = {"results": [], "meta": {}}
        mock_requests_get.side_effect = [rate_limited, rate_limited, ok]
        with patch("app.services.openalex_service.time.sleep"):
            works = list(openalex_service.iter_works("AI", max_records=10))
        assert works == []

    @patch("app.services.openalex_service.requests.get")
    def test_http_500_retries_then_stops(self, mock_requests_get):
        err = MagicMock()
        err.status_code = 500
        mock_requests_get.return_value = err
        with patch("app.services.openalex_service.time.sleep"):
            works = list(openalex_service.iter_works("AI", max_records=10))
        assert works == []
