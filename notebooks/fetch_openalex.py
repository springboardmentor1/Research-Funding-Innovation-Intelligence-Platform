"""
Fetch scholarly works from the OpenAlex API.
Research Funding & Innovation Intelligence Platform - Milestone 1

OpenAlex requires no API key. Supplying an email address ("polite pool")
grants a faster, more reliable rate limit.
"""

import json
import os
import time
from pathlib import Path

import requests

BASE = "https://api.openalex.org/works"
OUT = Path("data/raw/openalex_works.jsonl")
OUT.parent.mkdir(parents=True, exist_ok=True)

MAILTO = os.getenv("OPENALEX_MAILTO", "shriram@example.com")
TARGET = 10_000          # stop after this many records
PER_PAGE = 200           # API maximum

# Mirrors the patent corpus (CPC G06N) so the two datasets are comparable.
FILTERS = ",".join([
    "from_publication_date:2015-01-01",
    "to_publication_date:2024-12-31",
    "title_and_abstract.search:machine learning OR deep learning OR neural network",
])

# Requesting only the fields we need keeps responses small and fast.
SELECT = ",".join([
    "id", "doi", "title", "publication_year", "type",
    "cited_by_count", "open_access", "primary_topic",
    "authorships", "referenced_works_count", "language",
])


def fetch():
    session = requests.Session()
    session.headers.update({"User-Agent": f"RFIIP/0.1 (mailto:{MAILTO})"})

    cursor = "*"          # OpenAlex cursor pagination: "*" means "start"
    total = 0
    pages = 0

    with OUT.open("w", encoding="utf-8") as fh:
        while cursor and total < TARGET:
            params = {
                "filter": FILTERS,
                "select": SELECT,
                "per-page": PER_PAGE,
                "cursor": cursor,
                "mailto": MAILTO,
            }

            for attempt in range(4):
                r = session.get(BASE, params=params, timeout=30)
                if r.status_code == 200:
                    break
                if r.status_code in (429, 500, 502, 503):
                    wait = 2 ** attempt
                    print(f"  HTTP {r.status_code}, retrying in {wait}s")
                    time.sleep(wait)
                    continue
                r.raise_for_status()
            else:
                raise RuntimeError("OpenAlex unreachable after 4 attempts")

            payload = r.json()
            results = payload.get("results", [])
            if not results:
                break

            for work in results:
                fh.write(json.dumps(work, ensure_ascii=False) + "\n")
            total += len(results)
            pages += 1

            # next_cursor is None on the final page -> loop exits
            cursor = payload.get("meta", {}).get("next_cursor")
            print(f"  page {pages:>3}  total {total:>6}")

            time.sleep(0.1)   # be polite even inside the polite pool

    print(f"\nWrote {total} records to {OUT}")
    return total


if __name__ == "__main__":
    fetch()
