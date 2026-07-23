import requests
import json
import os
from typing import List, Dict, Any

OPENALEX_BASE_URL = "https://api.openalex.org/works"
PAPERS_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "papers.json")


def fetch_papers(topic: str, max_results: int = 10) -> List[Dict[str, Any]]:
    """
    Fetch research papers from OpenAlex API.
    
    Args:
        topic: Search keyword/topic
        max_results: Maximum number of results to return

    Returns:
        List of paper dicts with title, authors, year, doi, abstract
    """
    params = {
        "search": topic,
        "per-page": max_results,
        "select": "id,title,authorships,publication_year,doi,abstract_inverted_index"
    }

    try:
        response = requests.get(OPENALEX_BASE_URL, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.Timeout:
        raise RuntimeError("OpenAlex API timed out. Please try again.")
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"OpenAlex API error: {str(e)}")

    papers = []
    for work in data.get("results", []):
        # Extract authors
        authors = []
        for authorship in work.get("authorships", []):
            author_name = authorship.get("author", {}).get("display_name", "Unknown")
            authors.append(author_name)

        # Reconstruct abstract from inverted index
        abstract = _reconstruct_abstract(work.get("abstract_inverted_index"))

        paper = {
            "id": work.get("id", ""),
            "title": work.get("title", "No title available"),
            "authors": authors,
            "publication_year": work.get("publication_year"),
            "doi": work.get("doi", ""),
            "abstract": abstract,
            "search_topic": topic
        }
        papers.append(paper)

    # Save to papers.json
    _save_papers(papers, topic)

    return papers


def _reconstruct_abstract(inverted_index: dict | None) -> str:
    """Reconstruct abstract text from OpenAlex inverted index format."""
    if not inverted_index:
        return "Abstract not available"

    word_positions = []
    for word, positions in inverted_index.items():
        for pos in positions:
            word_positions.append((pos, word))

    word_positions.sort(key=lambda x: x[0])
    return " ".join(word for _, word in word_positions)


def _save_papers(papers: List[Dict], topic: str) -> None:
    """Append fetched papers to papers.json for persistence."""
    existing = []
    papers_path = os.path.abspath(PAPERS_JSON_PATH)

    if os.path.exists(papers_path):
        try:
            with open(papers_path, "r", encoding="utf-8") as f:
                existing = json.load(f)
        except (json.JSONDecodeError, IOError):
            existing = []

    # Avoid duplicate IDs
    existing_ids = {p.get("id") for p in existing}
    new_papers = [p for p in papers if p.get("id") not in existing_ids]
    existing.extend(new_papers)

    with open(papers_path, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)
