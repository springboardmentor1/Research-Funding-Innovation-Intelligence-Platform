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
print("FASTAPI AUTH & RBAC VERIFICATION CHECKLIST")
print("=============================================\n")

checklist = {
    "1. Register User": False,
    "2. User Login": False,
    "3. Receive JWT Token": False,
    "4. Access /auth/me": False,
    "5. RBAC /auth/admin-only Restriction": False
}

# ----------------------------------------------------
# Check 1: Register User
# ----------------------------------------------------
researcher_payload = {
    "full_name": "Jane Researcher",
    "email": "jane.res@example.com",
    "password": "researcherpassword123",
    "role": "Researcher"
}

admin_payload = {
    "full_name": "Root Admin",
    "email": "admin@example.com",
    "password": "adminpassword123",
    "role": "Administrator"
}

# Register Researcher
reg_res = client.post("/auth/register", json=researcher_payload)
# Register Admin
reg_admin = client.post("/auth/register", json=admin_payload)

if reg_res.status_code == 201 and reg_admin.status_code == 201:
    res_data = reg_res.json()
    if res_data.get("email") == "jane.res@example.com" and res_data.get("role") == "Researcher":
        checklist["1. Register User"] = True
        print("[OK] 1. Register User: SUCCESS (Registered Researcher & Administrator)")
    else:
        print("[FAIL] 1. Register User: FAILED (Incorrect response fields)")
else:
    print(f"[FAIL] 1. Register User: FAILED (Status Codes: Researcher={reg_res.status_code}, Admin={reg_admin.status_code})")

# ----------------------------------------------------
# Check 2 & 3: Login & Receive Token
# ----------------------------------------------------
login_payload = {
    "username": "jane.res@example.com",
    "password": "researcherpassword123"
}
login_response = client.post("/auth/login", data=login_payload)

if login_response.status_code == 200:
    checklist["2. User Login"] = True
    print("[OK] 2. User Login: SUCCESS (Successfully authenticated credentials)")
    
    token_data = login_response.json()
    researcher_token = token_data.get("access_token")
    if researcher_token and token_data.get("token_type") == "bearer":
        checklist["3. Receive JWT Token"] = True
        print("[OK] 3. Receive JWT Token: SUCCESS (Received valid Bearer token)")
    else:
        print("[FAIL] 3. Receive JWT Token: FAILED (Token missing or malformed)")
else:
    print(f"[FAIL] 2. User Login & Token: FAILED (Status Code: {login_response.status_code})")
    researcher_token = None

# Get Admin Token too
admin_login_response = client.post("/auth/login", data={"username": "admin@example.com", "password": "adminpassword123"})
admin_token = admin_login_response.json().get("access_token") if admin_login_response.status_code == 200 else None

# ----------------------------------------------------
# Check 4: Access /auth/me using Token
# ----------------------------------------------------
if researcher_token:
    headers = {"Authorization": f"Bearer {researcher_token}"}
    me_response = client.get("/auth/me", headers=headers)
    if me_response.status_code == 200:
        me_data = me_response.json()
        if me_data.get("email") == "jane.res@example.com":
            checklist["4. Access /auth/me"] = True
            print("[OK] 4. Access /auth/me: SUCCESS (Retrieved profile matching token)")
        else:
            print("[FAIL] 4. Access /auth/me: FAILED (Profile email mismatch)")
    else:
        print(f"[FAIL] 4. Access /auth/me: FAILED (Status Code: {me_response.status_code})")
else:
    print("[FAIL] 4. Access /auth/me: SKIPPED (No token available)")

# ----------------------------------------------------
# Check 5: RBAC Restrictions
# ----------------------------------------------------
if researcher_token and admin_token:
    # 1. Researcher tries to access admin endpoint
    res_headers = {"Authorization": f"Bearer {researcher_token}"}
    rbac_fail_response = client.get("/auth/admin-only", headers=res_headers)
    
    # 2. Admin tries to access admin endpoint
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    rbac_pass_response = client.get("/auth/admin-only", headers=admin_headers)
    
    if rbac_fail_response.status_code == 403 and rbac_pass_response.status_code == 200:
        checklist["5. RBAC /auth/admin-only Restriction"] = True
        print("[OK] 5. RBAC Restriction: SUCCESS (Researcher rejected with 403; Admin accepted with 200)")
    else:
        print(f"[FAIL] 5. RBAC Restriction: FAILED (Researcher code: {rbac_fail_response.status_code}, Admin code: {rbac_pass_response.status_code})")
else:
    print("[FAIL] 5. RBAC Restriction: SKIPPED (Tokens missing)")

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

# 3. Cleanup database file at the end
if os.path.exists("verify_test.db"):
    try:
        os.remove("verify_test.db")
    except Exception:
        pass

if all_pass:
    print("\nVerification completed. ALL 5 CHECKS PASSED SUCCESSFULLY! 10/10")
    sys.exit(0)
else:
    print("\nVerification completed. SOME CHECKS FAILED.")
    sys.exit(1)
