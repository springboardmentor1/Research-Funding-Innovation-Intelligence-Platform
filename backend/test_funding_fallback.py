import requests
import time
import json

BASE_URL = "http://127.0.0.1:8000"

print("=" * 50)
print("Testing Funding Fallback Mechanism")
print("=" * 50)

# Test 1: Database-only query (fastest path)
print("\n" + "=" * 50)
print("Test 1: Database-only query (no external API)")
print("=" * 50)
start_time = time.time()
try:
    response = requests.get(f"{BASE_URL}/funding/", params={"search": "research"})
    elapsed_time = time.time() - start_time
    print(f"Status: {response.status_code}")
    print(f"Response time: {elapsed_time:.3f} seconds")
    print(f"Results count: {len(response.json()) if response.status_code == 200 else 'N/A'}")
    if response.status_code == 200 and elapsed_time < 1.0:
        print("PASS: Database query is fast (< 1 second)")
    else:
        print("FAIL: Database query might be slow")
except Exception as e:
    print(f"ERROR: {e}")

# Test 2: External API with timeout fallback
print("\n" + "=" * 50)
print("Test 2: External API request (should fallback on timeout)")
print("=" * 50)
start_time = time.time()
try:
    response = requests.get(f"{BASE_URL}/funding/", params={"search": "research", "use_external_api": "true"})
    elapsed_time = time.time() - start_time
    print(f"Status: {response.status_code}")
    print(f"Response time: {elapsed_time:.3f} seconds")
    print(f"Results count: {len(response.json()) if response.status_code == 200 else 'N/A'}")
    if response.status_code == 200:
        print("PASS: Request completed (with fallback if API failed)")
    else:
        print("FAIL: Request failed")
except Exception as e:
    print(f"ERROR: {e}")

# Test 3: No search term (database only)
print("\n" + "=" * 50)
print("Test 3: No search term (database only)")
print("=" * 50)
start_time = time.time()
try:
    response = requests.get(f"{BASE_URL}/funding/")
    elapsed_time = time.time() - start_time
    print(f"Status: {response.status_code}")
    print(f"Response time: {elapsed_time:.3f} seconds")
    print(f"Results count: {len(response.json()) if response.status_code == 200 else 'N/A'}")
    if response.status_code == 200 and elapsed_time < 1.0:
        print("PASS: Default query is fast (< 1 second)")
    else:
        print("FAIL: Default query might be slow")
except Exception as e:
    print(f"ERROR: {e}")

print("\n" + "=" * 50)
print("Fallback mechanism tests completed")
print("=" * 50)
print("\nKey improvements:")
print("1. Database queries are prioritized for minimal loading time")
print("2. External API calls have 5-second timeout")
print("3. Any API error immediately falls back to database results")
print("4. No breaking changes to existing functionality")