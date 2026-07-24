"""
Load Lens patent CSV exports into PostgreSQL.

    cd backend
    python -m app.etl.load_patents

WHY NO MONGO STAGE HERE
-----------------------
tech_stack.md says MongoDB is the landing zone for raw, schema-unstable API
payloads. A Lens CSV export is already flat, already tabular, and already on
disk - Mongo would add a hop and buy nothing. The asymmetry is the reasoning
applied consistently, not an exception to it.
"""

from pathlib import Path

import pandas as pd
from sqlalchemy.dialects.postgresql import insert

from app.db import SessionLocal
from app.models import Patent

# load_patents.py lives at <root>/backend/app/etl/load_patents.py
#   parents[0]=etl  [1]=app  [2]=backend  [3]=<root>
ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "data" / "raw"

MULTI = ";;"          # Lens packs multiple values into one cell with this
BATCH = 500           # rows per database round-trip

# Only the columns we model. Reading 12 of 37 keeps memory and parse time down.
USECOLS = [
    "Lens ID", "Title", "Abstract", "Jurisdiction", "Publication Year",
    "Document Type", "Legal Status", "Cites Patent Count",
    "Cited by Patent Count", "Simple Family Size", "Applicants",
    "CPC Classifications",
]


def split_multi(value) -> list[str]:
    """'A;;B;;A' -> ['A', 'B']

    Two things happen here and both matter:
      - split on ';;', because these are multi-valued cells, not single strings
      - de-duplicate with set(), because Lens genuinely repeats values
        (you saw 'G06N20/00;;G06N20/00' in a real record on July 9)

    Skip either step and every count you compute downstream is wrong.
    """
    if pd.isna(value):
        return []
    return sorted({p.strip() for p in str(value).split(MULTI) if p.strip()})


def to_int(value, default: int = 0) -> int:
    """Coerce to int, surviving NaN, '', and '1,234'."""
    if pd.isna(value):
        return default
    try:
        return int(float(str(value).replace(",", "")))
    except (ValueError, TypeError):
        return default


def to_str(value) -> str | None:
    if pd.isna(value):
        return None
    s = str(value).strip()
    return s or None


def load() -> int:
    files = sorted(RAW.glob("lens_patents_*.csv"))
    if not files:
        raise FileNotFoundError(f"No lens_patents_*.csv in {RAW}")

    frames = []
    for f in files:
        df = pd.read_csv(f, usecols=lambda c: c in USECOLS, low_memory=False)
        frames.append(df)
        print(f"  {f.name:28s} {len(df):>5} rows")

    df = pd.concat(frames, ignore_index=True)

    # Two records with the same Lens ID would violate the unique constraint
    # inside a single batch, which ON CONFLICT cannot resolve (it handles
    # conflicts against EXISTING rows, not duplicates within one statement).
    before = len(df)
    df = df.drop_duplicates(subset=["Lens ID"])
    print(f"\n  {before} rows -> {len(df)} unique Lens IDs")

    rows = []
    for rec in df.to_dict("records"):
        lens_id = to_str(rec.get("Lens ID"))
        if not lens_id:
            continue
        rows.append({
            "lens_id": lens_id,
            "title": to_str(rec.get("Title")),
            "abstract": to_str(rec.get("Abstract")),
            "jurisdiction": to_str(rec.get("Jurisdiction")),
            "publication_year": to_int(rec.get("Publication Year"), 0) or None,
            "document_type": to_str(rec.get("Document Type")),
            "legal_status": to_str(rec.get("Legal Status")),
            "cited_by_count": to_int(rec.get("Cited by Patent Count")),
            "cites_count": to_int(rec.get("Cites Patent Count")),
            "simple_family_size": to_int(rec.get("Simple Family Size"), 1),
            "applicants": split_multi(rec.get("Applicants")),
            "cpc_codes": split_multi(rec.get("CPC Classifications")),
        })

    written = 0
    with SessionLocal() as db:
        for i in range(0, len(rows), BATCH):
            chunk = rows[i:i + BATCH]

            # UPSERT. Re-running this script must not duplicate rows and must
            # not crash. ON CONFLICT DO UPDATE means "insert, or if lens_id
            # already exists, refresh it". That property is called
            # IDEMPOTENCE and it is what makes an ETL job safe to re-run
            # after a partial failure.
            stmt = insert(Patent).values(chunk)
            stmt = stmt.on_conflict_do_update(
                index_elements=["lens_id"],
                set_={
                    c: stmt.excluded[c]           # excluded = the row that
                    for c in chunk[0]             # would have been inserted
                    if c != "lens_id"
                },
            )
            db.execute(stmt)
            written += len(chunk)
            print(f"  upserted {written}/{len(rows)}")

        # One commit for the whole load, not one per row. A commit forces a
        # disk flush; 10,000 of them would take minutes instead of seconds.
        db.commit()

    print(f"\nLoaded {written} patents.")
    return written


if __name__ == "__main__":
    load()
