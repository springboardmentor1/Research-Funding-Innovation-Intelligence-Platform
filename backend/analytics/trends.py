"""
Publication Trend Analysis.

Reads the papers.csv dataset and computes yearly publication counts,
optionally filtered by research area / keyword.
"""

import pandas as pd
import os
from typing import List, Dict, Any, Optional
from collections import Counter

PAPERS_CSV = os.path.join(os.path.dirname(__file__), "..", "dataset", "papers.csv")


def _load_papers() -> pd.DataFrame:
    """Load the papers dataset from CSV."""
    csv_path = os.path.abspath(PAPERS_CSV)
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Papers dataset not found at {csv_path}")
    return pd.read_csv(csv_path).fillna("")


def get_publication_trends(area: Optional[str] = None) -> Dict[str, Any]:
    """
    Count papers grouped by publication year.

    Args:
        area: Optional keyword to filter papers by (searches Keywords + Concepts + Title)

    Returns:
        Dictionary with yearly trend data and summary statistics.
    """
    df = _load_papers()

    if area:
        area_lower = area.lower()
        mask = (
            df["Keywords"].str.lower().str.contains(area_lower, na=False)
            | df["Concepts"].str.lower().str.contains(area_lower, na=False)
            | df["Title"].str.lower().str.contains(area_lower, na=False)
        )
        df = df[mask]

    if df.empty:
        return {"trends": [], "total_papers": 0, "area_filter": area}

    # Group by year and count
    year_counts = df.groupby("Year").size().reset_index(name="count")
    year_counts = year_counts.sort_values("Year")

    trends = []
    prev_count = 0
    for _, row in year_counts.iterrows():
        count = int(row["count"])
        growth = (
            round(((count - prev_count) / prev_count) * 100, 1) if prev_count > 0 else 0
        )
        trends.append(
            {
                "year": int(row["Year"]),
                "count": count,
                "growth_pct": growth,
            }
        )
        prev_count = count

    # Total citation counts by year
    citation_by_year = (
        df.groupby("Year")["Citation_Count"]
        .sum()
        .reset_index()
        .sort_values("Year")
    )
    citation_trends = [
        {"year": int(r["Year"]), "citations": int(r["Citation_Count"])}
        for _, r in citation_by_year.iterrows()
    ]

    return {
        "trends": trends,
        "citation_trends": citation_trends,
        "total_papers": int(len(df)),
        "total_citations": int(df["Citation_Count"].sum()),
        "avg_citations": round(float(df["Citation_Count"].mean()), 1),
        "area_filter": area,
        "year_range": {
            "min": int(df["Year"].min()),
            "max": int(df["Year"].max()),
        },
    }


def get_area_distribution() -> List[Dict[str, Any]]:
    """Get paper distribution across research areas based on keyword analysis."""
    df = _load_papers()

    # Define research area categories
    area_keywords = {
        "Artificial Intelligence": ["ai", "artificial intelligence", "machine learning", "deep learning", "neural network"],
        "Large Language Models": ["llm", "large language model", "gpt", "transformer", "language model", "bert", "nlp"],
        "Computer Vision": ["computer vision", "image", "object detection", "segmentation", "visual", "3d"],
        "Cybersecurity": ["cybersecurity", "security", "threat", "malware", "privacy", "cryptography"],
        "Blockchain": ["blockchain", "cryptocurrency", "smart contract", "defi", "ethereum", "bitcoin", "web3"],
        "Data Science": ["data science", "big data", "analytics", "data engineering", "feature engineering", "mlops"],
        "Healthcare AI": ["healthcare", "medical", "drug discovery", "clinical", "biotech"],
        "Generative AI": ["generative", "diffusion", "gan", "text-to-image", "image generation"],
    }

    results = []
    for area_name, keywords in area_keywords.items():
        count = 0
        for _, row in df.iterrows():
            text = f"{row.get('Keywords', '')} {row.get('Concepts', '')} {row.get('Title', '')}".lower()
            if any(kw in text for kw in keywords):
                count += 1
        results.append({"area": area_name, "count": count})

    results.sort(key=lambda x: x["count"], reverse=True)
    return results
