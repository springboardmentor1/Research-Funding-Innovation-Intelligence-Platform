"""
Technology Intelligence Engine.

Analyses patent data to:
- Rank technologies by frequency
- Detect emerging (fastest-growing) technologies
- Build year × technology growth matrix
"""

import pandas as pd
import os
from typing import List, Dict, Any

PATENTS_CSV = os.path.join(os.path.dirname(__file__), "..", "dataset", "patents.csv")


def _load_patents() -> pd.DataFrame:
    csv_path = os.path.abspath(PATENTS_CSV)
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Patents dataset not found at {csv_path}")
    df = pd.read_csv(csv_path).fillna("")
    df["Year"] = pd.to_datetime(df["Filing Date"], errors="coerce").dt.year
    return df


def get_technology_frequency() -> List[Dict[str, Any]]:
    """
    Count patents per technology and rank by frequency.

    Returns a ranked list of technologies with patent counts, avg citations,
    and percentage share.
    """
    df = _load_patents()
    total = len(df)

    tech_stats = df.groupby("Technology").agg(
        count=("Patent ID", "count"),
        avg_citations=("Citations", "mean"),
        top_assignee=("Assignee", lambda x: x.value_counts().index[0] if len(x) > 0 else "N/A"),
    ).reset_index()

    tech_stats = tech_stats.sort_values("count", ascending=False)

    return [
        {
            "technology": row["Technology"],
            "count": int(row["count"]),
            "percentage": round(int(row["count"]) / total * 100, 1),
            "avg_citations": round(float(row["avg_citations"]), 1),
            "top_assignee": row["top_assignee"],
        }
        for _, row in tech_stats.iterrows()
    ]


def get_emerging_technologies(top_n: int = 10) -> List[Dict[str, Any]]:
    """
    Identify fastest-growing technologies by comparing recent vs. earlier years.

    Growth is measured as the ratio of patents in the latest 2 years vs.
    the earliest 2 years in the dataset.
    """
    df = _load_patents()
    years = sorted(df["Year"].unique())

    if len(years) < 3:
        return []

    # Split into early period and recent period
    mid = len(years) // 2
    early_years = set(years[:mid])
    recent_years = set(years[mid:])

    tech_growth = []
    for tech in df["Technology"].unique():
        tech_df = df[df["Technology"] == tech]
        early_count = len(tech_df[tech_df["Year"].isin(early_years)])
        recent_count = len(tech_df[tech_df["Year"].isin(recent_years)])

        if early_count > 0:
            growth_rate = round(((recent_count - early_count) / early_count) * 100, 1)
        else:
            growth_rate = 100.0 if recent_count > 0 else 0.0

        # Year-by-year counts for sparkline
        yearly = tech_df.groupby("Year").size().reset_index(name="count").sort_values("Year")
        yearly_data = [{"year": int(r["Year"]), "count": int(r["count"])} for _, r in yearly.iterrows()]

        tech_growth.append({
            "technology": tech,
            "early_count": early_count,
            "recent_count": recent_count,
            "total_count": early_count + recent_count,
            "growth_rate": growth_rate,
            "trend": "rising" if growth_rate > 30 else "stable" if growth_rate > -10 else "declining",
            "yearly_data": yearly_data,
        })

    tech_growth.sort(key=lambda x: x["growth_rate"], reverse=True)
    return tech_growth[:top_n]


def get_technology_growth_matrix() -> Dict[str, Any]:
    """
    Build a Year × Technology count matrix for heatmap / multi-line chart.
    """
    df = _load_patents()
    pivot = df.groupby(["Year", "Technology"]).size().reset_index(name="count")
    technologies = sorted(df["Technology"].unique())
    years = sorted(df["Year"].unique())

    # Build matrix as list of dicts (one per year, with tech counts)
    matrix = []
    for year in years:
        row = {"year": int(year)}
        year_data = pivot[pivot["Year"] == year]
        for tech in technologies:
            tech_count = year_data[year_data["Technology"] == tech]["count"]
            row[tech] = int(tech_count.values[0]) if len(tech_count) > 0 else 0
        matrix.append(row)

    return {
        "technologies": technologies,
        "years": [int(y) for y in years],
        "matrix": matrix,
    }
