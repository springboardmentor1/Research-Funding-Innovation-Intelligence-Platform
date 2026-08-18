import httpx
import asyncio

async def test_openalex():
    """Test OpenAlex API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                'https://api.openalex.org/works',
                params={'search': 'machine learning', 'per-page': 2}
            )
            print(f"[OK] OpenAlex API Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"  Results found: {data.get('meta', {}).get('count', 0)}")
                return True
            else:
                print(f"  Error: {response.text}")
                return False
    except Exception as e:
        print(f"[FAIL] OpenAlex API Error: {e}")
        return False

async def test_semantic_scholar():
    """Test Semantic Scholar API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                'https://api.semanticscholar.org/graph/v1/paper/search',
                params={'query': 'machine learning', 'limit': 2}
            )
            print(f"[OK] Semantic Scholar API Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"  Results found: {data.get('total', 0)}")
                return True
            else:
                print(f"  Error: {response.text}")
                return False
    except Exception as e:
        print(f"[FAIL] Semantic Scholar API Error: {e}")
        return False

async def test_crossref():
    """Test Crossref API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                'https://api.crossref.org/works',
                params={'query': 'machine learning', 'rows': 2}
            )
            print(f"[OK] Crossref API Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"  Results found: {data.get('message', {}).get('total-results', 0)}")
                return True
            else:
                print(f"  Error: {response.text}")
                return False
    except Exception as e:
        print(f"[FAIL] Crossref API Error: {e}")
        return False

async def test_nsf():
    """Test NSF API"""
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(
                'http://api.nsf.gov/services/v1/awards.json',
                params={'keyword': 'artificial intelligence', 'rpp': 2}
            )
            print(f"[OK] NSF API Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"  Results found: {len(data.get('response', {}).get('award', []))}")
                return True
            else:
                print(f"  Error: {response.text}")
                return False
    except Exception as e:
        print(f"[FAIL] NSF API Error: {e}")
        return False

async def main():
    print("Testing External APIs...\n")
    
    results = await asyncio.gather(
        test_openalex(),
        test_semantic_scholar(),
        test_crossref(),
        test_nsf()
    )
    
    print(f"\n{'='*50}")
    print(f"Results: {sum(results)}/{len(results)} APIs working")
    print(f"{'='*50}")

if __name__ == "__main__":
    asyncio.run(main())