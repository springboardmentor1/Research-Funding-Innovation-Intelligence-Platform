import urllib.request
import urllib.parse
import json

BASE_URL = "http://127.0.0.1:8000"

def test_login():
    print("=" * 50)
    print("Test 1: Login")
    print("=" * 50)
    data = urllib.parse.urlencode({
        "username": "researcher@demo.edu",
        "password": "research123"
    }).encode()
    
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/auth/token", data=data, method='POST')
        req.add_header('Content-Type', 'application/x-www-form-urlencoded')
        with urllib.request.urlopen(req) as response:
            result = response.read().decode()
            print(f"Status: {response.status}")
            print(f"Response: {result}")
            token_data = json.loads(result)
            return token_data.get("access_token")
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_endpoint(token, endpoint, name):
    print("\n" + "=" * 50)
    print(f"Test: {name}")
    print("=" * 50)
    
    try:
        req = urllib.request.Request(f"{BASE_URL}{endpoint}", method='GET')
        if token:
            req.add_header('Authorization', f'Bearer {token}')
        with urllib.request.urlopen(req) as response:
            result = response.read().decode()
            print(f"Status: {response.status}")
            print(f"Response: {result[:500]}")
            return response.status == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

# Run tests
token = test_login()

if token:
    test_endpoint(token, "/research-intelligence/dashboard", "Research Intelligence Dashboard")
    test_endpoint(token, "/publication-records/", "Publication Records")
    test_endpoint(token, "/api/dashboard/", "Dashboard API")
else:
    print("Could not get token, skipping endpoint tests")

print("\n" + "=" * 50)
print("Tests completed")
print("=" * 50)
