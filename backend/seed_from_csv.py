"""
seed_from_csv.py  (v2 - matches actual DB schema)
==================================================
Loads the processed CSV datasets into PostgreSQL.

Tables:
  funding_opportunities  -- adds missing columns then seeds 5000 funding rows
  global_patents         -- seeds 5000 patent rows  (Google Patents URLs)
  patents                -- seeds 20 real patents per existing user

Run:  .\\venv\\Scripts\\python.exe seed_from_csv.py
"""

import os, sys, uuid
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

import pandas as pd
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from app.utils.validators import is_valid_url

DATABASE_URL = os.getenv("DATABASE_URL")
engine  = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db      = Session()

BASE        = os.path.dirname(os.path.abspath(__file__))
FUNDING_CSV = os.path.abspath(os.path.join(BASE, "../datasets/processed/funding/funding_processed.csv"))
PATENTS_CSV = os.path.abspath(os.path.join(BASE, "../datasets/processed/patents/patents_processed.csv"))

def banner(t): print("\n" + "="*60 + f"\n  {t}\n" + "="*60)

def safe_str(val, max_len=None):
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    s = str(val).strip()
    return (s[:max_len] if max_len else s) or None

def safe_float(val):
    try: return float(val)
    except: return None

def safe_date(val):
    if not val or (isinstance(val, float) and pd.isna(val)):
        return None
    try: return pd.to_datetime(str(val)).date()
    except: return None

def col_exists(table, col):
    insp = inspect(engine)
    return any(c["name"] == col for c in insp.get_columns(table))

# ============================================================
#  1. FUNDING  EDA
# ============================================================
banner("FUNDING DATASET EDA")
df_fund = pd.read_csv(FUNDING_CSV)
print(f"Shape        : {df_fund.shape}")
print(f"Status dist  :\n{df_fund['status'].value_counts()}")
print(f"Country dist :\n{df_fund['country'].value_counts()}")
print(f"Top agencies :\n{df_fund['funding_agency'].value_counts().head(8)}")
print(f"Top domains  :\n{df_fund['research_domain'].value_counts().head(10)}")
print(f"Amount stats :\n{df_fund['funding_amount'].describe()}")
df_fund["funding_amount"] = pd.to_numeric(df_fund["funding_amount"], errors="coerce").fillna(0.0)

# ============================================================
#  2. ALTER funding_opportunities – add missing columns
# ============================================================
banner("PATCHING funding_opportunities SCHEMA")

ADD_COLS = [
    ("funding_id",      "VARCHAR(120) UNIQUE"),
    ("funding_agency",  "VARCHAR(255)"),
    ("funding_type",    "VARCHAR(100)"),
    ("research_domain", "VARCHAR(255)"),
    ("keywords",        "TEXT"),
    ("currency",        "VARCHAR(10) DEFAULT 'USD'"),
    ("duration",        "VARCHAR(50)"),
    ("country",         "VARCHAR(50)"),
    ("status",          "VARCHAR(50) DEFAULT 'OPEN'"),
    ("source_url",      "TEXT"),
    ("verified",        "BOOLEAN DEFAULT FALSE"),
]

for col_name, col_def in ADD_COLS:
    if not col_exists("funding_opportunities", col_name):
        db.execute(text(f"ALTER TABLE funding_opportunities ADD COLUMN {col_name} {col_def}"))
        db.commit()
        print(f"  + Added column: {col_name}")
    else:
        print(f"  - Column exists: {col_name}")

# ============================================================
#  3. SEED funding_opportunities
# ============================================================
banner("SEEDING funding_opportunities")

existing = db.execute(text("SELECT COUNT(*) FROM funding_opportunities")).scalar()
print(f"Existing rows: {existing}")

ins = skp = 0
for _, row in df_fund.iterrows():
    fid = safe_str(row.get("funding_id"), 120)
    if not fid:
        skp += 1; continue

    dup = db.execute(
        text("SELECT 1 FROM funding_opportunities WHERE funding_id = :fid"),
        {"fid": fid}
    ).scalar()
    if dup:
        skp += 1; continue

    app_url  = safe_str(row.get("application_url"), 1000)
    deadline = safe_date(row.get("application_deadline"))
    title    = safe_str(row.get("funding_title"), 500) or "Untitled"
    desc     = safe_str(row.get("description"), 4000)

    db.execute(text("""
        INSERT INTO funding_opportunities
            (title, description, funding_amount, deadline, eligibility,
             application_url, created_at,
             funding_id, funding_agency, funding_type, research_domain,
             keywords, currency, duration, country, status, source_url, verified)
        VALUES
            (:title, :description, :funding_amount, :deadline, :eligibility,
             :application_url, :created_at,
             :funding_id, :funding_agency, :funding_type, :research_domain,
             :keywords, :currency, :duration, :country, :status, :source_url, :verified)
    """), {
        "title":            title,
        "description":      desc,
        "funding_amount":   safe_float(row.get("funding_amount")),
        "deadline":         deadline,
        "eligibility":      safe_str(row.get("eligibility"), 500),
        "application_url":  app_url,
        "created_at":       datetime.utcnow(),
        "funding_id":       fid,
        "funding_agency":   safe_str(row.get("funding_agency"), 255),
        "funding_type":     safe_str(row.get("funding_type"), 100),
        "research_domain":  safe_str(row.get("research_domain"), 255),
        "keywords":         safe_str(row.get("keywords"), 1000),
        "currency":         safe_str(row.get("currency"), 10) or "USD",
        "duration":         safe_str(row.get("duration"), 50),
        "country":          safe_str(row.get("country"), 50),
        "status":           safe_str(row.get("status"), 50) or "OPEN",
        "source_url":       app_url,
        "verified":         is_valid_url(app_url),
    })
    ins += 1
    if ins % 500 == 0:
        db.commit()
        print(f"  ... {ins} funding rows inserted")

db.commit()
total_f = db.execute(text("SELECT COUNT(*) FROM funding_opportunities")).scalar()
print(f"Done: {ins} inserted, {skp} skipped. Total = {total_f}")

# ============================================================
#  4. PATENTS EDA
# ============================================================
banner("PATENTS DATASET EDA")
df_pat = pd.read_csv(PATENTS_CSV)
print(f"Shape       : {df_pat.shape}")
print(f"Status dist :\n{df_pat['Patent_Status'].value_counts()}")
print(f"Top domains :\n{df_pat['Technology_Domain'].value_counts().head(10)}")
print(f"Countries   :\n{df_pat['Country'].value_counts()}")

# ============================================================
#  5. SEED global_patents
# ============================================================
banner("SEEDING global_patents")

try:
    gp_before = db.execute(text("SELECT COUNT(*) FROM global_patents")).scalar()
    print(f"Existing rows: {gp_before}")
except Exception:
    db.rollback()
    from app.database.connection import Base
    from app.models.global_patent import GlobalPatent
    Base.metadata.create_all(engine, tables=[GlobalPatent.__table__])
    gp_before = 0

gp_ins = gp_skp = 0
for _, row in df_pat.iterrows():
    ext_id = safe_str(row.get("Patent_Number"), 512)
    if not ext_id:
        gp_skp += 1; continue

    dup = db.execute(
        text("SELECT 1 FROM global_patents WHERE external_id=:eid AND source='csv'"),
        {"eid": ext_id}
    ).scalar()
    if dup:
        gp_skp += 1; continue

    # Build Google Patents URL (strip dashes: US-83910871-B2 -> US83910871B2)
    pat_clean = ext_id.replace("-", "")
    google_url = f"https://patents.google.com/patent/{pat_clean}"

    # inventors column is JSON type in global_patents – convert string to list
    import json as _json
    inv_raw = safe_str(row.get("Inventors"), 1000)
    inv_json = _json.dumps([s.strip() for s in inv_raw.split(",")]) if inv_raw else "[]"

    db.execute(text("""
        INSERT INTO global_patents
            (id, external_id, source, patent_number, title, abstract,
             inventors, assignee, filing_date, publication_date,
             url, classification, status, jurisdiction, created_at, updated_at)
        VALUES
            (:id, :external_id, :source, :patent_number, :title, :abstract,
             CAST(:inventors AS json), :assignee, :filing_date, :publication_date,
             :url, :classification, :status, :jurisdiction, :created_at, :updated_at)
    """), {
        "id":              str(uuid.uuid4()),
        "external_id":     ext_id,
        "source":          "csv",
        "patent_number":   pat_clean,
        "title":           safe_str(row.get("Patent_Title"), 1000),
        "abstract":        safe_str(row.get("Patent_Abstract"), 4000),
        "inventors":       inv_json,
        "assignee":        safe_str(row.get("Assignee"), 512),
        "filing_date":     safe_date(row.get("Filing_Date")),
        "publication_date":safe_date(row.get("Publication_Date")),
        "url":             google_url,
        "classification":  safe_str(row.get("IPC_or_CPC_Classification"), 500),
        "status":          safe_str(row.get("Patent_Status"), 50),
        "jurisdiction":    safe_str(row.get("Country"), 10),
        "created_at":      datetime.utcnow(),
        "updated_at":      datetime.utcnow(),
    })
    gp_ins += 1
    if gp_ins % 500 == 0:
        db.commit()
        print(f"  ... {gp_ins} global_patents rows inserted")

db.commit()
total_gp = db.execute(text("SELECT COUNT(*) FROM global_patents")).scalar()
print(f"Done: {gp_ins} inserted, {gp_skp} skipped. Total = {total_gp}")

# ============================================================
#  6. SEED user-scoped patents (20 real per user)
# ============================================================
banner("SEEDING user-scoped patents (20 per user from global_patents)")

users = db.execute(text("SELECT id FROM users")).fetchall()
print(f"Users found: {len(users)}")

PER_USER = 20
for (uid,) in users:
    already = db.execute(text("SELECT COUNT(*) FROM patents WHERE user_id=:u"), {"u": uid}).scalar()
    need    = max(0, PER_USER - already)
    if need == 0:
        print(f"  User {uid[:8]}... already has {already} patents"); continue

    rows = db.execute(text("""
        SELECT external_id, patent_number, title, abstract, inventors,
               assignee, filing_date, publication_date, status,
               classification, jurisdiction, url
        FROM global_patents ORDER BY id LIMIT :n
    """), {"n": need}).fetchall()

    added = 0
    for g in rows:
        ext_id, pat_num, title, abstract, inventors, assignee, \
        filing_date, pub_date, status_v, classification, jurisdiction, url = g

        dup = db.execute(
            text("SELECT 1 FROM patents WHERE user_id=:u AND external_patent_id=:e"),
            {"u": uid, "e": ext_id}
        ).scalar()
        if dup: continue

        db.execute(text("""
            INSERT INTO patents
                (patent_id, external_patent_id, patent_number, user_id,
                 title, abstract, inventors, assignee,
                 filing_date, publication_date, status,
                 classification, technology_domain, citation_count,
                 source_url, fetched_at)
            VALUES
                (:patent_id, :external_patent_id, :patent_number, :user_id,
                 :title, :abstract, :inventors, :assignee,
                 :filing_date, :publication_date, :status,
                 :classification, :technology_domain, :citation_count,
                 :source_url, :fetched_at)
        """), {
            "patent_id":         str(uuid.uuid4()),
            "external_patent_id": ext_id,
            "patent_number":     pat_num,
            "user_id":           uid,
            "title":             (title or "")[:500],
            "abstract":          (abstract or "")[:4000],
            "inventors":         (str(inventors) if inventors else "")[:1000],
            "assignee":          (assignee or "")[:255],
            "filing_date":       filing_date,
            "publication_date":  pub_date,
            "status":            (status_v or "GRANTED")[:50],
            "classification":    (classification or "")[:500],
            "technology_domain": (jurisdiction or "Technology")[:255],
            "citation_count":    0,
            "source_url":        (url or "")[:500],
            "fetched_at":        datetime.utcnow(),
        })
        added += 1

    db.commit()
    print(f"  User {uid[:8]}... -> inserted {added} patents (total {already+added})")

# ============================================================
#  7. FINAL SUMMARY
# ============================================================
banner("SEED COMPLETE - FINAL COUNTS")
print(f"  funding_opportunities : {db.execute(text('SELECT COUNT(*) FROM funding_opportunities')).scalar():,} rows")
print(f"  global_patents        : {db.execute(text('SELECT COUNT(*) FROM global_patents')).scalar():,} rows")
print(f"  patents (user-scoped) : {db.execute(text('SELECT COUNT(*) FROM patents')).scalar():,} rows")
print()
print("  Refresh Patents and Funding pages - real data is now loaded!")
db.close()
