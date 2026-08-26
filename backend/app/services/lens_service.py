"""
Lens Patent API service.

Responsibilities:
- Fetching patents from https://api.lens.org/patent/search using scroll API
- Scroll-based pagination (Lens uses scroll_id for deep pagination)
- Retry with exponential backoff on 429/5xx
- Normalising raw Lens API response → GlobalPatent-compatible dict
- Never crashing on malformed records

FIXES applied (see comments marked FIX):
1. _post() now logs resp.text on every non-200 response. Before, only the
   HTTP status code was logged and the actual Lens error message (which
   names the exact bad field/param) was silently discarded — that's why
   the logs only ever showed "[Lens] Permanent error 400" with no detail.
2. iter_patents() continuation payload was missing the "scroll" duration
   key. Lens's scroll API requires "scroll" to be resent on every
   continuation request, not just the first one — without it the scroll
   session can be rejected.
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
SCROLL_DURATION = "1m"

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
                logger.error("[Lens] Invalid JSON in response. Body: %s", resp.text[:1000])
                return None

        if resp.status_code == 429:
            wait = BACKOFF_BASE ** attempt
            logger.warning("[Lens] Rate limited (429). Waiting %ds …", wait)
            time.sleep(wait)
            continue

        if resp.status_code >= 500:
            wait = BACKOFF_BASE ** attempt
            logger.warning("[Lens] Server error %d. Waiting %ds … Body: %s", resp.status_code, wait, resp.text[:1000])
            if attempt == MAX_RETRIES:
                return None
            time.sleep(wait)
            continue

        if resp.status_code == 401:
            # FIX: log body — Lens usually states the exact auth problem here.
            logger.error("[Lens] Authentication failed. Check LENS_API_KEY. Body: %s", resp.text[:1000])
            return None

        # FIX: this branch used to only log the status code. The request
        # payload is included too so you can see exactly what was sent.
        logger.error(
            "[Lens] Permanent error %d. Body: %s | Payload sent: %s",
            resp.status_code, resp.text[:1000], payload,
        )
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

    FIX: rewritten to read from the nested `biblio` / `legal_status` /
    `families` groups, matching the corrected `include` list above. The
    previous version read top-level keys (doc["title"], doc["inventors"],
    etc.) that Lens never actually returns — those fields only exist
    nested under "biblio" in Lens's real response schema.

    NOTE: the exact nested key names below are based on Lens's public API
    docs/examples. If any field keeps coming back None for records where
    you'd expect a value, print one raw `doc` (see the one-time debug log
    at the bottom of iter_patents) and adjust the .get() path to match
    what Lens actually sent — Lens's schema has some version-to-version
    variation (e.g. "owners_all" vs "assignees").
    """
    try:
        lens_id = doc.get("lens_id")
        if not lens_id:
            return None

        biblio = doc.get("biblio") or {}
        legal_status = doc.get("legal_status") or {}
        families = doc.get("families") or {}

        title = _extract_text(biblio.get("invention_title"))
        if not title or not title.strip():
            return None

        abstract = _extract_text(doc.get("abstract"))

        parties = biblio.get("parties") or {}

        # Inventors
        inventor_list = parties.get("inventors") or []
        if not isinstance(inventor_list, list):
            inventor_list = []
        inventors = [
            inv.get("extracted_name", {}).get("value") or inv.get("display_name")
            for inv in inventor_list
            if isinstance(inv, dict) and (inv.get("extracted_name", {}).get("value") or inv.get("display_name"))
        ]

        # Assignee — Lens calls this "owners_all"; fall back to applicants
        assignees = parties.get("owners_all") or parties.get("applicants") or []
        if not isinstance(assignees, list):
            assignees = []
        assignee = None
        if assignees and isinstance(assignees[0], dict):
            first = assignees[0]
            assignee = first.get("extracted_name", {}).get("value") or first.get("display_name")

        # Dates
        app_ref = biblio.get("application_reference") or {}
        pub_ref = biblio.get("publication_reference") or {}
        filing_date = _parse_date(app_ref.get("date"))
        pub_date = _parse_date(pub_ref.get("date"))

        # Patent number — prefer publication_reference doc_number
        patent_number = pub_ref.get("doc_number") or app_ref.get("doc_number") or None

        # Classification (IPC) — classifications_ipcr is a dict like
        # {"classifications": [{"symbol": "G06N5/04", ...}, ...]}, NOT a
        # bare list. Iterating it directly (the old bug) walked its string
        # keys instead of the actual classification dicts, causing
        # "'str' object has no attribute 'get'" on every single record.
        classifications = (biblio.get("classifications_ipcr") or {}).get("classifications") or []
        classification_codes = [
            c.get("symbol") for c in classifications if isinstance(c, dict) and c.get("symbol")
        ]
        classification = ", ".join(classification_codes) if classification_codes else None

        status = "GRANTED" if legal_status.get("granted") else "FILED"

        # Jurisdiction
        jurisdiction = (
            doc.get("jurisdiction")
            or pub_ref.get("jurisdiction")
            or app_ref.get("jurisdiction")
            or (patent_number[:2] if patent_number and len(patent_number) >= 2 else None)
        )

        url = f"https://www.lens.org/lens/patent/{lens_id}"

        # Minimal raw snapshot
        raw = {
            "lens_id": lens_id,
            "granted": legal_status.get("granted"),
            "family_id": (families.get("simple_family") or {}).get("family_id"),
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
            # FIX: "scroll" duration must be resent on every continuation
            # request — it was missing here before, which can cause Lens
            # to reject the continuation request.
            payload = {"scroll_id": scroll_id, "scroll": SCROLL_DURATION, "size": remaining}
        else:
            # FIX: Lens rejected the old flat field names ("title",
            # "inventors", "filing_date", etc.) with "Unrecognized fields".
            # Lens's actual schema nests almost everything under top-level
            # groups (confirmed against Lens's own API docs/examples) — you
            # request the group and it returns everything inside it:
            #   biblio        -> invention_title, parties (inventors/
            #                     applicants/owners_all), application_
            #                     reference, publication_reference,
            #                     classifications_ipcr, etc.
            #   legal_status  -> granted, patent_status, etc.
            #   families      -> family grouping info
            # Only lens_id, abstract, jurisdiction were valid as flat names.
            payload = {
                "query": {
                    "query_string": {
                        "query": query,
                        "default_operator": "AND",
                    }
                },
                "size": remaining,
                "scroll": SCROLL_DURATION,
                "include": ["lens_id", "biblio", "abstract", "legal_status", "families", "jurisdiction"],
            }

        data = _post(payload)
        if not data:
            logger.error("[Lens] Failed to fetch page. Stopping.")
            break

        results = data.get("data") or []
        if not results:
            logger.info("[Lens] No more results.")
            break

        if fetched == 0:
            # One-time debug dump so field-name mismatches (if any remain)
            # can be spotted by eye against what Lens actually sent.
            logger.info("[Lens] Sample raw record: %s", results[0])

        for doc in results:
            yield doc

        fetched += len(results)
        logger.info("[Lens] Fetched %d records so far (batch=%d).", fetched, len(results))

        scroll_id = data.get("scroll_id")
        if not scroll_id:
            break