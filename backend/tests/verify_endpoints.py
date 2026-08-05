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

    # 12. Test Funding Recommendations
    recommendations_exist = False
    sample_grant_id = None
    try:
        res = httpx.get(f"{BASE_URL}/recommendations/grants", headers=researcher_headers, timeout=15.0)
        if res.status_code == 200:
            recs = res.json()
            recommendations_exist = len(recs) > 0
            if recommendations_exist:
                sample_grant_id = recs[0].get("grant_id")
                top_score = recs[0].get("match_score")
                print_result("Fetch Grant Recommendations", True, f"Found {len(recs)} grants. Top score: {top_score}%")
            else:
                print_result("Fetch Grant Recommendations", True, "No recommendations returned (empty list)")
        else:
            print_result("Fetch Grant Recommendations", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("Fetch Grant Recommendations", False, str(e))

    # 13. Test Single Grant Matching Diagnostics
    if sample_grant_id:
        try:
            res = httpx.get(f"{BASE_URL}/recommendations/grants/{sample_grant_id}/match", headers=researcher_headers)
            if res.status_code == 200:
                print_result("Fetch Grant Match Breakdown", True, f"Score details for {sample_grant_id}: {res.json().get('match_rationale')}")
            else:
                print_result("Fetch Grant Match Breakdown", False, f"Status {res.status_code}: {res.text}")
        except Exception as e:
            print_result("Fetch Grant Match Breakdown", False, str(e))

    # 14. Test Publication Trend Timeline
    try:
        res = httpx.get(f"{BASE_URL}/intelligence/trends/publications", headers=researcher_headers)
        if res.status_code == 200:
            print_result("Fetch Publication Timelines", True, f"Found {len(res.json())} publication timeline entries")
        else:
            print_result("Fetch Publication Timelines", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("Fetch Publication Timelines", False, str(e))

    # 15. Test Patent Landscape classification
    try:
        res = httpx.get(f"{BASE_URL}/intelligence/patents/landscape", headers=researcher_headers)
        if res.status_code == 200:
            print_result("Fetch Patent Landscape Distribution", True, f"Categorized into {len(res.json())} classification codes")
        else:
            print_result("Fetch Patent Landscape Distribution", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("Fetch Patent Landscape Distribution", False, str(e))

    # 16. Test Emerging Technology Recommendations
    try:
        res = httpx.get(f"{BASE_URL}/intelligence/patents/emerging-tech", headers=researcher_headers)
        if res.status_code == 200:
            print_result("Fetch Emerging Tech Recommendations", True, f"Identified {len(res.json())} high-growth sectors")
        else:
            print_result("Fetch Emerging Tech Recommendations", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("Fetch Emerging Tech Recommendations", False, str(e))

    # 17. Test Patent Innovation Score Diagnostics
    try:
        res = httpx.get(f"{BASE_URL}/intelligence/patents/{patent_num}/innovation-score", headers=researcher_headers)
        if res.status_code == 200:
            print_result("Fetch Patent Innovation Score Card", True, f"TRL: {res.json().get('trl')}, Score: {res.json().get('score')}")
        else:
            print_result("Fetch Patent Innovation Score Card", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("Fetch Patent Innovation Score Card", False, str(e))

    # 18. Test Fetch Notifications
    sample_notification_id = None
    try:
        res = httpx.get(f"{BASE_URL}/notifications/", headers=researcher_headers)
        if res.status_code == 200:
            notifs = res.json()
            if len(notifs) > 0:
                sample_notification_id = notifs[0].get("id")
            print_result("Fetch User Notifications & Warnings", True, f"Loaded {len(notifs)} alerts from notification center")
        else:
            print_result("Fetch User Notifications & Warnings", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("Fetch User Notifications & Warnings", False, str(e))

    # 19. Test Mark Notification as Read
    if sample_notification_id:
        try:
            res = httpx.put(f"{BASE_URL}/notifications/{sample_notification_id}/read", headers=researcher_headers)
            if res.status_code == 200 and res.json().get("is_read") == True:
                print_result("Mark Notification as Read", True, f"Notification {sample_notification_id} is marked as read")
            else:
                print_result("Mark Notification as Read", False, f"Status {res.status_code}: {res.text}")
        except Exception as e:
            print_result("Mark Notification as Read", False, str(e))

    # 20. Test Admin User Management List
    try:
        res = httpx.get(f"{BASE_URL}/admin/users", headers=admin_headers)
        if res.status_code == 200:
            print_result("Admin: Fetch Platform Users List", True, f"Found {len(res.json())} active users")
        else:
            print_result("Admin: Fetch Platform Users List", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("Admin: Fetch Platform Users List", False, str(e))

    # 21. Test Admin Platform Stats
    try:
        res = httpx.get(f"{BASE_URL}/admin/stats", headers=admin_headers)
        if res.status_code == 200:
            print_result("Admin: Fetch Platform Analytics Stats", True, f"Users total: {res.json().get('user_stats').get('total_users')}")
        else:
            print_result("Admin: Fetch Platform Analytics Stats", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("Admin: Fetch Platform Analytics Stats", False, str(e))

    # 22. Test Portfolio Project List & Seeding
    sample_project_id = None
    try:
        res = httpx.get(f"{BASE_URL}/portfolio/projects", headers=researcher_headers)
        if res.status_code == 200:
            projs = res.json()
            if len(projs) > 0:
                sample_project_id = projs[0].get("id")
            print_result("Portfolio: Fetch Pipeline Projects", True, f"Loaded {len(projs)} active pipeline projects")
        else:
            print_result("Portfolio: Fetch Pipeline Projects", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("Portfolio: Fetch Pipeline Projects", False, str(e))

    # 23. Test Portfolio Project Update Stage
    if sample_project_id:
        try:
            res = httpx.put(f"{BASE_URL}/portfolio/projects/{sample_project_id}/stage?stage=PROTOTYPE", headers=researcher_headers)
            if res.status_code == 200:
                print_result("Portfolio: Update Project Pipeline Stage", True, f"Project {sample_project_id} stage set to {res.json().get('pipeline_stage')}")
            else:
                print_result("Portfolio: Update Project Pipeline Stage", False, f"Status {res.status_code}: {res.text}")
        except Exception as e:
            print_result("Portfolio: Update Project Pipeline Stage", False, str(e))

    # 24. Test SaaS Dashboard Recommendations
    try:
        res = httpx.get(f"{BASE_URL}/recommendations/dashboard", headers=researcher_headers, timeout=15.0)
        if res.status_code == 200:
            print_result("SaaS: Fetch Dashboard Recommendations Feed", True, f"Insight: {res.json().get('ai_insight')[:60]}...")
        else:
            print_result("SaaS: Fetch Dashboard Recommendations Feed", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("SaaS: Fetch Dashboard Recommendations Feed", False, str(e))

    # 25. Test Context-Aware AI Chat Widget
    try:
        res = httpx.post(f"{BASE_URL}/ai/chat", headers=researcher_headers, json={
            "message": "Should I apply for this grant?",
            "page_context": "funding",
            "selected_item": {
                "title": "Quantum Computing Development Grant",
                "agency": "NSF",
                "description": "Funding for accelerating quantum processors and deep learning algorithms."
            }
        }, timeout=15.0)
        if res.status_code == 200:
            print_result("SaaS: Context-Aware AI Chat Widget Response", True, f"AI Response: {res.json().get('response')[:60]}...")
        else:
            print_result("SaaS: Context-Aware AI Chat Widget Response", False, f"Status {res.status_code}: {res.text}")
    except Exception as e:
        print_result("SaaS: Context-Aware AI Chat Widget Response", False, str(e))

    print("="*60)
    print("Verification Completed.")
    print("="*60)

if __name__ == "__main__":
    run_tests()
