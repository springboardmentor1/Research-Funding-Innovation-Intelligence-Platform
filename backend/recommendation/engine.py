"""
Funding Recommendation Engine — Core similarity logic.

Computes keyword-based Jaccard similarity between a user's research
profile and each funding opportunity in the dataset.
"""

import pandas as pd
import os
import re
from typing import List, Dict, Any, Set

FUNDING_CSV = os.path.join(os.path.dirname(__file__), "..", "dataset", "funding.csv")


def _tokenize(text: str) -> Set[str]:
    """Normalize and tokenize a comma-separated keyword string."""
    if not text or not isinstance(text, str):
        return set()
    tokens = re.split(r"[,;|]+", text.lower())
    return {t.strip() for t in tokens if t.strip()}


def _jaccard(set_a: Set[str], set_b: Set[str]) -> float:
    """Jaccard similarity between two sets (0.0 – 1.0)."""
    if not set_a or not set_b:
        return 0.0
    intersection = set_a & set_b
    union = set_a | set_b
    return len(intersection) / len(union) if union else 0.0


def get_funding_data() -> pd.DataFrame:
    """Load the funding dataset from CSV."""
    csv_path = os.path.abspath(FUNDING_CSV)
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Funding dataset not found at {csv_path}")
    return pd.read_csv(csv_path).fillna("")


def recommend_by_keywords(
    research_interests: str,
    user_keywords: str,
    research_area: str,
    top_n: int = 5,
) -> List[Dict[str, Any]]:
    """
    Basic keyword-similarity recommendations.

    Combines a user's research_interests, keywords, and research_area into a
    single token set, then computes Jaccard similarity against each grant's
    Keywords + Area fields.
    """
    df = get_funding_data()

    # Build user token set
    user_tokens = (
        _tokenize(research_interests)
        | _tokenize(user_keywords)
        | _tokenize(research_area)
    )

    results: List[Dict[str, Any]] = []
    for _, row in df.iterrows():
        grant_tokens = _tokenize(str(row.get("Keywords", ""))) | _tokenize(
            str(row.get("Area", ""))
        )
        score = _jaccard(user_tokens, grant_tokens)
        results.append(
            {
                "grant_name": row.get("Grant", ""),
                "agency": row.get("Organization", ""),
                "area": row.get("Area", ""),
                "amount": row.get("Amount", ""),
                "deadline": row.get("Deadline", ""),
                "description": row.get("Description", ""),
                "country": row.get("Country", ""),
                "eligibility": row.get("Eligibility", ""),
                "keywords": row.get("Keywords", ""),
                "similarity_score": round(score * 100, 1),
            }
        )

    # Sort descending by score and return top N
    results.sort(key=lambda r: r["similarity_score"], reverse=True)
    return results[:top_n]
