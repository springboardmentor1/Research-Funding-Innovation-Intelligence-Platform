"""
Free, keyless datasets used in this platform:
  - OpenAlex API    -> publications, citations    https://docs.openalex.org
  - PatentsView API -> US patent data (keyless)    https://search.patentsview.org/docs/docs/Search%20API/SearchAPI
  - CrossRef API    -> publication/DOI metadata    https://api.crossref.org

Run:  python -m app.seed_data.fetch_openalex "retrieval augmented generation"
"""
import sys
import json
import urllib.request
import urllib.parse

OPENALEX_URL = "https://api.openalex.org/works"

def fetch_publications(query: str, limit: int = 10) -> list[dict]:
    params = urllib.parse.urlencode({"search": query, "per_page": limit})
    url = f"{OPENALEX_URL}?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "rfip-milestone1/0.1"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read())

    results = []
    for work in data.get("results", []):
        results.append({
            "title": work.get("title"),
            "year": work.get("publication_year"),
            "doi": work.get("doi"),
            "venue": (work.get("primary_location") or {}).get("source", {}).get("display_name")
                     if work.get("primary_location") else None,
            "cited_by_count": work.get("cited_by_count"),
        })
    return results

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "machine learning"
    pubs = fetch_publications(query)
    print(json.dumps(pubs, indent=2))
