import pandas as pd
import os
from typing import List, Dict, Any

PATENTS_CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "dataset", "patents.csv")


def _load_df() -> pd.DataFrame:
    """Load the patents CSV, filling NA values."""
    csv_path = os.path.abspath(PATENTS_CSV_PATH)
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Patents dataset not found at {csv_path}")
    return pd.read_csv(csv_path).fillna("")


def search_patents(query: str) -> List[Dict[str, Any]]:
    """
    Search patents by keyword (case-insensitive, partial match).
    Searches across Title, Technology, Abstract, Assignee, Country, and CPC Class.

    Args:
        query: Search keyword

    Returns:
        List of matching patent dicts
    """
    df = _load_df()
    q = query.lower()

    # Search across multiple columns
    searchable = ["Title", "Technology", "Abstract", "Assignee", "Country", "CPC Class", "Inventor"]
    mask = pd.Series([False] * len(df), index=df.index)
    for col in searchable:
        if col in df.columns:
            mask = mask | df[col].str.lower().str.contains(q, na=False)

    return df[mask].to_dict(orient="records")


def get_all_patents() -> List[Dict[str, Any]]:
    """Return all patents."""
    df = _load_df()
    return df.to_dict(orient="records")
