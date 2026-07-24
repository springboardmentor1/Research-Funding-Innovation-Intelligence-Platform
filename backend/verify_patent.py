import os
import sys
from unittest.mock import patch, MagicMock
import requests

# 1. Override the database URL to use SQLite for self-contained testing
os.environ["DATABASE_URL"] = "sqlite:///./verify_test.db"

# 2. Cleanup any previous database file
if os.path.exists("verify_test.db"):
    try:
        os.remove("verify_test.db")
    except Exception:
        pass

try:
    from fastapi.testclient import TestClient
    from app.main import app
    from app.database.connection import engine, Base
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

# Initialize database tables for verification
Base.metadata.create_all(bind=engine)

client = TestClient(app)

print("\n=============================================")
print("FASTAPI PATENT INTEGRATION VERIFICATION")
print("=============================================\n")

checklist = {
    "1. Patent API Connectivity & Mock Support": False,
    "2. Patent Retrieval & Abstract Sync": False,
    "3. Database Storage & Fields Integrity": False,
    "4. Duplicate Prevention (Composite Unique)": False,
    "5. Search Filters (Tech Domain, Year, Status, Keywords)": False,
    "6. JWT Security Protections": False,
    "7. API Connection Error Handling Fallback": False
}

# ----------------------------------------------------
# Setup: Register, login, and create profile
# ----------------------------------------------------
client.post("/auth/register", json={
    "full_name": "Dr. Alice Inventor",
    "email": "alice@example.com",
    "password": "securepassword123",
    "role": "Researcher"
})

login_res = client.post("/auth/login", data={"username": "alice@example.com", "password": "securepassword123"})
token = login_res.json().get("access_token") if login_res.status_code == 200 else None
auth_headers = {"Authorization": f"Bearer {token}"} if token else {}

# Create Research Profile
profile_res = client.post("/profile", json={
    "research_domain": "Quantum Engineering",
    "research_subdomain": "Cryptographic Systems",
    "keywords": "cryptography, quantum key",
    "organization": "MIT Research Labs",
    "designation": "Dr. Scholar"
}, headers=auth_headers)

# ----------------------------------------------------
# Mock Data for The Lens API Response
# ----------------------------------------------------
mock_lens_data = {
    "data": [
        {
            "lens_id": "lens-id-US10000001B2",
            "title": {"text": "Novel Method and System for Cryptographic Systems Optimization using Cryptography"},
            "abstract": {"text": "This patent describes an invention relating to cryptography and its strategic application in Quantum Engineering platforms."},
            "inventors": [{"display_name": "Dr. Scholar"}, {"display_name": "John Inventor"}],
            "assignees": [{"display_name": "MIT Research Labs Technology Licensing Office"}],
            "filing_date": "2023-04-12",
            "publication_date": "2024-10-18",
            "granted": True,
            "classifications_ipcr": [{"symbol": "G06F 16/90"}],
            "cited_by_patent_count": 4
        }
    ]
}

# ----------------------------------------------------
# Check 1 & 2 & 3: Sync & Retrieve & Save
# ----------------------------------------------------
if token and profile_res.status_code == 201:
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_lens_data

    # Temporarily set LENS_API_KEY to test API query path
    with patch.dict(os.environ, {"LENS_API_KEY": "test-key"}):
        with patch("requests.post", return_value=mock_resp) as mock_post:
            # Trigger Sync Search endpoint
            search_res = client.get("/patents/search", headers=auth_headers)
            
            if mock_post.called:
                checklist["1. Patent API Connectivity & Mock Support"] = True
                print("[OK] 1. Patent API Connectivity: SUCCESS (Post request called to lens.org)")

            if search_res.status_code == 200:
                res_list = search_res.json()
                if len(res_list) > 0:
                    pat = res_list[0]
                    # Check fields
                    if (pat.get("external_patent_id") == "lens-id-US10000001B2" and 
                        "cryptography" in pat.get("abstract").lower()):
                        checklist["2. Patent Retrieval & Abstract Sync"] = True
                        print("[OK] 2. Retrieval & Abstract: SUCCESS (Abstract synced correctly)")

                    if (pat.get("patent_id") and 
                        pat.get("inventors") == "Dr. Scholar, John Inventor" and
                        pat.get("assignee") == "MIT Research Labs Technology Licensing Office"):
                        checklist["3. Database Storage & Fields Integrity"] = True
                        print("[OK] 3. Database Storage: SUCCESS (Metadata saved with fields integrity)")
            else:
                print(f"[FAIL] Patents Search failed with status: {search_res.status_code}")
else:
    print("[FAIL] Setup failed, skipping search verification tests.")

# ----------------------------------------------------
# Check 4: Duplicate Prevention
# ----------------------------------------------------
if checklist["3. Database Storage & Fields Integrity"]:
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_lens_data

    with patch.dict(os.environ, {"LENS_API_KEY": "test-key"}):
        with patch("requests.post", return_value=mock_resp):
            # Sync again
            search_res_2 = client.get("/patents/search", headers=auth_headers)
            # Fetch directly from database to count entries
            get_res = client.get("/patents", headers=auth_headers)
            
            if search_res_2.status_code == 200 and len(get_res.json()) == 1:
                checklist["4. Duplicate Prevention (Composite Unique)"] = True
                print("[OK] 4. Duplicate Prevention: SUCCESS (Rejected duplicate insertion, count remained 1)")
            else:
                print(f"[FAIL] Duplicate check failed. Count: {len(get_res.json())}")

# ----------------------------------------------------
# Check 5: Search Filters
# ----------------------------------------------------
if checklist["3. Database Storage & Fields Integrity"]:
    # 1. Filter by Tech Domain
    domain_res = client.get("/patents?tech_domain=Cryptographic Systems", headers=auth_headers)
    # 2. Filter by Filing Year
    year_res = client.get("/patents?year=2023", headers=auth_headers)
    # 3. Filter by Status
    status_res = client.get("/patents?status=GRANTED", headers=auth_headers)
    # 4. Filter by Inventor
    inventor_res = client.get("/patents?inventor=Scholar", headers=auth_headers)
    # 5. Filter by Keyword
    keyword_res = client.get("/patents?keyword=Optimization", headers=auth_headers)
    
    # Invalid filter check
    invalid_year_res = client.get("/patents?year=2015", headers=auth_headers)

    if (len(domain_res.json()) == 1 and 
        len(year_res.json()) == 1 and 
        len(status_res.json()) == 1 and 
        len(inventor_res.json()) == 1 and 
        len(keyword_res.json()) == 1 and 
        len(invalid_year_res.json()) == 0):
        checklist["5. Search Filters (Tech Domain, Year, Status, Keywords)"] = True
        print("[OK] 5. Search Filters: SUCCESS (All 5 filters resolved matches correctly)")
    else:
        print("[FAIL] Filter verification failed.")
        print(f"Domain match count: {len(domain_res.json())}")
        print(f"Year match count: {len(year_res.json())}")
        print(f"Status match count: {len(status_res.json())}")
        print(f"Inventor match count: {len(inventor_res.json())}")
        print(f"Keyword match count: {len(keyword_res.json())}")

# ----------------------------------------------------
# Check 6: JWT Protected Checks
# ----------------------------------------------------
unauth_res = client.get("/patents")
if unauth_res.status_code == 401:
    checklist["6. JWT Security Protections"] = True
    print("[OK] 6. JWT Security Checks: SUCCESS (Call rejected with 401 Unauthorized)")
else:
    print(f"[FAIL] JWT Protection failed. Expected 401, got {unauth_res.status_code}")

# ----------------------------------------------------
# Check 7: API Error Handling Fallback
# ----------------------------------------------------
if token:
    with patch.dict(os.environ, {"LENS_API_KEY": "test-key"}):
        # Force requests.post to raise connection error
        with patch("requests.post", side_effect=requests.RequestException("Connection Refused")):
            # Empty database to verify mock fallback inserts generated patents
            from app.database.connection import SessionLocal
            from app.models.patent import Patent as PatentModel
            db = SessionLocal()
            db.query(PatentModel).delete()
            db.commit()
            db.close()
            
            # Call search. Should fallback to mock patent generator instead of crashing!
            fallback_res = client.get("/patents/search?limit=3", headers=auth_headers)
            
            if fallback_res.status_code == 200:
                res_list = fallback_res.json()
                # Mock generator creates 'limit' number of patents (3)
                if len(res_list) == 3 and "Optimization" in res_list[0].get("title"):
                    checklist["7. API Connection Error Handling Fallback"] = True
                    print("[OK] 7. Error Handling Fallback: SUCCESS (Fallback generated 3 patents on API failure)")
                else:
                    print(f"[FAIL] Fallback did not return expected mock records. Count: {len(res_list)}")
            else:
                print(f"[FAIL] Fallback crashed with status: {fallback_res.status_code}")

# ----------------------------------------------------
# Final Status
# ----------------------------------------------------
print("\n=============================================")
print("FINAL SUMMARY")
print("=============================================")
all_pass = all(checklist.values())
for key, value in checklist.items():
    status_str = "PASS" if value else "FAIL"
    print(f"{key}: {status_str}")
print("=============================================")

# Cleanup database file
if os.path.exists("verify_test.db"):
    try:
        os.remove("verify_test.db")
    except Exception:
        pass

if all_pass:
    print("\nVerification completed. ALL 7 PATENT INTEGRATION CHECKS PASSED SUCCESSFULLY! 10/10")
    sys.exit(0)
else:
    print("\nVerification completed. SOME CHECKS FAILED.")
    sys.exit(1)
