"""
Import a downloaded Kaggle (or any CSV) patent dataset into the Patent table.

Kaggle patent datasets use wildly different column names depending on the
source (USPTO exports, Google Patents Public Data dumps, CPC classification
datasets, etc). This script auto-detects the most likely column for each
field instead of assuming exact headers, so it should work against most
patent CSVs without editing.

USAGE:
    python import_patents_csv.py path/to/your_dataset.csv

    # Only import the first N rows (useful for a quick test before the full run):
    python import_patents_csv.py path/to/your_dataset.csv --limit 100

    # Point at a specific database instead of the one in your .env:
    DATABASE_URL="postgresql://...External Database URL from Render..." \
        python import_patents_csv.py path/to/your_dataset.csv

WHAT IT DOES:
  1. Reads the CSV in chunks (works fine even on large files)
  2. Auto-maps columns to: title, patent_number, assignee, filing_date,
     patent_classification, technology_domain, citation_count, abstract
  3. Skips rows missing a title (the one field the model requires)
  4. Fills in sensible defaults for anything missing (e.g. assignee -> "Unknown",
     technology_domain -> guessed from title/abstract keywords if not present)
  5. Deduplicates against patent_number so re-running is always safe
  6. Bulk-inserts in batches of 1000 for speed

Run this from inside backend/ (same folder as seed_patents_bulk.py), so it
can import the same app.database / app.models.patent modules.
"""
import argparse
import csv
import re
import sys
from datetime import datetime

from app.database import SessionLocal, Base, engine
from app.models.patent import Patent

FIELD_ALIASES = {
    "title": ["title", "patent_title", "invention_title", "name"],
    "patent_number": ["patent_number", "patentnumber", "publication_number",
                       "patent_id", "id", "doc_number", "number"],
    "assignee": ["assignee", "assignee_name", "company", "organization",
                 "applicant", "current_assignee", "owner"],
    "filing_date": ["filing_date", "application_date", "date_filed",
                     "priority_date", "filed_date"],
    "patent_classification": ["patent_classification", "cpc", "cpc_code", "classification",
                               "main_cpc", "ipc", "ipc_code"],
    "citation_count": ["citation_count", "citations", "num_citations",
                        "forward_citations", "cited_by_count"],
    "abstract": ["abstract", "summary", "description"],
    "technology_domain": ["technology_domain", "domain", "field", "category", "topic"],
}

DOMAIN_KEYWORDS = {
    "Machine Learning": ["machine learning", "neural network", "deep learning", "training model"],
    "NLP": ["natural language", "language model", "text processing", "speech recognition"],
    "Computer Vision": ["image recognition", "object detection", "computer vision", "facial recognition"],
    "Cybersecurity": ["encryption", "intrusion", "malware", "authentication", "cybersecurity"],
    "Healthcare AI": ["diagnos", "medical imaging", "patient", "clinical", "biomarker"],
    "Biotechnology": ["gene", "protein", "crispr", "antibody", "dna", "biotech"],
    "Edge Computing": ["edge computing", "iot", "sensor network", "embedded device"],
    "Robotics": ["robot", "actuator", "manipulator", "autonomous navigation"],
    "Quantum Computing": ["quantum", "qubit"],
    "Renewable Energy": ["solar", "battery", "wind turbine", "renewable energy"],
    "Fintech": ["blockchain", "cryptocurrency", "financial transaction", "payment processing"],
    "Autonomous Systems": ["autonomous vehicle", "self-driving", "collision avoidance"],
}


def normalize(name: str) -> str:
    return re.sub(r"[^a-z]", "", name.lower())


def build_column_map(headers):
    normalized_headers = {normalize(h): h for h in headers}
    mapping = {}
    for field, aliases in FIELD_ALIASES.items():
        for alias in aliases:
            key = normalize(alias)
            if key in normalized_headers:
                mapping[field] = normalized_headers[key]
                break
    return mapping


def guess_domain(title: str, abstract: str) -> list:
    text = f"{title} {abstract}".lower()
    matches = [d for d, kws in DOMAIN_KEYWORDS.items() if any(kw in text for kw in kws)]
    return matches or ["Uncategorized"]


def parse_date(value):
    if not value:
        return None
    value = str(value).strip()
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d-%m-%Y", "%Y/%m/%d", "%B %d, %Y", "%Y"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


def parse_int(value, default=0):
    try:
        return int(float(value))
    except (ValueError, TypeError):
        return default


def import_csv(path: str, limit, batch_size: int = 1000):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    with open(path, newline="", encoding="utf-8-sig", errors="replace") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            print("Could not read any columns from this CSV — check the file.")
            return
        colmap = build_column_map(reader.fieldnames)

        print("Detected column mapping:")
        for field, aliases in FIELD_ALIASES.items():
            print(f"  {field:22s} -> {colmap.get(field, '(not found — will use a default)')}")
        if "title" not in colmap:
            print("\nNo title-like column found. Cannot proceed — check your CSV headers with:")
            print(f"  head -1 {path}")
            sys.exit(1)

        existing = {p[0] for p in db.query(Patent.patent_number).all() if p[0]}
        print(f"\n{len(existing)} patents already in database. Importing...")

        batch = []
        seen_in_file = set()
        imported = 0
        skipped_no_title = 0
        skipped_duplicate = 0
        row_count = 0

        for row in reader:
            row_count += 1
            if limit and row_count > limit:
                break

            title = (row.get(colmap.get("title", ""), "") or "").strip()
            if not title:
                skipped_no_title += 1
                continue

            patent_number = (row.get(colmap.get("patent_number", ""), "") or "").strip() or None
            if patent_number and (patent_number in existing or patent_number in seen_in_file):
                skipped_duplicate += 1
                continue
            if patent_number:
                seen_in_file.add(patent_number)

            assignee = (row.get(colmap.get("assignee", ""), "") or "").strip() or "Unknown"
            abstract = (row.get(colmap.get("abstract", ""), "") or "").strip() or None
            filing_date = parse_date(row.get(colmap.get("filing_date", ""), ""))
            classification = (row.get(colmap.get("patent_classification", ""), "") or "").strip() or None
            citation_count = parse_int(row.get(colmap.get("citation_count", ""), ""), default=0)

            if "technology_domain" in colmap:
                raw_domain = (row.get(colmap["technology_domain"], "") or "").strip()
                domains = [d.strip() for d in re.split(r"[;,|]", raw_domain) if d.strip()] or guess_domain(title, abstract or "")
            else:
                domains = guess_domain(title, abstract or "")

            batch.append({
                "title": title[:500],
                "patent_number": patent_number,
                "assignee": assignee[:255],
                "filing_date": filing_date,
                "patent_classification": (classification or "")[:100] or None,
                "technology_domain": domains,
                "citation_count": citation_count,
                "abstract": abstract,
                "source": "kaggle-import",
            })

            if len(batch) >= batch_size:
                db.bulk_insert_mappings(Patent, batch)
                db.commit()
                imported += len(batch)
                print(f"  imported {imported}...")
                batch = []

        if batch:
            db.bulk_insert_mappings(Patent, batch)
            db.commit()
            imported += len(batch)

    total = db.query(Patent).count()
    db.close()
    print(f"\nDone.")
    print(f"  Imported this run:      {imported}")
    print(f"  Skipped (no title):     {skipped_no_title}")
    print(f"  Skipped (duplicate):    {skipped_duplicate}")
    print(f"  Total patents in DB:    {total}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("csv_path", help="Path to the downloaded patent CSV")
    parser.add_argument("--limit", type=int, default=None, help="Only import the first N rows (for a quick test)")
    args = parser.parse_args()
    import_csv(args.csv_path, args.limit)
