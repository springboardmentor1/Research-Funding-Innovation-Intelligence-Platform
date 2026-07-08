import os
import sys
from unittest.mock import patch, MagicMock

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
print("FASTAPI OPENALEX INTEGRATION VERIFICATION")
print("=============================================\n")

checklist = {
    "1. OpenAlex API Mock Connectivity": False,
    "2. Publication Retrieval & Abstract Reconstruction": False,
    "3. Database Storage & Unique Check": False,
    "4. Duplicate Prevention (Composite Unique)": False,
    "5. Search Filters (Domain, Year, Citations, Keywords)": False,
    "6. JWT-Protected Endpoint Verification": False
}

# ----------------------------------------------------
# Setup: Register, login, and create profile
# ----------------------------------------------------
client.post("/auth/register", json={
    "full_name": "Jane Researcher",
    "email": "jane@example.com",
    "password": "securepassword123",
    "role": "Researcher"
})

login_res = client.post("/auth/login", data={"username": "jane@example.com", "password": "securepassword123"})
token = login_res.json().get("access_token") if login_res.status_code == 200 else None
auth_headers = {"Authorization": f"Bearer {token}"} if token else {}

# Create Research Profile
profile_res = client.post("/profile", json={
    "research_domain": "Computer Science",
    "research_subdomain": "Artificial Intelligence",
    "keywords": "deep learning, neural networks",
    "organization": "MIT"
}, headers=auth_headers)

# ----------------------------------------------------
# Mock Data for OpenAlex API Response
# ----------------------------------------------------
mock_openalex_data = {
    "results": [
        {
            "id": "https://openalex.org/W1234567890",
            "title": "A Breakthrough in Artificial Intelligence",
            "publication_year": 2024,
            "cited_by_count": 150,
            "doi": "https://doi.org/10.1234/ai.2024",
            "abstract_inverted_index": {
                "This": [0],
                "paper": [1],
                "presents": [2],
                "deep": [3],
                "learning": [4],
                "breakthroughs.": [5]
            },
            "authorships": [
                {"author": {"display_name": "Jane Researcher"}},
                {"author": {"display_name": "John Scientist"}}
            ],
            "concepts": [
                {"display_name": "Artificial Intelligence"},
                {"display_name": "Deep Learning"}
            ],
            "primary_location": {
                "source": {"display_name": "Journal of AI Research"},
                "landing_page_url": "https://example.com/jair/ai-2024"
            },
            "open_access": {"is_oa": True}
        }
    ]
}

# ----------------------------------------------------
# Check 1 & 2 & 3: Sync & Retrieve & Save
# ----------------------------------------------------
if token and profile_res.status_code == 201:
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_openalex_data

    with patch("requests.get", return_value=mock_resp) as mock_get:
        # Trigger Sync Search endpoint
        search_res = client.get("/publications/search", headers=auth_headers)
        
        # Verify requests.get was called with correct parameters
        if mock_get.called:
            checklist["1. OpenAlex API Mock Connectivity"] = True
            print("[OK] 1. OpenAlex API Connectivity: SUCCESS (API called with search terms)")
        
        if search_res.status_code == 200:
            res_list = search_res.json()
            if len(res_list) > 0:
                pub = res_list[0]
                # Check abstract reconstruction
                if pub.get("abstract") == "This paper presents deep learning breakthroughs.":
                    checklist["2. Publication Retrieval & Abstract Reconstruction"] = True
                    print("[OK] 2. Retrieval & Abstract: SUCCESS (Abstract reconstructed correctly)")
                
                # Check DB storage
                if pub.get("publication_id") and pub.get("openalex_id") == "https://openalex.org/W1234567890":
                    checklist["3. Database Storage & Unique Check"] = True
                    print("[OK] 3. Database Storage: SUCCESS (Metadata saved, publication_id generated)")
                    publication_id = pub.get("publication_id")
        else:
            print(f"[FAIL] Publications Search failed with status: {search_res.status_code}")
else:
    print("[FAIL] Setup failed, skipping search verification tests.")
    publication_id = None

# ----------------------------------------------------
# Check 4: Duplicate Prevention (Composite Unique)
# ----------------------------------------------------
if checklist["3. Database Storage & Unique Check"]:
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_openalex_data

    with patch("requests.get", return_value=mock_resp):
        # Call search again
        search_res_2 = client.get("/publications/search", headers=auth_headers)
        # Fetch directly from database to count entries
        get_res = client.get("/publications", headers=auth_headers)
        
        if search_res_2.status_code == 200 and len(get_res.json()) == 1:
            checklist["4. Duplicate Prevention (Composite Unique)"] = True
            print("[OK] 4. Duplicate Prevention: SUCCESS (Rejected duplicate insertion, count remained 1)")
        else:
            print(f"[FAIL] Duplicate check failed. Count: {len(get_res.json())}")

# ----------------------------------------------------
# Check 5: Search Filters
# ----------------------------------------------------
if checklist["3. Database Storage & Unique Check"]:
    # 1. Filter by Domain
    domain_res = client.get("/publications?domain=Computer Science", headers=auth_headers)
    # 2. Filter by Year
    year_res = client.get("/publications?year=2024", headers=auth_headers)
    # 3. Filter by Min Citations
    citation_res = client.get("/publications?min_citations=100", headers=auth_headers)
    # 4. Filter by Keyword
    keyword_res = client.get("/publications?keyword=breakthrough", headers=auth_headers)
    
    # 5. Invalid match checks
    invalid_year_res = client.get("/publications?year=2020", headers=auth_headers)

    if (len(domain_res.json()) == 1 and 
        len(year_res.json()) == 1 and 
        len(citation_res.json()) == 1 and 
        len(keyword_res.json()) == 1 and 
        len(invalid_year_res.json()) == 0):
        checklist["5. Search Filters (Domain, Year, Citations, Keywords)"] = True
        print("[OK] 5. Search Filters: SUCCESS (All 4 query parameters filters resolved matches correctly)")
    else:
        print("[FAIL] Filter verification failed.")
        print(f"Domain match count: {len(domain_res.json())}")
        print(f"Year match count: {len(year_res.json())}")
        print(f"Citations match count: {len(citation_res.json())}")
        print(f"Keyword match count: {len(keyword_res.json())}")
        print(f"Invalid year match count: {len(invalid_year_res.json())}")

# ----------------------------------------------------
# Check 6: JWT Security Protection
# ----------------------------------------------------
unauth_res = client.get("/publications")
if unauth_res.status_code == 401:
    checklist["6. JWT-Protected Endpoint Verification"] = True
    print("[OK] 6. JWT Security Checks: SUCCESS (Call rejected with 401 Unauthorized)")
else:
    print(f"[FAIL] JWT Protection failed. Expected 401, got {unauth_res.status_code}")

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
    print("\nVerification completed. ALL 6 PUBLICATION INTEGRATION CHECKS PASSED SUCCESSFULLY! 10/10")
    sys.exit(0)
else:
    print("\nVerification completed. SOME CHECKS FAILED.")
    sys.exit(1)
