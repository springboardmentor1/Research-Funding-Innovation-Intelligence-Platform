"""
Load Grants.gov opportunity details into MongoDB (raw) and PostgreSQL (clean).

    cd backend
    python -m app.etl.load_funding

THE SHAPE WE ARE UNPACKING
--------------------------
fetchOpportunity returns a record where the interesting fields are nested
one level down, inside `synopsis`:

    {
      "id": 320753,
      "opportunityTitle": "...",
      "opportunityNumber": "PD-19-127Y",
      "opportunityCategory": {...},
      "cfdas": [...],
      "agencyDetails": {...},
      "synopsis": {
          "synopsisDesc":   "<p>HTML description...</p>",   <- the text we rank on
          "awardCeiling":   500000,
          "awardFloor":     50000,
          "applicantTypes": [{"id": "25", "description": "..."}],
          "responseDate":   <close date>,
          "postingDate":    <posted date>,
          "agencyName":     "..."
      }
    }

Three things make this messy, and all three are normal for government APIs:

  1. synopsisDesc contains HTML, not plain text. TF-IDF would happily treat
     "<p>" and "href" as meaningful vocabulary, so we strip tags first.
  2. Dates arrive in more than one form - epoch milliseconds in one field,
     MM/DD/YYYY strings in the matching *Str field. We try both.
  3. List fields hold either dicts ({"description": "..."}) or bare strings
     depending on the record. We normalise both.

Rather than assume, this script PRINTS what it parsed from the first record
so you can verify the mapping is real before trusting 1,100 rows of it.
"""

import html
import json
import re
from datetime import date, datetime
from pathlib import Path

from sqlalchemy.dialects.postgresql import insert

from app.core.config import settings
from app.db import SessionLocal
from app.models import FundingOpportunity

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "data" / "raw" / "grants_detail.jsonl"
BATCH = 200

TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")


# ------------------------------------------------------------------ helpers
def strip_html(value) -> str | None:
    """'<p>Fund&amp;ing</p>' -> 'Fund&ing'

    Order matters: remove tags first, then unescape entities. Doing it the
    other way round would turn '&lt;script&gt;' into a real tag.
    """
    if not value:
        return None
    text = TAG_RE.sub(" ", str(value))
    text = html.unescape(text)
    text = WS_RE.sub(" ", text).strip()
    return text or None


def parse_date(*candidates) -> date | None:
    """Return the first candidate that parses as a date.

    Handles epoch milliseconds (int), MM/DD/YYYY, and YYYY-MM-DD, because
    this API uses all three depending on which field you read.
    """
    for c in candidates:
        if c in (None, "", 0):
            continue
        # epoch milliseconds
        if isinstance(c, (int, float)):
            try:
                return datetime.fromtimestamp(c / 1000).date()
            except (ValueError, OSError, OverflowError):
                continue
        s = str(c).strip()
        for fmt in ("%m/%d/%Y", "%Y-%m-%d", "%b %d, %Y"):
            try:
                return datetime.strptime(s, fmt).date()
            except ValueError:
                continue
    return None


def parse_money(value) -> float | None:
    """'$1,000,000' or 1000000 -> 1000000.0"""
    if value in (None, ""):
        return None
    try:
        return float(re.sub(r"[^0-9.\-]", "", str(value)) or 0)
    except (ValueError, TypeError):
        return None


def as_labels(value) -> list[str]:
    """Normalise a list that may hold dicts or plain strings."""
    if not value:
        return []
    out = []
    for item in value if isinstance(value, list) else [value]:
        if isinstance(item, dict):
            label = (item.get("description") or item.get("name")
                     or item.get("title") or item.get("id"))
            if label:
                out.append(str(label).strip())
        elif item:
            out.append(str(item).strip())
    return sorted(set(out))


def agency_name(detail: dict, syn: dict) -> str | None:
    for src in (syn.get("agencyName"),
                (detail.get("agencyDetails") or {}).get("agencyName"),
                (detail.get("topAgencyDetails") or {}).get("agencyName"),
                (detail.get("_index") or {}).get("agency")):
        if src:
            return str(src).strip()
    return None


# ------------------------------------------------------------------ transform
def transform(detail: dict) -> dict | None:
    opp_id = detail.get("id") or (detail.get("_index") or {}).get("id")
    if not opp_id:
        return None

    syn = detail.get("synopsis") or {}
    idx = detail.get("_index") or {}

    category = detail.get("opportunityCategory")
    if isinstance(category, dict):
        category = category.get("description") or category.get("category")

    eligibility = as_labels(syn.get("applicantTypes"))
    activity = as_labels(syn.get("fundingActivityCategories"))

    title = (detail.get("opportunityTitle") or idx.get("title") or "").strip()

    return {
        "external_id": str(opp_id),
        "source": "grants.gov",
        "title": title or "(untitled)",
        "agency": agency_name(detail, syn),
        "description": strip_html(syn.get("synopsisDesc")),
        "close_date": parse_date(syn.get("responseDateStr"),
                                 syn.get("responseDate"),
                                 idx.get("closeDate")),
        "posted_date": parse_date(syn.get("postingDateStr"),
                                  syn.get("postingDate"),
                                  idx.get("openDate")),
        "award_floor": parse_money(syn.get("awardFloor")),
        "award_ceiling": parse_money(syn.get("awardCeiling")),
        # activity categories are more descriptive than the D/M category code
        "category": (activity[0] if activity else category) or None,
        "eligibility_codes": eligibility,
        "url": f"https://grants.gov/search-results-detail/{opp_id}",
    }


# ------------------------------------------------------------------ mongo
def load_to_mongo() -> int:
    try:
        from pymongo import MongoClient, ReplaceOne

        client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=3000)
        client.admin.command("ping")
        coll = client[settings.MONGO_DB]["grants_raw"]

        ops, total = [], 0
        with RAW.open(encoding="utf-8") as fh:
            for line in fh:
                rec = json.loads(line)
                key = rec.get("id") or (rec.get("_index") or {}).get("id")
                if not key:
                    continue
                rec["_id"] = str(key)
                ops.append(ReplaceOne({"_id": rec["_id"]}, rec, upsert=True))
                if len(ops) >= BATCH:
                    coll.bulk_write(ops, ordered=False)
                    total += len(ops)
                    ops = []
        if ops:
            coll.bulk_write(ops, ordered=False)
            total += len(ops)

        print(f"  mongo: {total} raw documents in {settings.MONGO_DB}.grants_raw")
        return total
    except Exception as exc:
        print(f"  mongo unavailable ({type(exc).__name__}) - skipping raw stage")
        return 0


# ------------------------------------------------------------------ postgres
def load_to_postgres() -> int:
    rows, seen = [], set()
    reported = False

    with RAW.open(encoding="utf-8") as fh:
        for line in fh:
            row = transform(json.loads(line))
            if not row or row["external_id"] in seen:
                continue
            seen.add(row["external_id"])
            rows.append(row)

            if not reported:
                print("\n=== FIRST PARSED ROW (verify this looks right) ===")
                for k, v in row.items():
                    s = str(v)
                    print(f"  {k:18s} {s[:90]}{'...' if len(s) > 90 else ''}")
                print("==================================================\n")
                reported = True

    with_desc = sum(1 for r in rows if r["description"])
    with_close = sum(1 for r in rows if r["close_date"])
    with_award = sum(1 for r in rows if r["award_ceiling"])
    print(f"  parsed {len(rows)} opportunities")
    print(f"    with description : {with_desc}")
    print(f"    with close date  : {with_close}")
    print(f"    with award range : {with_award}")

    written = 0
    with SessionLocal() as db:
        for i in range(0, len(rows), BATCH):
            chunk = rows[i:i + BATCH]
            stmt = insert(FundingOpportunity).values(chunk)
            stmt = stmt.on_conflict_do_update(
                index_elements=["external_id"],
                set_={c: stmt.excluded[c] for c in chunk[0] if c != "external_id"},
            )
            db.execute(stmt)
            written += len(chunk)
        db.commit()

    return written


if __name__ == "__main__":
    if not RAW.exists():
        raise SystemExit(f"Missing {RAW} - run notebooks/enrich_grants.py first")

    print("STAGE 1: raw -> MongoDB")
    load_to_mongo()

    print("\nSTAGE 2: -> PostgreSQL")
    n = load_to_postgres()
    print(f"\nLoaded {n} funding opportunities.")
