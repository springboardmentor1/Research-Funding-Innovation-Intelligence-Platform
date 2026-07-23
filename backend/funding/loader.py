import pandas as pd
import os
from typing import List, Dict, Any

FUNDING_CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "dataset", "funding.csv")


def search_funding(area: str) -> List[Dict[str, Any]]:
    """
    Search funding opportunities by research area (case-insensitive, partial match).
    
    Args:
        area: Research area keyword

    Returns:
        List of matching funding opportunity dicts
    """
    csv_path = os.path.abspath(FUNDING_CSV_PATH)

    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Funding dataset not found at {csv_path}")

    df = pd.read_csv(csv_path)

    # Case-insensitive partial match on Area column
    mask = df["Area"].str.lower().str.contains(area.lower(), na=False)
    results = df[mask].fillna("").to_dict(orient="records")

    return results


def get_all_funding() -> List[Dict[str, Any]]:
    """Return all funding opportunities."""
    csv_path = os.path.abspath(FUNDING_CSV_PATH)
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Funding dataset not found at {csv_path}")
    df = pd.read_csv(csv_path).fillna("")
    return df.to_dict(orient="records")
