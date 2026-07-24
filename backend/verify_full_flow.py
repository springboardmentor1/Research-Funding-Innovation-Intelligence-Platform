import os
import sys
from unittest.mock import patch, MagicMock

# 1. Override the database URL to use SQLite for self-contained testing
os.environ["DATABASE_URL"] = "sqlite:///./full_flow_test.db"

# 2. Cleanup any previous database file
if os.path.exists("full_flow_test.db"):
    try:
        os.remove("full_flow_test.db")
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
print("INTEGRATION TEST: FULL PLATFORM USER FLOW")
print("=============================================\n")

flow_checklist = {
    "Step 1: Register User": False,
    "Step 2: Login & Retrieve JWT": False,
    "Step 3: Create Research Profile": False,
    "Step 4: Search & Sync Publications (OpenAlex)": False,
    "Step 5: View Saved Publications": False,
    "Step 6: Search & Sync Patents (Lens API)": False,
    "Step 7: View Saved Patents": False
}

# ----------------------------------------------------
# Step 1: Register User
# ----------------------------------------------------
reg_payload = {
    "full_name": "Dr. Sarah Connor",
    "email": "sarah.connor@cyberdyne.org",
    "password": "terminator101password",
    "role": "Researcher"
}
reg_res = client.post("/auth/register", json=reg_payload)
if reg_res.status_code == 201:
    flow_checklist["Step 1: Register User"] = True
    print("[OK] Step 1: User Registration SUCCESS")
else:
    print(f"[FAIL] Step 1: User Registration FAILED (Status: {reg_res.status_code})")

# ----------------------------------------------------
# Step 2: Login & Retrieve JWT
# ----------------------------------------------------
login_res = client.post("/auth/login", data={
    "username": "sarah.connor@cyberdyne.org",
    "password": "terminator101password"
})
token = login_res.json().get("access_token") if login_res.status_code == 200 else None
auth_headers = {"Authorization": f"Bearer {token}"} if token else {}

if login_res.status_code == 200 and token:
    flow_checklist["Step 2: Login & Retrieve JWT"] = True
    print("[OK] Step 2: User Login & JWT Retrieval SUCCESS")
else:
    print(f"[FAIL] Step 2: User Login & JWT Retrieval FAILED (Status: {login_res.status_code})")

# ----------------------------------------------------
# Step 3: Create Research Profile
# ----------------------------------------------------
profile_payload = {
    "research_domain": "Robotics & AI",
    "research_subdomain": "Neural Network Control Systems",
    "keywords": "neural networks, robotics, autonomous hardware",
    "organization": "Cyberdyne Research Labs",
    "designation": "Principal Investigator"
}
if flow_checklist["Step 2: Login & Retrieve JWT"]:
    profile_res = client.post("/profile", json=profile_payload, headers=auth_headers)
    if profile_res.status_code == 201:
        flow_checklist["Step 3: Create Research Profile"] = True
        print("[OK] Step 3: Create Research Profile SUCCESS")
    else:
        print(f"[FAIL] Step 3: Create Research Profile FAILED (Status: {profile_res.status_code})")
else:
    print("[FAIL] Step 3: Create Research Profile SKIPPED")

# ----------------------------------------------------
# Step 4: Search & Sync Publications (OpenAlex)
# ----------------------------------------------------
mock_pub_data = {
    "results": [
        {
            "id": "https://openalex.org/W9876543210",
            "title": "Autonomous Neural Network Control in Robotics",
            "publication_year": 2024,
            "cited_by_count": 89,
            "doi": "https://doi.org/10.1234/robo.2024",
            "abstract_inverted_index": {
                "This": [0], "paper": [1], "presents": [2],
                "control": [3], "in": [4], "robotics.": [5]
            },
            "authorships": [{"author": {"display_name": "Sarah Connor"}}],
            "concepts": [{"display_name": "Robotics"}, {"display_name": "Neural Networks"}],
            "primary_location": {
                "source": {"display_name": "International Journal of Robotics"},
                "landing_page_url": "https://example.com/ijr/robo-2024"
            },
            "open_access": {"is_oa": True}
        }
    ]
}

if flow_checklist["Step 3: Create Research Profile"]:
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_pub_data

    with patch("requests.get", return_value=mock_resp):
        search_pub_res = client.get("/publications/search?limit=5", headers=auth_headers)
        if search_pub_res.status_code == 200 and len(search_pub_res.json()) > 0:
            flow_checklist["Step 4: Search & Sync Publications (OpenAlex)"] = True
            print("[OK] Step 4: Search & Sync Publications SUCCESS")
        else:
            print(f"[FAIL] Step 4: Search & Sync Publications FAILED (Status: {search_pub_res.status_code})")
else:
    print("[FAIL] Step 4: Search & Sync Publications SKIPPED")

# ----------------------------------------------------
# Step 5: View Saved Publications
# ----------------------------------------------------
if flow_checklist["Step 4: Search & Sync Publications (OpenAlex)"]:
    get_pub_res = client.get("/publications?year=2024&keyword=Robotics", headers=auth_headers)
    if get_pub_res.status_code == 200 and len(get_pub_res.json()) == 1:
        flow_checklist["Step 5: View Saved Publications"] = True
        print("[OK] Step 5: View and Filter Saved Publications SUCCESS")
    else:
        print(f"[FAIL] Step 5: View Saved Publications FAILED (Count: {len(get_pub_res.json()) if get_pub_res.status_code == 200 else 'Error'})")
else:
    print("[FAIL] Step 5: View Saved Publications SKIPPED")

# ----------------------------------------------------
# Step 6: Search & Sync Patents (Lens API)
# ----------------------------------------------------
mock_patent_data = {
    "data": [
        {
            "lens_id": "lens-id-US20000001B2",
            "title": {"text": "Self-healing Neural Network Control Architectures"},
            "abstract": {"text": "This patent describes self-healing hardware configurations for autonomous system controls."},
            "inventors": [{"display_name": "Sarah Connor"}],
            "assignees": [{"display_name": "Cyberdyne Research Labs"}],
            "filing_date": "2023-08-14",
            "publication_date": "2024-12-05",
            "granted": True,
            "classifications_ipcr": [{"symbol": "B64C 39/02"}],
            "cited_by_patent_count": 12
        }
    ]
}

if flow_checklist["Step 3: Create Research Profile"]:
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_patent_data

    with patch.dict(os.environ, {"LENS_API_KEY": "test-key"}):
        with patch("requests.post", return_value=mock_resp):
            search_pat_res = client.get("/patents/search?limit=5", headers=auth_headers)
            if search_pat_res.status_code == 200 and len(search_pat_res.json()) > 0:
                flow_checklist["Step 6: Search & Sync Patents (Lens API)"] = True
                print("[OK] Step 6: Search & Sync Patents SUCCESS")
            else:
                print(f"[FAIL] Step 6: Search & Sync Patents FAILED (Status: {search_pat_res.status_code})")
else:
    print("[FAIL] Step 6: Search & Sync Patents SKIPPED")

# ----------------------------------------------------
# Step 7: View Saved Patents
# ----------------------------------------------------
if flow_checklist["Step 6: Search & Sync Patents (Lens API)"]:
    get_pat_res = client.get("/patents?year=2023&status=GRANTED", headers=auth_headers)
    if get_pat_res.status_code == 200 and len(get_pat_res.json()) == 1:
        flow_checklist["Step 7: View Saved Patents"] = True
        print("[OK] Step 7: View and Filter Saved Patents SUCCESS")
    else:
        print(f"[FAIL] Step 7: View Saved Patents FAILED (Count: {len(get_pat_res.json()) if get_pat_res.status_code == 200 else 'Error'})")
else:
    print("[FAIL] Step 7: View Saved Patents SKIPPED")

# ----------------------------------------------------
# Final Status
# ----------------------------------------------------
print("\n=============================================")
print("FLOW INTEGRATION FINAL SUMMARY")
print("=============================================")
all_pass = all(flow_checklist.values())
for key, value in flow_checklist.items():
    status_str = "PASS" if value else "FAIL"
    print(f"{key}: {status_str}")
print("=============================================")

# Cleanup database file
if os.path.exists("full_flow_test.db"):
    try:
        os.remove("full_flow_test.db")
    except Exception:
        pass

if all_pass:
    print("\nVerification completed. E2E USER FLOW INTEGRATION SUCCESSFUL! 10/10")
    sys.exit(0)
else:
    print("\nVerification completed. FLOW FAILED.")
    sys.exit(1)
