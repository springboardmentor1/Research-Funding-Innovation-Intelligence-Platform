"""
Tests for app/services/lens_service.py
All external HTTP calls are mocked.
"""
import pytest
from unittest.mock import patch, MagicMock

from app.services import lens_service


class TestNormalizePatent:
    def test_valid_patent(self, sample_lens_patent):
        result = lens_service.normalize_patent(sample_lens_patent)
        assert result is not None
        assert result["external_id"] == "000-000-000-000-001"
        assert result["source"] == "lens"
        assert "AI-Based Data Processing" in result["title"]
        assert result["status"] == "GRANTED"
        assert result["patent_number"] == "US20240001234A1"
        assert "Alice Inventor" in result["inventors"]
        assert result["assignee"] == "Tech Corp Inc"
        assert "G06F 40/30" in result["classification"]
        assert result["jurisdiction"] == "US"

    def test_missing_lens_id_returns_none(self, sample_lens_patent):
        sample_lens_patent.pop("lens_id")
        result = lens_service.normalize_patent(sample_lens_patent)
        assert result is None

    def test_empty_title_returns_none(self, sample_lens_patent):
        sample_lens_patent["title"] = [{"text": "", "lang": "en"}]
        result = lens_service.normalize_patent(sample_lens_patent)
        assert result is None

    def test_plain_string_title(self, sample_lens_patent):
        sample_lens_patent["title"] = "Plain String Title"
        result = lens_service.normalize_patent(sample_lens_patent)
        assert result is not None
        assert result["title"] == "Plain String Title"

    def test_no_inventors(self, sample_lens_patent):
        sample_lens_patent["inventors"] = []
        result = lens_service.normalize_patent(sample_lens_patent)
        assert result is not None
        assert result["inventors"] is None

    def test_not_granted(self, sample_lens_patent):
        sample_lens_patent["granted"] = False
        result = lens_service.normalize_patent(sample_lens_patent)
        assert result["status"] == "FILED"

    def test_malformed_record_returns_none(self):
        result = lens_service.normalize_patent({"lens_id": "X", "title": None})
        # title is None → no strip() possible, should return None
        assert result is None


class TestIterPatents:
    def _make_response(self, docs, scroll_id=None):
        resp = {"data": docs}
        if scroll_id:
            resp["scroll_id"] = scroll_id
        return resp

    @patch("app.services.lens_service._post")
    def test_single_page(self, mock_post, sample_lens_patent):
        mock_post.return_value = self._make_response([sample_lens_patent])
        results = list(lens_service.iter_patents("AI", max_records=100))
        assert len(results) == 1

    @patch("app.services.lens_service._post")
    def test_multi_page_scroll(self, mock_post, sample_lens_patent):
        doc2 = {**sample_lens_patent, "lens_id": "999-999-999-999-999"}
        mock_post.side_effect = [
            self._make_response([sample_lens_patent], scroll_id="scroll_abc"),
            self._make_response([doc2]),
        ]
        results = list(lens_service.iter_patents("AI", max_records=200))
        assert len(results) == 2

    @patch("app.services.lens_service._post")
    def test_api_failure_stops(self, mock_post):
        mock_post.return_value = None
        results = list(lens_service.iter_patents("AI", max_records=100))
        assert results == []

    @patch("app.services.lens_service._post")
    def test_empty_results(self, mock_post):
        mock_post.return_value = self._make_response([])
        results = list(lens_service.iter_patents("nothing", max_records=100))
        assert results == []

    @patch("app.services.lens_service.requests.post")
    def test_http_401_stops(self, mock_req):
        r = MagicMock()
        r.status_code = 401
        mock_req.return_value = r
        results = list(lens_service.iter_patents("AI", max_records=10))
        assert results == []

    @patch("app.services.lens_service.requests.post")
    def test_http_429_retries(self, mock_req):
        rate_limited = MagicMock()
        rate_limited.status_code = 429
        ok = MagicMock()
        ok.status_code = 200
        ok.json.return_value = {"data": []}
        mock_req.side_effect = [rate_limited, rate_limited, ok]
        with patch("app.services.lens_service.time.sleep"):
            results = list(lens_service.iter_patents("AI", max_records=10))
        assert results == []
