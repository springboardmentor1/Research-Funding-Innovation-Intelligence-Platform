"""
OpenAlex API service.

Responsibilities:
- Fetching works pages from https://api.openalex.org/works
- Cursor-based pagination
- Retry with exponential backoff on 429/5xx
- Normalising raw API response → GlobalPublication-compatible dict
- Never raising unhandled exceptions (returns None on per-record errors)
"""
import os
import time
import logging
from typing import Optional, Iterator
from datetime import date

import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

OPENALEX_BASE_URL = os.getenv("OPENALEX_BASE_URL", "https://api.openalex.org")
OPENALEX_API_KEY = os.getenv("OPENALEX_API_KEY", "")
BATCH_SIZE = int(os.getenv("INGESTION_BATCH_SIZE", "100"))

# Retry settings
MAX_RETRIES = 4
BACKOFF_BASE = 2   # seconds


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _get(url: str, params: dict, timeout: int = 20) -> Optional[dict]:
    """
    Perform a GET request with exponential backoff retries.
    Returns the parsed JSON dict, or None on permanent failure.
    """
    if OPENALEX_API_KEY:
        params = {**params, "api_key": OPENALEX_API_KEY}

    headers = {"User-Agent": "mailto:platform-admin@research-platform.com"}

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.get(url, params=params, headers=headers, timeout=timeout)
        except requests.exceptions.Timeout:
            logger.warning("[OpenAlex] Timeout on attempt %d/%d", attempt, MAX_RETRIES)
            if attempt == MAX_RETRIES:
                return None
            time.sleep(BACKOFF_BASE ** attempt)
            continue
        except requests.exceptions.RequestException as exc:
            logger.error("[OpenAlex] Connection error: %s", exc)
            return None

        if resp.status_code == 200:
            try:
                return resp.json()
            except Exception:
                logger.error("[OpenAlex] Invalid JSON in response")
                return None

        if resp.status_code == 429:
            wait = BACKOFF_BASE ** attempt
            logger.warning("[OpenAlex] Rate limited (429). Waiting %ds …", wait)
            time.sleep(wait)
            continue

        if resp.status_code >= 500:
            wait = BACKOFF_BASE ** attempt
            logger.warning("[OpenAlex] Server error %d. Waiting %ds …", resp.status_code, wait)
            if attempt == MAX_RETRIES:
                return None
            time.sleep(wait)
            continue

        # 4xx (not 429) – permanent error, don't retry
        logger.error("[OpenAlex] Permanent error %d for URL %s", resp.status_code, url)
        return None

    return None


def _parse_date(date_str: Optional[str]) -> Optional[date]:
    """Parse ISO date string YYYY-MM-DD; falls back to None."""
    if not date_str:
        return None
    try:
        return date.fromisoformat(date_str)
    except Exception:
        return None


def _reconstruct_abstract(inverted_index: Optional[dict]) -> Optional[str]:
    """Rebuilds full abstract text from OpenAlex inverted index format."""
    if not inverted_index or not isinstance(inverted_index, dict):
        return None
    try:
        max_pos = max(pos for positions in inverted_index.values() for pos in positions) + 1
        words = [None] * max_pos
        for word, positions in inverted_index.items():
            for pos in positions:
                if 0 <= pos < max_pos:
                    words[pos] = word
        return " ".join(w for w in words if w)
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def normalize_publication(work: dict) -> Optional[dict]:
    """
    Map a single OpenAlex work object to a GlobalPublication-compatible dict.
    Returns None if the record is too malformed to save.
    """
    try:
        external_id = work.get("id")
        if not external_id:
            return None

        title = work.get("title") or work.get("display_name") or ""
        if not title.strip():
            return None

        abstract = _reconstruct_abstract(work.get("abstract_inverted_index"))

        # Authors
        authorships = work.get("authorships") or []
        authors = [
            a.get("author", {}).get("display_name")
            for a in authorships
            if a.get("author", {}).get("display_name")
        ]

        # Journal / source
        primary_loc = work.get("primary_location") or {}
        source = primary_loc.get("source") or {}
        journal = source.get("display_name") or None

        # Dates
        pub_date = _parse_date(work.get("publication_date"))
        pub_year = work.get("publication_year") or (pub_date.year if pub_date else None)

        # Topics / concepts  (OpenAlex 2.x uses "topics"; older "concepts")
        topics_raw = work.get("topics") or work.get("concepts") or []
        topics = [
            t.get("display_name")
            for t in topics_raw
            if t.get("display_name")
        ][:20]

        # Open access
        oa_info = work.get("open_access") or {}
        oa_status = oa_info.get("oa_status") or ("open" if oa_info.get("is_oa") else "closed")

        # URL
        url = primary_loc.get("landing_page_url") or work.get("doi") or None

        # DOI – normalise to bare DOI if it's a URL
        doi = work.get("doi")
        if doi and doi.startswith("https://doi.org/"):
            doi = doi[len("https://doi.org/"):]

        # Minimal raw snapshot (avoid bloat)
        raw = {
            "open_access": oa_info,
            "cited_by_count": work.get("cited_by_count"),
            "type": work.get("type"),
        }

        return {
            "external_id": external_id,
            "source": "openalex",
            "doi": doi,
            "title": title[:2000],
            "abstract": abstract,
            "authors": authors,
            "journal": journal[:512] if journal else None,
            "publication_date": pub_date,
            "publication_year": pub_year,
            "citation_count": work.get("cited_by_count") or 0,
            "open_access": oa_status[:10] if oa_status else None,
            "url": url,
            "topics": topics,
            "raw_metadata": raw,
        }
    except Exception as exc:
        logger.warning("[OpenAlex] normalize_publication failed: %s", exc)
        return None


def iter_works(query: str, max_records: int = 10_000) -> Iterator[dict]:
    """
    Cursor-based page iterator for OpenAlex /works.
    Yields individual raw work dicts.
    Stops when all pages are exhausted or `max_records` reached.
    """
    cursor = "*"
    fetched = 0

    while fetched < max_records:
        remaining = min(BATCH_SIZE, max_records - fetched)
        params = {
            "search": query,
            "per_page": remaining,
            "cursor": cursor,
            "select": (
                "id,title,display_name,doi,abstract_inverted_index,"
                "authorships,primary_location,publication_date,publication_year,"
                "cited_by_count,open_access,concepts,topics,type"
            ),
        }

        data = _get(f"{OPENALEX_BASE_URL}/works", params)
        if not data:
            logger.error("[OpenAlex] Failed to fetch page (cursor=%s). Stopping.", cursor)
            break

        results = data.get("results") or []
        if not results:
            logger.info("[OpenAlex] No more results (cursor=%s).", cursor)
            break

        for work in results:
            yield work

        fetched += len(results)
        logger.info("[OpenAlex] Fetched %d records so far (batch=%d).", fetched, len(results))

        # Advance cursor
        meta = data.get("meta") or {}
        next_cursor = meta.get("next_cursor")
        if not next_cursor:
            break
        cursor = next_cursor
