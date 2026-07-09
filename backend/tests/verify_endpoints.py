import sys
import time
import httpx

BASE_URL = "http://127.0.0.1:8000"

def print_result(name: str, success: bool, details: str = ""):
    status_str = "SUCCESS" if success else "FAILED"
    color_code = "\033[92m" if success else "\033[91m"
    reset_code = "\033[0m"
    print(f"[{color_code}{status_str}{reset_code}] {name} {f'({details})' if details else ''}")

def run_tests():
    print("="*60)
    print("Research Funding & Innovation Platform - API Verification Suite")
    print("="*60)
    
    # 1. Check if server is running
    try:
        response = httpx.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print_result("Connection to API server", True, f"Server responded: {response.json().get('message')}")
        else:
            print_result("Connection to API server", False, f"HTTP Status: {response.status_code}")
            return
    except httpx.ConnectError:
        print_result("Connection to API server", False, "Server is not running. Please start the server using 'python run.py' first.")
        print("\nNote: Make sure your PostgreSQL database is running and configured in backend/.env before starting the server.")
        return

    # Seed data
    timestamp = int(time.time())
    researcher_email = f"researcher_{timestamp}@example.com"
    admin_email = f"admin_{timestamp}@example.com"
    password = "SecurePassword123"
    
    # Keep track of tokens
    researcher_token = None
    admin_token = None
    
    # 2. Test Register Researcher
    try:
        res = httpx.post(f"{BASE_URL}/auth/register", json={
            "email": researcher_email,
            "password": password,
            "role": "RESEARCHER"
        })
        if res.status_code == 201:
            print_result("User Registration (RESEARCHER)", True, researcher_email)
        else:
            print_result("User Registration (RESEARCHER)", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("User Registration (RESEARCHER)", False, str(e))

    # 3. Test Register Admin
    try:
        res = httpx.post(f"{BASE_URL}/auth/register", json={
            "email": admin_email,
            "password": password,
            "role": "ADMINISTRATOR"
        })
        if res.status_code == 201:
            print_result("User Registration (ADMINISTRATOR)", True, admin_email)
        else:
            print_result("User Registration (ADMINISTRATOR)", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("User Registration (ADMINISTRATOR)", False, str(e))

    # 4. Test Login Researcher
    try:
        res = httpx.post(f"{BASE_URL}/auth/login", data={
            "username": researcher_email,
            "password": password
        })
        if res.status_code == 200:
            researcher_token = res.json().get("access_token")
            print_result("User Login (RESEARCHER)", True, f"Token received for {researcher_email}")
        else:
            print_result("User Login (RESEARCHER)", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("User Login (RESEARCHER)", False, str(e))

    # 5. Test Login Admin
    try:
        res = httpx.post(f"{BASE_URL}/auth/login", data={
            "username": admin_email,
            "password": password
        })
        if res.status_code == 200:
            admin_token = res.json().get("access_token")
            print_result("User Login (ADMINISTRATOR)", True, f"Token received for {admin_email}")
        else:
            print_result("User Login (ADMINISTRATOR)", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("User Login (ADMINISTRATOR)", False, str(e))

    if not researcher_token:
        print("\nAborting remaining tests: Authentication failed.")
        return

    # Header configurations
    researcher_headers = {"Authorization": f"Bearer {researcher_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 6. Test Profile Creation (RESEARCHER)
    profile_id = None
    try:
        res = httpx.post(f"{BASE_URL}/profiles/", headers=researcher_headers, json={
            "first_name": "John",
            "last_name": "Doe",
            "organization": "MIT",
            "biography": "AI Researcher focusing on NLP and Large Language Models.",
            "research_domains": ["Computer Science", "Artificial Intelligence"],
            "keywords": ["NLP", "Transformers", "Deep Learning"],
            "technology_areas": ["Software Development", "Cognitive Systems"]
        })
        if res.status_code == 201:
            profile_id = res.json().get("id")
            print_result("Create Research Profile", True, f"Profile ID: {profile_id}")
        else:
            print_result("Create Research Profile", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("Create Research Profile", False, str(e))

    # 7. Test Fetch My Profile (RESEARCHER)
    try:
        res = httpx.get(f"{BASE_URL}/profiles/me", headers=researcher_headers)
        if res.status_code == 200 and res.json().get("first_name") == "John":
            print_result("Fetch Current User's Profile", True, "Successfully retrieved own profile")
        else:
            print_result("Fetch Current User's Profile", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("Fetch Current User's Profile", False, str(e))

    # 8. Test Add Publication (RESEARCHER)
    try:
        res = httpx.post(f"{BASE_URL}/profiles/me/publications", headers=researcher_headers, json={
            "title": "Attention Is All You Need",
            "authors": "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L., & Polosukhin, I.",
            "journal_or_conference": "NeurIPS",
            "publication_year": 2017,
            "doi": "10.48550/arXiv.1706.03762",
            "url": "https://arxiv.org/abs/1706.03762"
        })
        if res.status_code == 201:
            print_result("Add Publication to Profile", True, f"Pub ID: {res.json().get('id')}")
        else:
            print_result("Add Publication to Profile", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("Add Publication to Profile", False, str(e))

    # 9. Test Add Patent (RESEARCHER)
    patent_num = f"US-{timestamp}"
    try:
        res = httpx.post(f"{BASE_URL}/profiles/me/patents", headers=researcher_headers, json={
            "title": "Method for distributed training of transformer networks",
            "patent_number": patent_num,
            "filing_date": "2026-07-07",
            "status": "Pending",
            "url": "https://patents.google.com/patent/example"
        })
        if res.status_code == 201:
            print_result("Add Patent to Profile", True, f"Patent ID: {res.json().get('id')}")
        else:
            print_result("Add Patent to Profile", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("Add Patent to Profile", False, str(e))

    # 10. Test Fetch Profile by ID (ADMINISTRATOR role accessing researcher profile)
    if profile_id:
        try:
            res = httpx.get(f"{BASE_URL}/profiles/{profile_id}", headers=admin_headers)
            if res.status_code == 200:
                print_result("RBAC Check: Administrator fetching researcher profile", True)
            else:
                print_result("RBAC Check: Administrator fetching researcher profile", False, f"Status {res.status_code}: {res.text}")
        except Exception as e:
            print_result("RBAC Check: Administrator fetching researcher profile", False, str(e))

    # 11. Test Profile Search
    try:
        res = httpx.get(f"{BASE_URL}/profiles/?domain=Artificial", headers=researcher_headers)
        if res.status_code == 200 and len(res.json()) > 0:
            print_result("Search Profiles (filtered by domain)", True, f"Found {len(res.json())} profile(s)")
        else:
            print_result("Search Profiles (filtered by domain)", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("Search Profiles (filtered by domain)", False, str(e))

    print("="*60)
    print("Verification Completed.")
    print("="*60)

if __name__ == "__main__":
    run_tests()
