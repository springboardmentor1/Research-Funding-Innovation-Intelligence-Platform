from app.db.session import SessionLocal
from app.models.publication import Publication
from app.models.grant import GrantOpportunity
from app.models.patent import Patent

db = SessionLocal()

print("=== PUBLICATIONS ===")
publications = db.query(Publication).all()
for p in publications:
    print(f"ID: {p.id}, Title: {p.title}, Citations: {p.citations}")

print("\n=== GRANTS ===")
grants = db.query(GrantOpportunity).all()
for g in grants:
    print(f"ID: {g.id}, Title: {g.title}")

print("\n=== PATENTS ===")
patents = db.query(Patent).all()
for pt in patents:
    print(f"ID: {pt.id}, Title: {pt.title}")

db.close()
