"""
Grants.gov ingestion, stage 2: broaden the search and fetch full detail.

    python notebooks/enrich_grants.py

WHY THIS SCRIPT EXISTS
----------------------
search2 returns an INDEX, not full records. Its fields are:

    id, number, title, agency, agencyCode, openDate, closeDate,
    oppStatus, docType, cfdaList

No description. No eligibility. No award amounts. A recommendation engine
that ranks by text similarity cannot work on titles alone, so we call
fetchOpportunity once per opportunity to get the full record.

This is the LIST/DETAIL pattern: a cheap list endpoint returns summaries, an
expensive detail endpoint returns everything. It is also the N+1 problem -
1 list call plus N detail calls. Unavoidable when the API offers no bulk
detail endpoint, but it is why we cache to disk: run it once, then iterate on
the transform without touching the network again.

We also widen from one keyword to several. A recommendation engine needs
variety - ranking 214 near-identical AI grants demonstrates nothing.
"""

import json
import time
from pathlib import Path

import requests

SEARCH = "https://api.grants.gov/v1/api/search2"
FETCH = "https://api.grants.gov/v1/api/fetchOpportunity"

RAW = Path("data/raw")
RAW.mkdir(parents=True, exist_ok=True)
INDEX_OUT = RAW / "grants_index.jsonl"
DETAIL_OUT = RAW / "grants_detail.jsonl"

KEYWORDS = [
    "artificial intelligence",
    "machine learning",
    "data science",
    "robotics",
    "cybersecurity",
    "biotechnology",
    "clean energy",
    "quantum",
    "materials science",
    "innovation research",
]

ROWS = 100
session = requests.Session()
session.headers.update({"Content-Type": "application/json"})


def post(url: str, body: dict, tries: int = 4) -> dict | None:
    """POST with exponential backoff. Returns None if the record is
    unavailable rather than aborting a 200-record run for one bad id."""
    for attempt in range(tries):
        try:
            r = session.post(url, json=body, timeout=30)
        except requests.RequestException as exc:
            print(f"    network error: {exc}")
            time.sleep(2 ** attempt)
            continue

        if r.status_code == 200:
            return r.json()
        if r.status_code in (429, 500, 502, 503):
            time.sleep(2 ** attempt)
            continue
        print(f"    HTTP {r.status_code} {r.text[:120]}")
        return None
    return None


# ------------------------------------------------------------------ stage 1
def build_index() -> dict[str, dict]:
    """Search every keyword, de-duplicating by opportunity id.

    A dict keyed by id IS the de-duplication - the same grant matching three
    keywords is written once. Using a list here would triple-count it and
    skew every chart you draw later.
    """
    found: dict[str, dict] = {}

    for kw in KEYWORDS:
        start, kw_count = 0, 0
        while True:
            payload = post(SEARCH, {
                "keyword": kw,
                "oppStatuses": "posted",
                "rows": ROWS,
                "startRecordNum": start,
            })
            if not payload:
                break

            data = payload.get("data", {})
            hits = data.get("oppHits", [])
            if not hits:
                break

            for h in hits:
                found.setdefault(h["id"], h)
            kw_count += len(hits)
            start += ROWS

            if len(hits) < ROWS:
                break
            time.sleep(0.2)

        print(f"  {kw:24s} {kw_count:>4} hits   (unique so far: {len(found)})")

    with INDEX_OUT.open("w", encoding="utf-8") as fh:
        for rec in found.values():
            fh.write(json.dumps(rec, ensure_ascii=False) + "\n")

    print(f"\nIndex: {len(found)} unique opportunities -> {INDEX_OUT}")
    return found


# ------------------------------------------------------------------ stage 2
def fetch_details(index: dict[str, dict]) -> int:
    """One fetchOpportunity call per id. Writes incrementally so an
    interrupted run still leaves usable data on disk."""
    written = 0
    fields_reported = False

    with DETAIL_OUT.open("w", encoding="utf-8") as fh:
        for i, opp_id in enumerate(index, 1):
            payload = post(FETCH, {"opportunityId": int(opp_id)})
            if not payload:
                continue

            detail = payload.get("data", payload)

            if not fields_reported:
                print("\n=== DETAIL SHAPE ===")
                print("keys:", sorted(detail.keys()))
                syn = detail.get("synopsis") or {}
                if isinstance(syn, dict):
                    print("synopsis keys:", sorted(syn.keys()))
                print("====================\n")
                fields_reported = True

            # keep the index fields alongside the detail so nothing is lost
            detail["_index"] = index[opp_id]
            fh.write(json.dumps(detail, ensure_ascii=False) + "\n")
            written += 1

            if i % 25 == 0:
                print(f"  detail {i}/{len(index)}")
            time.sleep(0.15)

    print(f"\nDetails: {written} records -> {DETAIL_OUT}")
    return written


if __name__ == "__main__":
    print("STAGE 1: searching keywords\n")
    idx = build_index()

    print("\nSTAGE 2: fetching full detail")
    fetch_details(idx)
