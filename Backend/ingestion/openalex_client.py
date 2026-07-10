import os
import json
import logging
from typing import List, Dict, Any
import requests

logger = logging.getLogger(__name__)

# OpenAlex base url
OPENALEX_BASE_URL = "https://api.openalex.org"

# Project root path (three levels up from backend/ingestion/openalex_client.py)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_RAW_DIR = os.path.join(PROJECT_ROOT, "data", "raw")

def fetch_openalex_publications(query: str, limit: int = 120) -> List[Dict[str, Any]]:
    """
    Queries OpenAlex works endpoint for academic publications matching the query.
    Falls back to data/raw/openalex_works.json if live call fails or API key is missing.
    """
    url = f"{OPENALEX_BASE_URL}/works"
    api_key = os.getenv("OPENALEX_API_KEY")
    
    params = {
        "search": query,
        "per-page": limit,
    }
    
    headers = {}
    if api_key:
        headers["api_key"] = api_key
        
    try:
        logger.info(f"Attempting live query to OpenAlex Works API (query={query}, limit={limit})...")
        response = requests.get(url, params=params, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
        results = data.get("results", [])
        
        # Save raw response to cache in project root data/raw
        os.makedirs(DATA_RAW_DIR, exist_ok=True)
        cache_path = os.path.join(DATA_RAW_DIR, "openalex_works.json")
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
            
        logger.info(f"Successfully fetched {len(results)} works from OpenAlex API and cached to disk.")
        return results
    except Exception as exc:
        logger.error(f"Failed to fetch live works from OpenAlex: {exc}. Trying fallback cache...")
        
        # Fallback to local raw cache in project root
        cache_path = os.path.join(DATA_RAW_DIR, "openalex_works.json")
        if os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                    results = cached_data.get("results", [])
                    logger.info(f"Loaded {len(results)} works from local fallback cache.")
                    return results
            except Exception as cache_exc:
                logger.error(f"Failed to read fallback cache for works: {cache_exc}")
        return []


def fetch_openalex_grants(query: str, limit: int = 120) -> List[Dict[str, Any]]:
    """
    Queries OpenAlex awards endpoint for research grants/awards matching the query.
    Falls back to data/raw/openalex_awards.json if live call fails or API key is missing.
    """
    url = f"{OPENALEX_BASE_URL}/awards"
    api_key = os.getenv("OPENALEX_API_KEY")
    
    params = {
        "search": query,
        "per-page": limit,
    }
    
    headers = {}
    if api_key:
        headers["api_key"] = api_key
        
    try:
        logger.info(f"Attempting live query to OpenAlex Awards API (query={query}, limit={limit})...")
        response = requests.get(url, params=params, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
        results = data.get("results", [])
        
        # Save raw response to cache in project root data/raw
        os.makedirs(DATA_RAW_DIR, exist_ok=True)
        cache_path = os.path.join(DATA_RAW_DIR, "openalex_awards.json")
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
            
        logger.info(f"Successfully fetched {len(results)} awards from OpenAlex API and cached to disk.")
        return results
    except Exception as exc:
        logger.error(f"Failed to fetch live awards from OpenAlex: {exc}. Trying fallback cache...")
        
        # Fallback to local raw cache in project root
        cache_path = os.path.join(DATA_RAW_DIR, "openalex_awards.json")
        if os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                    results = cached_data.get("results", [])
                    logger.info(f"Loaded {len(results)} awards from local fallback cache.")
                    return results
            except Exception as cache_exc:
                logger.error(f"Failed to read fallback cache for awards: {cache_exc}")
        return []
