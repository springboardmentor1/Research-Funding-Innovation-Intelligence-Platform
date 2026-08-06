"""
Research Trend Intelligence Module (spec section 4):
  - Publication trend analysis
  - Emerging topic detection (basic heuristic, upgradable to real topic modeling later)
  - Domain trend monitoring
  - Citation analytics

Data source: OpenAlex API (free, keyless) - https://docs.openalex.org
Caching: MongoDB (spec: Secondary Database) caches results per query for
trend_cache_ttl_seconds, since this is schema-less external JSON that benefits
from TTL expiry rather than a fixed relational shape. Falls back to a live
fetch transparently if MongoDB is unavailable.
"""
import json
import urllib.request
import urllib.parse
from datetime import datetime, timezone
from collections import Counter

from app.core.mongo import get_mongo_db
from pymongo.errors import PyMongoError

OPENALEX_URL = "https://api.openalex.org/works"


def fetch_works(query: str, limit: int = 50) -> list[dict]:
    params = urllib.parse.urlencode({"search": query, "per_page": limit, "sort": "publication_date:desc"})
    url = f"{OPENALEX_URL}?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "rfip-milestone2/0.1"})
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read())
    return data.get("results", [])


def _cache_get(query: str, limit: int) -> dict | None:
    db = get_mongo_db()
    if db is None:
        return None
    try:
        doc = db.trend_cache.find_one({"query": query, "limit": limit})
        return doc["result"] if doc else None
    except PyMongoError:
        return None


def _cache_set(query: str, limit: int, result: dict) -> None:
    db = get_mongo_db()
    if db is None:
        return
    try:
        db.trend_cache.update_one(
            {"query": query, "limit": limit},
            {"$set": {"result": result, "cached_at": datetime.now(timezone.utc)}},
            upsert=True,
        )
    except PyMongoError:
        pass  # caching is a performance optimization, never let it break the request


def analyze_trend(query: str, limit: int = 50) -> dict:
    cached = _cache_get(query, limit)
    if cached is not None:
        return {**cached, "cache_hit": True}

    works = fetch_works(query, limit=limit)

    year_counts: Counter = Counter()
    venue_counts: Counter = Counter()
    total_citations = 0

    for w in works:
        year = w.get("publication_year")
        if year:
            year_counts[year] += 1
        loc = w.get("primary_location") or {}
        source = (loc.get("source") or {}).get("display_name") if loc else None
        if source:
            venue_counts[source] += 1
        total_citations += w.get("cited_by_count", 0) or 0

    years_sorted = sorted(year_counts.items())

    is_emerging = False
    if len(years_sorted) >= 3:
        recent = [c for _, c in years_sorted[-3:]]
        is_emerging = recent[-1] >= recent[0] and recent[-1] > 0

    result = {
        "query": query,
        "total_publications_sampled": len(works),
        "publications_by_year": [{"year": y, "count": c} for y, c in years_sorted],
        "top_venues": [{"venue": v, "count": c} for v, c in venue_counts.most_common(5)],
        "avg_citations_per_paper": round(total_citations / len(works), 2) if works else 0,
        "is_emerging_trend": is_emerging,
    }

    _cache_set(query, limit, result)
    return {**result, "cache_hit": False}
