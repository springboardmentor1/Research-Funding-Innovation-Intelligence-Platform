import pandas as pd
import os
from typing import List, Dict, Any

PATENTS_CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "dataset", "patents.csv")


def search_patents(technology: str) -> List[Dict[str, Any]]:
    """
    Search patents by technology area (case-insensitive, partial match).
    Also searches within the Title and Abstract columns.
    
    Args:
        technology: Technology keyword

    Returns:
        List of matching patent dicts
    """
    csv_path = os.path.abspath(PATENTS_CSV_PATH)

    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Patents dataset not found at {csv_path}")

    df = pd.read_csv(csv_path).fillna("")
    tech_lower = technology.lower()

    # Search in Technology, Title, and Abstract columns
    mask = (
        df["Technology"].str.lower().str.contains(tech_lower, na=False) |
        df["Title"].str.lower().str.contains(tech_lower, na=False) |
        df["Abstract"].str.lower().str.contains(tech_lower, na=False)
    )
    results = df[mask].to_dict(orient="records")
    return results


def get_all_patents() -> List[Dict[str, Any]]:
    """Return all patents."""
    csv_path = os.path.abspath(PATENTS_CSV_PATH)
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Patents dataset not found at {csv_path}")
    df = pd.read_csv(csv_path).fillna("")
    return df.to_dict(orient="records")
