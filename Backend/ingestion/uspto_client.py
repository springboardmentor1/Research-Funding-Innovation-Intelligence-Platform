import os
import json
import logging
from typing import List, Dict, Any
import requests

logger = logging.getLogger(__name__)

# USPTO Open Data Portal PatentSearch API Endpoint
USPTO_API_URL = "https://api.uspto.gov/api/v1/patent/applications/search"

# Project root path (three levels up from backend/ingestion/uspto_client.py)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_RAW_DIR = os.path.join(PROJECT_ROOT, "data", "raw")

def fetch_uspto_patents(query: str, limit: int = 15) -> List[Dict[str, Any]]:
    """
    Queries the USPTO Open Data Portal API for patents.
    Falls back to data/raw/uspto_patents.json if live call fails or API key is missing.
    """
    api_key = os.getenv("USPTO_ODP_API_KEY")
    
    # We query the inventionTitle field specifically
    params = {
        "q": f"applicationMetaData.inventionTitle:{query}*",
        "limit": limit,
    }
    
    headers = {}
    if api_key:
        headers["X-API-Key"] = api_key
        
    try:
        logger.info(f"Attempting live query to USPTO ODP API (query={query}, limit={limit})...")
        response = requests.get(USPTO_API_URL, params=params, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        # ODP API response structure typically has results under 'results' or 'response/docs'
        results = data.get("results", [])
        if not results and "response" in data:
            results = data["response"].get("docs", [])
            
        # Save raw response to cache in project root
        os.makedirs(DATA_RAW_DIR, exist_ok=True)
        cache_path = os.path.join(DATA_RAW_DIR, "uspto_patents.json")
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
            
        logger.info(f"Successfully fetched {len(results)} patents from USPTO API and cached to disk.")
        return results
    except Exception as exc:
        logger.error(f"Failed to fetch live patents from USPTO: {exc}. Trying fallback cache...")
        
        # Fallback to local raw cache in project root
        cache_path = os.path.join(DATA_RAW_DIR, "uspto_patents.json")
        if os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                    if isinstance(cached_data, list):
                        results = cached_data
                    else:
                        results = cached_data.get("results", [])
                        if not results and "response" in cached_data:
                            results = cached_data["response"].get("docs", [])
                    logger.info(f"Loaded {len(results)} patents from local fallback cache.")
                    return results
            except Exception as cache_exc:
                logger.error(f"Failed to read fallback cache for patents: {cache_exc}")
        return []
