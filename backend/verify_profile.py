import os
import sys

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
print("FASTAPI PROFILE CRUD VERIFICATION CHECKLIST")
print("=============================================\n")

checklist = {
    "1. Create Profile": False,
    "2. Get Profile": False,
    "3. Update Profile": False,
    "4. Duplicate Profile Prevention": False,
    "5. Unauthorized Access Protection": False,
    "6. Delete Profile": False
}

# ----------------------------------------------------
# Setup: Register and login test user
# ----------------------------------------------------
reg_response = client.post("/auth/register", json={
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "testpassword123",
    "role": "Researcher"
})

login_response = client.post("/auth/login", data={
    "username": "test@example.com",
    "password": "testpassword123"
})

token = login_response.json().get("access_token") if login_response.status_code == 200 else None
auth_headers = {"Authorization": f"Bearer {token}"} if token else {}

# ----------------------------------------------------
# Check 1: Create Profile
# ----------------------------------------------------
profile_payload = {
    "research_domain": "Information Technology",
    "research_subdomain": "Software Engineering",
    "keywords": "fastapi, python, test driven development",
    "organization": "OpenAI",
    "designation": "AI Engineer",
    "highest_qualification": "M.S. in Computer Science",
    "years_of_experience": 3,
    "research_interests": "Large language models, automated code generation",
    "technology_areas": "Artificial Intelligence, Python Systems",
    "publications_count": 4,
    "patents_count": 0,
    "biography": "Focused on creating intelligent developer tools.",
    "linkedin_url": "https://linkedin.com/in/testuser",
    "orcid_id": "1111-2222-3333-4444"
}

if token:
    create_response = client.post("/profile", json=profile_payload, headers=auth_headers)
    if create_response.status_code == 201:
        res_data = create_response.json()
        if res_data.get("research_domain") == "Information Technology" and "profile_id" in res_data:
            checklist["1. Create Profile"] = True
            print("[OK] 1. Create Profile: SUCCESS (Created profile for test user)")
        else:
            print("[FAIL] 1. Create Profile: FAILED (Response data mismatch)")
    else:
        print(f"[FAIL] 1. Create Profile: FAILED (Status Code: {create_response.status_code})")
else:
    print("[FAIL] 1. Create Profile: SKIPPED (Authentication failed)")

# ----------------------------------------------------
# Check 2: Get Profile
# ----------------------------------------------------
if token and checklist["1. Create Profile"]:
    get_response = client.get("/profile/me", headers=auth_headers)
    if get_response.status_code == 200:
        res_data = get_response.json()
        if res_data.get("designation") == "AI Engineer":
            checklist["2. Get Profile"] = True
            print("[OK] 2. Get Profile: SUCCESS (Retrieved profile matching test user)")
        else:
            print("[FAIL] 2. Get Profile: FAILED (Data values mismatch)")
    else:
        print(f"[FAIL] 2. Get Profile: FAILED (Status Code: {get_response.status_code})")
else:
    print("[FAIL] 2. Get Profile: SKIPPED")

# ----------------------------------------------------
# Check 3: Update Profile
# ----------------------------------------------------
update_payload = {
    "designation": "Senior AI Engineer",
    "years_of_experience": 4,
    "publications_count": 6
}

if token and checklist["2. Get Profile"]:
    update_response = client.put("/profile", json=update_payload, headers=auth_headers)
    if update_response.status_code == 200:
        res_data = update_response.json()
        if res_data.get("designation") == "Senior AI Engineer" and res_data.get("years_of_experience") == 4:
            checklist["3. Update Profile"] = True
            print("[OK] 3. Update Profile: SUCCESS (Updated designation and metrics)")
        else:
            print("[FAIL] 3. Update Profile: FAILED (Fields did not update correctly)")
    else:
        print(f"[FAIL] 3. Update Profile: FAILED (Status Code: {update_response.status_code})")
else:
    print("[FAIL] 3. Update Profile: SKIPPED")

# ----------------------------------------------------
# Check 4: Duplicate Profile Prevention
# ----------------------------------------------------
if token and checklist["1. Create Profile"]:
    dup_response = client.post("/profile", json=profile_payload, headers=auth_headers)
    if dup_response.status_code == 400:
        checklist["4. Duplicate Profile Prevention"] = True
        print("[OK] 4. Duplicate Profile: SUCCESS (API rejected duplicate profile creation with 400)")
    else:
        print(f"[FAIL] 4. Duplicate Profile: FAILED (Expected 400, got {dup_response.status_code})")
else:
    print("[FAIL] 4. Duplicate Profile: SKIPPED")

# ----------------------------------------------------
# Check 5: Unauthorized Access Protection
# ----------------------------------------------------
unauth_response = client.get("/profile/me")
if unauth_response.status_code == 401:
    checklist["5. Unauthorized Access Protection"] = True
    print("[OK] 5. Unauthorized Access: SUCCESS (Rejected unauthenticated get request with 401)")
else:
    print(f"[FAIL] 5. Unauthorized Access: FAILED (Expected 401, got {unauth_response.status_code})")

# ----------------------------------------------------
# Check 6: Delete Profile
# ----------------------------------------------------
if token and checklist["1. Create Profile"]:
    del_response = client.delete("/profile", headers=auth_headers)
    verify_del_response = client.get("/profile/me", headers=auth_headers)
    
    if del_response.status_code == 200 and verify_del_response.status_code == 404:
        checklist["6. Delete Profile"] = True
        print("[OK] 6. Delete Profile: SUCCESS (Deleted profile, subsequent fetch returned 404)")
    else:
        print(f"[FAIL] 6. Delete Profile: FAILED (Delete code: {del_response.status_code}, Fetch code: {verify_del_response.status_code})")
else:
    print("[FAIL] 6. Delete Profile: SKIPPED")

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
    print("\nVerification completed. ALL 6 PROFILE CHECKS PASSED SUCCESSFULLY! 10/10")
    sys.exit(0)
else:
    print("\nVerification completed. SOME CHECKS FAILED.")
    sys.exit(1)
