"""
Load OpenAlex works into MongoDB (raw) and PostgreSQL (clean).

    cd backend
    python -m app.etl.load_publications

TWO STAGES, ON PURPOSE
----------------------
  stage 1   raw JSON -> MongoDB, unmodified
  stage 2   MongoDB  -> PostgreSQL, flattened and typed

Why bother with stage 1 when the JSONL is already on disk? Because that is
the architecture recorded in tech_stack.md: MongoDB is the landing zone for
deeply nested, schema-unstable API payloads. OpenAlex can add or rename a
nested field without warning. Keeping the untouched record means a bug in
your flattening logic costs a re-run of stage 2, not a re-fetch of 10,000
records from the network.

Stage 1 is skipped automatically if MongoDB is unreachable, so a Mongo
outage does not block the load.
"""

import json
from pathlib import Path

from sqlalchemy.dialects.postgresql import insert

from app.core.config import settings
from app.db import SessionLocal
from app.models import Publication

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "data" / "raw" / "openalex_works.jsonl"
BATCH = 500


# ------------------------------------------------------------------ stage 1
def load_to_mongo() -> int:
    """Store raw payloads. Returns 0 and warns if Mongo is unavailable."""
    try:
        from pymongo import MongoClient
        from pymongo.errors import PyMongoError

        client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=3000)
        client.admin.command("ping")          # fail fast if not running
        coll = client[settings.MONGO_DB]["openalex_raw"]

        docs, total = [], 0
        with RAW.open(encoding="utf-8") as fh:
            for line in fh:
                rec = json.loads(line)
                rec["_id"] = rec["id"]        # OpenAlex id as the Mongo key
                docs.append(rec)              # makes re-runs idempotent
                if len(docs) >= BATCH:
                    _upsert_mongo(coll, docs)
                    total += len(docs)
                    docs = []
        if docs:
            _upsert_mongo(coll, docs)
            total += len(docs)

        print(f"  mongo: {total} raw documents in {settings.MONGO_DB}.openalex_raw")
        return total

    except Exception as exc:
        print(f"  mongo unavailable ({type(exc).__name__}) - skipping raw stage")
        return 0


def _upsert_mongo(coll, docs):
    from pymongo import ReplaceOne
    coll.bulk_write(
        [ReplaceOne({"_id": d["_id"]}, d, upsert=True) for d in docs],
        ordered=False,
    )


# ------------------------------------------------------------------ stage 2
def flatten(work: dict) -> dict | None:
    """Nested OpenAlex JSON -> one flat row.

    Every `or {}` below is defensive: OpenAlex returns null for
    primary_topic and open_access on some records, and `null.get(...)`
    raises AttributeError. One missing topic should not kill a 10,000-record
    load.
    """
    oid = work.get("id")
    if not oid:
        return None

    topic = work.get("primary_topic") or {}
    field = topic.get("field") or {}
    oa = work.get("open_access") or {}
    authorships = work.get("authorships") or []

    institutions, countries = set(), set()
    for a in authorships:
        for inst in (a.get("institutions") or []):
            if inst.get("display_name"):
                institutions.add(inst["display_name"])
            if inst.get("country_code"):
                countries.add(inst["country_code"])

    return {
        "openalex_id": oid,
        "title": (work.get("title") or None),
        "publication_year": work.get("publication_year"),
        "work_type": work.get("type"),
        "cited_by_count": work.get("cited_by_count") or 0,
        "referenced_works_count": work.get("referenced_works_count") or 0,
        "language": work.get("language"),
        "is_oa": oa.get("is_oa"),
        "topic": topic.get("display_name"),
        "field": field.get("display_name"),
        "n_authors": len(authorships),
        "countries": sorted(countries),
        "institutions": sorted(institutions),
    }


def load_to_postgres() -> int:
    rows, seen = [], set()

    with RAW.open(encoding="utf-8") as fh:
        for line in fh:
            row = flatten(json.loads(line))
            if row and row["openalex_id"] not in seen:
                seen.add(row["openalex_id"])
                rows.append(row)

    print(f"  flattened {len(rows)} unique works")

    written = 0
    with SessionLocal() as db:
        for i in range(0, len(rows), BATCH):
            chunk = rows[i:i + BATCH]
            stmt = insert(Publication).values(chunk)
            stmt = stmt.on_conflict_do_update(
                index_elements=["openalex_id"],
                set_={c: stmt.excluded[c] for c in chunk[0] if c != "openalex_id"},
            )
            db.execute(stmt)
            written += len(chunk)
            print(f"  upserted {written}/{len(rows)}")
        db.commit()

    return written


if __name__ == "__main__":
    if not RAW.exists():
        raise SystemExit(f"Missing {RAW} - run notebooks/fetch_openalex.py first")

    print("STAGE 1: raw -> MongoDB")
    load_to_mongo()

    print("\nSTAGE 2: -> PostgreSQL")
    n = load_to_postgres()
    print(f"\nLoaded {n} publications.")
