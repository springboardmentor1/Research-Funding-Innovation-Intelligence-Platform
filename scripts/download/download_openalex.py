import os
import json
import time
import urllib.request
import urllib.parse
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", "raw", "research")
os.makedirs(RAW_DIR, exist_ok=True)

def download_openalex_papers(topic="artificial intelligence", max_results=50):
    """
    Downloads research works from OpenAlex API based on a search topic.
    Handles rate limiting, retries, and saves raw JSON response.
    """
    base_url = "https://api.openalex.org/works"
    params = {
        "search": topic,
        "per_page": min(max_results, 50),
        "sort": "cited_by_count:desc"
    }
    url = f"{base_url}?{urllib.parse.urlencode(params)}"
    
    headers = {
        "User-Agent": "AI-Research-Funding-Platform/1.0 (mailto:contact@research-funding-platform.org)"
    }
    
    logging.info(f"Fetching OpenAlex works for topic: '{topic}'...")
    
    req = urllib.request.Request(url, headers=headers)
    retries = 3
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    results = data.get("results", [])
                    output_file = os.path.join(RAW_DIR, "openalex_raw.json")
                    with open(output_file, "w", encoding="utf-8") as f:
                        json.dump(results, f, indent=2)
                    logging.info(f"Successfully saved {len(results)} raw records to {output_file}")
                    return results
        except Exception as e:
            logging.warning(f"Attempt {attempt + 1} failed: {e}")
            time.sleep(2)
            
    logging.error("Failed to download data after multiple attempts.")
    return []

if __name__ == "__main__":
    download_openalex_papers(topic="artificial intelligence medical imaging", max_results=30)
