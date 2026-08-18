import asyncio
import httpx

async def test_openalex_publications():
    """Test OpenAlex publications API"""
    print("Testing OpenAlex Publications API...")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "http://127.0.0.1:8000/api/publications/search",
                params={"query": "machine learning", "per_page": 5}
            )
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"Found {data.get('total_count', 0)} publications")
                print(f"Sample result: {data.get('results', [{}])[0].get('title', 'N/A') if data.get('results') else 'No results'}")
                return True
            else:
                print(f"Error: {response.text}")
                return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

async def test_funding_external_api():
    """Test funding external API"""
    print("\nTesting Funding External API...")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "http://127.0.0.1:8000/funding/",
                params={"search": "cancer research", "use_external_api": True},
                timeout=30.0
            )
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"Response type: {type(data)}")
                if isinstance(data, dict):
                    print(f"NSF results: {'nsf' in data}")
                    print(f"NIH results: {'nih' in data}")
                    print(f"Grants.gov results: {'grants_gov' in data}")
                    print(f"Total count: {data.get('total_count', 0)}")
                    if data.get('errors'):
                        print(f"Errors: {data.get('errors')}")
                else:
                    print(f"Results count: {len(data) if isinstance(data, list) else 'N/A'}")
                return True
            else:
                print(f"Error: {response.text}")
                return False
    except Exception as e:
        print(f"Exception: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_funding_local_db():
    """Test funding local database"""
    print("\nTesting Funding Local Database...")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "http://127.0.0.1:8000/funding/",
                params={"search": "", "use_external_api": False}
            )
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"Results count: {len(data) if isinstance(data, list) else 'N/A'}")
                return True
            else:
                print(f"Error: {response.text}")
                return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

async def main():
    print("=" * 50)
    print("API Integration Tests")
    print("=" * 50)
    
    # Test OpenAlex Publications
    openalex_result = await test_openalex_publications()
    
    # Test Funding External API
    funding_external_result = await test_funding_external_api()
    
    # Test Funding Local Database
    funding_local_result = await test_funding_local_db()
    
    print("\n" + "=" * 50)
    print("Test Results Summary:")
    print("=" * 50)
    print(f"OpenAlex Publications: {'PASS' if openalex_result else 'FAIL'}")
    print(f"Funding External API: {'PASS' if funding_external_result else 'FAIL'}")
    print(f"Funding Local Database: {'PASS' if funding_local_result else 'FAIL'}")

if __name__ == "__main__":
    asyncio.run(main())
