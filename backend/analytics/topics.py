"""
Emerging Topic Detection.

Extracts and counts the most frequent keywords from the papers.csv
dataset to identify trending research topics.
"""

import pandas as pd
import os
import re
from typing import List, Dict, Any
from collections import Counter

PAPERS_CSV = os.path.join(os.path.dirname(__file__), "..", "dataset", "papers.csv")


def _load_papers() -> pd.DataFrame:
    csv_path = os.path.abspath(PAPERS_CSV)
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Papers dataset not found at {csv_path}")
    return pd.read_csv(csv_path).fillna("")


def get_top_keywords(limit: int = 10) -> List[Dict[str, Any]]:
    """
    Extract the most frequent keywords from the papers dataset.

    Parses both the Keywords and Concepts columns, tokenizes them,
    and returns the top N by frequency.
    """
    df = _load_papers()
    all_keywords: List[str] = []

    for _, row in df.iterrows():
        # Combine Keywords and Concepts columns
        combined = f"{row.get('Keywords', '')},{row.get('Concepts', '')}"
        tokens = re.split(r"[,;|]+", combined)
        for token in tokens:
            cleaned = token.strip()
            if cleaned and len(cleaned) > 1:
                all_keywords.append(cleaned)

    # Count occurrences
    counter = Counter(all_keywords)
    top = counter.most_common(limit)

    return [{"keyword": kw, "count": count} for kw, count in top]


def get_keyword_trends() -> Dict[str, List[Dict[str, Any]]]:
    """
    Get keyword frequency trends over years.

    Returns top 5 keywords with their per-year occurrence counts.
    """
    df = _load_papers()

    # First get top 5 keywords overall
    all_keywords: List[str] = []
    for _, row in df.iterrows():
        combined = f"{row.get('Keywords', '')},{row.get('Concepts', '')}"
        tokens = re.split(r"[,;|]+", combined)
        for token in tokens:
            cleaned = token.strip()
            if cleaned and len(cleaned) > 1:
                all_keywords.append(cleaned)

    counter = Counter(all_keywords)
    top5 = [kw for kw, _ in counter.most_common(5)]

    # Now count per year for each keyword
    keyword_by_year: Dict[str, Dict[int, int]] = {kw: {} for kw in top5}

    for _, row in df.iterrows():
        year = int(row.get("Year", 0))
        combined = f"{row.get('Keywords', '')},{row.get('Concepts', '')}"
        tokens = {t.strip() for t in re.split(r"[,;|]+", combined) if t.strip()}
        for kw in top5:
            if kw in tokens:
                keyword_by_year[kw][year] = keyword_by_year[kw].get(year, 0) + 1

    result = {}
    for kw in top5:
        years = sorted(keyword_by_year[kw].keys())
        result[kw] = [
            {"year": y, "count": keyword_by_year[kw][y]} for y in years
        ]

    return result


def get_author_stats(limit: int = 10) -> List[Dict[str, Any]]:
    """Get most prolific authors."""
    df = _load_papers()
    all_authors: List[str] = []

    for _, row in df.iterrows():
        authors_str = str(row.get("Authors", ""))
        authors = [a.strip() for a in authors_str.split(",") if a.strip()]
        all_authors.extend(authors)

    counter = Counter(all_authors)
    return [{"author": name, "paper_count": count} for name, count in counter.most_common(limit)]
