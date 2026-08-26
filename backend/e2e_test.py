"""
End-to-end test of funding and patent services with real DB data.
Run: .\\venv\\Scripts\\python.exe e2e_test.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
load_dotenv()

from app.database.connection import SessionLocal
from app.services.funding_service import get_personalized_recommendations, load_funding_dataset
from app.services.patent_service import get_user_patents, fetch_and_sync_patents
from app.models.user import User
from app.models.patent import Patent
from sqlalchemy import text

db = SessionLocal()

print("="*60)
print("  FUNDING SERVICE TEST")
print("="*60)

# Get a real user with a profile
user = db.execute(text("""
    SELECT u.id, u.email, rp.research_domain, rp.keywords
    FROM users u
    JOIN research_profiles rp ON rp.user_id = u.id
    LIMIT 1
""")).fetchone()

if not user:
    print("No user with profile found. Create a profile first.")
else:
    uid, email, domain, keywords = user
    print(f"Testing with user: {email}")
    print(f"Profile domain: {domain}, keywords: {keywords}")

    # Load dataset check
    dataset = load_funding_dataset(db)
    print(f"\nFunding dataset loaded: {len(dataset)} rows")
    if dataset:
        row = dataset[0]
        print(f"Sample row keys: {list(row.keys())}")
        print(f"Sample: {row.get('funding_title', row.get('title'))} | status={row.get('status')} | country={row.get('country')}")

    # Recommendations
    try:
        recs = get_personalized_recommendations(db, uid, limit=5)
        print(f"\nRecommendations returned: {len(recs)}")
        for i, r in enumerate(recs, 1):
            print(f"  {i}. [{r['match_score']}%] {r['title'][:60]}")
            print(f"       URL: {r['url'][:80]}")
    except Exception as e:
        print(f"\nRecommendations ERROR: {e}")

print()
print("="*60)
print("  PATENT SERVICE TEST")
print("="*60)

if user:
    uid = user[0]
    # Existing patents
    patents = get_user_patents(db, uid)
    print(f"Existing user patents: {len(patents)}")
    for p in patents[:3]:
        print(f"  - [{p.status}] {p.title[:60]}")
        print(f"       URL: {p.source_url}")
    
    # Sync (pulls from global_patents)
    print("\nTesting fetch_and_sync_patents (page 2, limit 5)...")
    synced = fetch_and_sync_patents(db, uid, limit=5, page=2)
    print(f"Synced: {len(synced)} patents")
    for p in synced[:2]:
        print(f"  - [{p.status}] {p.title[:60]}")
        print(f"       URL: {p.source_url}")

db.close()
print("\nDone.")
