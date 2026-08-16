"""
Lens Patent API service.

Responsibilities:
- Fetching patents from https://api.lens.org/patent/search using scroll API
- Scroll-based pagination (Lens uses scroll_id for deep pagination)
- Retry with exponential backoff on 429/5xx
- Normalising raw Lens API response → GlobalPatent-compatible dict
- Never crashing on malformed records
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

LENS_API_URL = "https://api.lens.org/patent/search"
LENS_API_KEY = os.getenv("LENS_API_KEY", "")
BATCH_SIZE = int(os.getenv("INGESTION_BATCH_SIZE", "100"))

MAX_RETRIES = 4
BACKOFF_BASE = 2


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _post(payload: dict, timeout: int = 25) -> Optional[dict]:
    """
    POST to Lens API with exponential backoff retries.
    Returns parsed JSON or None on failure.
    """
    if not LENS_API_KEY:
        logger.error("[Lens] LENS_API_KEY not configured. Cannot fetch patents.")
        return None

    headers = {
        "Authorization": f"Bearer {LENS_API_KEY}",
        "Content-Type": "application/json",
    }

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.post(LENS_API_URL, json=payload, headers=headers, timeout=timeout)
        except requests.exceptions.Timeout:
            logger.warning("[Lens] Timeout on attempt %d/%d", attempt, MAX_RETRIES)
            if attempt == MAX_RETRIES:
                return None
            time.sleep(BACKOFF_BASE ** attempt)
            continue
        except requests.exceptions.RequestException as exc:
            logger.error("[Lens] Connection error: %s", exc)
            return None

        if resp.status_code == 200:
            try:
                return resp.json()
            except Exception:
                logger.error("[Lens] Invalid JSON in response")
                return None

        if resp.status_code == 429:
            wait = BACKOFF_BASE ** attempt
            logger.warning("[Lens] Rate limited (429). Waiting %ds …", wait)
            time.sleep(wait)
            continue

        if resp.status_code >= 500:
            wait = BACKOFF_BASE ** attempt
            logger.warning("[Lens] Server error %d. Waiting %ds …", resp.status_code, wait)
            if attempt == MAX_RETRIES:
                return None
            time.sleep(wait)
            continue

        if resp.status_code == 401:
            logger.error("[Lens] Authentication failed. Check LENS_API_KEY.")
            return None

        logger.error("[Lens] Permanent error %d", resp.status_code)
        return None

    return None


def _parse_date(date_str: Optional[str]) -> Optional[date]:
    if not date_str:
        return None
    for fmt in ("%Y-%m-%d", "%Y%m%d", "%Y"):
        try:
            from datetime import datetime
            return datetime.strptime(date_str[:len(fmt.replace("%Y", "0000"))], fmt).date()
        except Exception:
            pass
    # Last resort: try fromisoformat
    try:
        return date.fromisoformat(date_str[:10])
    except Exception:
        return None


def _extract_text(field) -> Optional[str]:
    """
    Lens API returns title/abstract as either:
    - a list of dicts: [{"text": "...", "lang": "en"}]
    - a dict: {"text": "..."}
    - a plain string
    """
    if not field:
        return None
    if isinstance(field, str):
        return field
    if isinstance(field, list) and field:
        item = field[0]
        if isinstance(item, dict):
            return item.get("text")
    if isinstance(field, dict):
        return field.get("text")
    return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def normalize_patent(doc: dict) -> Optional[dict]:
    """
    Map a single Lens patent document to a GlobalPatent-compatible dict.
    Returns None if the record is too malformed.
    """
    try:
        lens_id = doc.get("lens_id")
        if not lens_id:
            return None

        title = _extract_text(doc.get("title"))
        if not title or not title.strip():
            return None

        abstract = _extract_text(doc.get("abstract"))

        # Inventors
        inventor_list = doc.get("inventors") or []
        inventors = [
            inv.get("display_name") or f"{inv.get('name', {}).get('value', '')}"
            for inv in inventor_list
            if inv.get("display_name") or inv.get("name")
        ]

        # Assignee — use first applicant if no assignee
        assignees = doc.get("assignees") or doc.get("applicants") or []
        assignee = assignees[0].get("display_name") if assignees else None

        # Dates
        filing_date = _parse_date(doc.get("filing_date") or doc.get("date_published"))
        pub_date = _parse_date(doc.get("publication_date") or doc.get("date_published"))

        # Patent number — prefer publication_number
        patent_number = (
            doc.get("publication_number")
            or doc.get("application_number")
            or doc.get("doc_number")
            or None
        )

        # Classification (IPC)
        classifications = doc.get("classifications_ipcr") or []
        classification_codes = [
            c.get("symbol") for c in classifications if c.get("symbol")
        ]
        classification = ", ".join(classification_codes) if classification_codes else None

        status = "GRANTED" if doc.get("granted") else "FILED"

        # Jurisdiction
        jurisdiction = doc.get("jurisdiction") or (
            patent_number[:2] if patent_number and len(patent_number) >= 2 else None
        )

        url = f"https://www.lens.org/lens/patent/{lens_id}"

        # Minimal raw snapshot
        raw = {
            "lens_id": lens_id,
            "granted": doc.get("granted"),
            "cited_by_patent_count": doc.get("cited_by_patent_count"),
            "family_id": doc.get("family_id"),
        }

        return {
            "external_id": lens_id,
            "source": "lens",
            "patent_number": patent_number[:255] if patent_number else None,
            "title": title[:2000],
            "abstract": abstract,
            "inventors": inventors or None,
            "assignee": assignee[:512] if assignee else None,
            "filing_date": filing_date,
            "publication_date": pub_date,
            "url": url,
            "classification": classification,
            "status": status,
            "jurisdiction": jurisdiction[:10] if jurisdiction else None,
            "raw_metadata": raw,
        }
    except Exception as exc:
        logger.warning("[Lens] normalize_patent failed: %s", exc)
        return None


def iter_patents(query: str, max_records: int = 10_000) -> Iterator[dict]:
    """
    Scroll-based page iterator for Lens /patent/search.
    Yields individual raw patent dicts.
    Stops when exhausted or max_records reached.
    """
    fetched = 0
    scroll_id = None

    while fetched < max_records:
        remaining = min(BATCH_SIZE, max_records - fetched)

        if scroll_id:
            # Continue existing scroll
            payload = {"scroll_id": scroll_id, "size": remaining}
        else:
            # Start new scroll session
            payload = {
                "query": {
                    "query_string": {
                        "query": query,
                        "fields": ["title", "abstract", "claims"],
                        "default_operator": "AND",
                    }
                },
                "size": remaining,
                "scroll": "1m",
                "include": [
                    "lens_id", "title", "abstract", "inventors", "assignees",
                    "applicants", "filing_date", "publication_date",
                    "classifications_ipcr", "granted", "jurisdiction",
                    "publication_number", "application_number", "family_id",
                    "cited_by_patent_count",
                ],
            }

        data = _post(payload)
        if not data:
            logger.error("[Lens] Failed to fetch page. Stopping.")
            break

        results = data.get("data") or []
        if not results:
            logger.info("[Lens] No more results.")
            break

        for doc in results:
            yield doc

        fetched += len(results)
        logger.info("[Lens] Fetched %d records so far (batch=%d).", fetched, len(results))

        scroll_id = data.get("scroll_id")
        if not scroll_id:
            break
