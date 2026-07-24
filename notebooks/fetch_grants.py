"""
Fetch open funding opportunities from the Grants.gov search2 API.

    python notebooks/fetch_grants.py

No API key. No registration. POST JSON, get JSON back.

Two things differ from fetch_openalex.py, and both are worth noticing:

1. PAGINATION STYLE. OpenAlex uses a CURSOR ("give me the next page after
   this marker"). Grants.gov uses an OFFSET ("give me 100 rows starting at
   row 300"). Offsets are simpler but fragile: if a new grant is posted while
   you are paging, every subsequent row shifts by one and you silently skip a
   record. Cursors survive that. For a one-shot ingest the risk is acceptable.

2. SCHEMA DISCOVERY. The Grants.gov docs warn that the records array may be
   called oppHits, items, or opportunities depending on environment. Rather
   than hardcode a guess, this script probes the response and PRINTS the real
   field names it found. Do not assume a schema you have not seen.
"""

import json
import time
from pathlib import Path

import requests

API = "https://api.grants.gov/v1/api/search2"
OUT = Path("data/raw/grants.jsonl")
OUT.parent.mkdir(parents=True, exist_ok=True)

ROWS = 100          # records per request
TARGET = 3000       # stop after this many
KEYWORD = "artificial intelligence"


def find_records(payload: dict) -> tuple[list, str]:
    """Locate the records array without assuming its name."""
    data = payload.get("data", payload)
    for key in ("oppHits", "items", "opportunities", "hits"):
        if isinstance(data.get(key), list):
            return data[key], key
    # nothing matched - show what IS there so we can adapt
    raise KeyError(
        f"No known records key. data contains: {list(data.keys())}"
    )


def find_total(payload: dict) -> int:
    data = payload.get("data", payload)
    for key in ("hitCount", "totalRecords", "total", "count"):
        if isinstance(data.get(key), int):
            return data[key]
    return 0


def fetch() -> int:
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})

    start = 0
    total_written = 0
    records_key = None

    with OUT.open("w", encoding="utf-8") as fh:
        while total_written < TARGET:
            body = {
                "keyword": KEYWORD,
                "oppStatuses": "posted",   # only opportunities still open
                "rows": ROWS,
                "startRecordNum": start,
            }

            for attempt in range(4):
                r = session.post(API, json=body, timeout=30)
                if r.status_code == 200:
                    break
                if r.status_code in (429, 500, 502, 503):
                    wait = 2 ** attempt
                    print(f"  HTTP {r.status_code}, retry in {wait}s")
                    time.sleep(wait)
                    continue
                print(f"  HTTP {r.status_code}: {r.text[:300]}")
                r.raise_for_status()
            else:
                raise RuntimeError("Grants.gov unreachable after 4 attempts")

            payload = r.json()

            # ---- first page only: report what we actually received --------
            if records_key is None:
                data = payload.get("data", payload)
                print("\n=== RESPONSE SHAPE ===")
                print("top-level keys :", list(payload.keys()))
                print("data keys      :", list(data.keys())[:15])

            records, records_key = find_records(payload)
            if not records:
                print("  empty page - stopping")
                break

            if total_written == 0:
                print("record fields  :", sorted(records[0].keys()))
                print("sample record  :")
                print(json.dumps(records[0], indent=2)[:800])
                print("total matching :", find_total(payload))
                print("======================\n")

            for rec in records:
                fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
            total_written += len(records)
            start += ROWS

            print(f"  fetched {total_written}")

            if len(records) < ROWS:      # short page = last page
                break
            time.sleep(0.2)

    print(f"\nWrote {total_written} records to {OUT}")
    return total_written


if __name__ == "__main__":
    fetch()
