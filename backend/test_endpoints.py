import requests
import json

BASE_URL = "http://127.0.0.1:8000"

# Test 1: Login to get token
print("=" * 50)
print("Test 1: Login")
print("=" * 50)
login_data = {
    "username": "researcher@demo.edu",
    "password": "research123"
}
try:
    response = requests.post(f"{BASE_URL}/api/auth/token", data=login_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    if response.status_code == 200:
        token_data = response.json()
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"✓ Login successful, token obtained")
    else:
        print("✗ Login failed")
        token = None
        headers = {}
except Exception as e:
    print(f"✗ Login error: {e}")
    token = None
    headers = {}

# Test 2: Research Intelligence Dashboard
print("\n" + "=" * 50)
print("Test 2: Research Intelligence Dashboard")
print("=" * 50)
try:
    response = requests.get(f"{BASE_URL}/research-intelligence/dashboard", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    if response.status_code == 200:
        print("✓ Research Intelligence Dashboard successful")
    else:
        print("✗ Research Intelligence Dashboard failed")
except Exception as e:
    print(f"✗ Error: {e}")

# Test 3: Publication Records
print("\n" + "=" * 50)
print("Test 3: Publication Records")
print("=" * 50)
try:
    response = requests.get(f"{BASE_URL}/publication-records/", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    if response.status_code == 200:
        print("✓ Publication Records successful")
    else:
        print("✗ Publication Records failed")
except Exception as e:
    print(f"✗ Error: {e}")

# Test 4: Dashboard API
print("\n" + "=" * 50)
print("Test 4: Dashboard API")
print("=" * 50)
try:
    response = requests.get(f"{BASE_URL}/api/dashboard/", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    if response.status_code == 200:
        print("✓ Dashboard API successful")
    else:
        print("✗ Dashboard API failed")
except Exception as e:
    print(f"✗ Error: {e}")

print("\n" + "=" * 50)
print("Tests completed")
print("=" * 50)
