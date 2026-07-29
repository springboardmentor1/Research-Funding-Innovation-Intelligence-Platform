import requests
import json
import time
from datetime import datetime, timezone, timedelta

BASE_URL = "http://127.0.0.1:8000/api"

def run_verification():
    print("1. Registering/Logging in test user...")
    # Try to register
    user_data = {
        "email": "live.test@innovation.ai",
        "full_name": "Live Test User",
        "password": "Password123!",
        "role": "Researcher"
    }
    res = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    if res.status_code == 201:
        token = res.json()["access_token"]
        print("   Registered successfully.")
    else:
        # If already exists, login
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": user_data["email"], "password": user_data["password"]})
        if res.status_code == 200:
            token = res.json()["access_token"]
            print("   Logged in successfully.")
        else:
            print("   Failed to authenticate:", res.text)
            return

    headers = {"Authorization": f"Bearer {token}"}

    print("2. Setting up user profile...")
    profile_data = {
        "bio": "Expert in deep learning.",
        "research_domains": ["AI", "Machine Learning"],
        "keywords": ["neural networks"],
        "career_stage": "postdoc",
        "institution_type": "university",
        "region": "us"
    }
    # Wait, the ProfileUpdate schema might not have the new fields yet! 
    # Let's check if we added them to ProfileCreate/Update schemas.
    res = requests.post(f"{BASE_URL}/profile", json=profile_data, headers=headers)
    if res.status_code == 200:
        print("   Profile updated successfully.")
    else:
        print("   Failed to update profile:", res.text)
        return

    print("3. Seeding a test funding opportunity directly to DB...")
    from database.db import SessionLocal
    from models.funding import FundingOpportunity
    db = SessionLocal()
    opp = db.query(FundingOpportunity).filter(FundingOpportunity.title == "LIVE TEST: Postdoc AI Grant").first()
    if not opp:
        opp = FundingOpportunity(
            title="LIVE TEST: Postdoc AI Grant",
            source="Innovation Fund",
            description="A special grant for postdocs working in neural networks.",
            min_career_stage="postdoc",
            institution_type="university",
            region="us",
            deadline_date=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=60)
        )
        db.add(opp)
        db.commit()
        db.refresh(opp)
        print(f"   Created new test opportunity with ID {opp.id}.")
    else:
        print(f"   Test opportunity already exists with ID {opp.id}.")

    print("4. Fetching eligible grants...")
    res = requests.get(f"{BASE_URL}/v1/funding/eligible?limit=100", headers=headers)
    if res.status_code == 200:
        eligible = res.json()
        print(f"   Found {len(eligible)} eligible opportunities.")
        found = any(e["id"] == opp.id for e in eligible)
        print(f"   -> Was our test opportunity found? {'YES' if found else 'NO'}")
    else:
        print("   Failed to fetch eligible grants:", res.text)
        return

    print("5. Tracking the grant...")
    track_payload = {"status": "interested", "notes": "Looks promising!"}
    res = requests.post(f"{BASE_URL}/v1/funding/{opp.id}/track", json=track_payload, headers=headers)
    if res.status_code == 200:
        print("   Started tracking the grant.")
    else:
        print("   Failed to track grant:", res.text)

    print("6. Verifying tracked grants...")
    res = requests.get(f"{BASE_URL}/v1/funding/tracked", headers=headers)
    if res.status_code == 200:
        tracked = res.json()
        print(f"   You are tracking {len(tracked)} grants.")
        for t in tracked:
            if t["funding_opportunity_id"] == opp.id:
                print(f"   -> Verified! Status: {t['status']}, Notes: {t['notes']}")
    else:
        print("   Failed to fetch tracked grants:", res.text)

if __name__ == "__main__":
    run_verification()
