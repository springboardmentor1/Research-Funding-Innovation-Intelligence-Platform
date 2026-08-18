"""
Patent Landscape Analysis & Trend Module.

Reads the expanded patents.csv and computes:
- Distribution by Technology, Country, Year, Assignee, Inventor
- Yearly patent filing trends with growth rates
- Top assignees (companies) by patent count
"""

import pandas as pd
import os
from typing import List, Dict, Any, Optional

PATENTS_CSV = os.path.join(os.path.dirname(__file__), "..", "dataset", "patents.csv")


def _load_patents() -> pd.DataFrame:
    """Load the patents dataset from CSV."""
    csv_path = os.path.abspath(PATENTS_CSV)
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Patents dataset not found at {csv_path}")
    return pd.read_csv(csv_path).fillna("")


def get_patent_landscape() -> Dict[str, Any]:
    """
    Full patent landscape analysis.

    Groups patents by Technology, Country, Year, Assignee, and returns
    distributions for chart rendering.
    """
    df = _load_patents()

    # By Technology
    tech_dist = (
        df.groupby("Technology").size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .to_dict(orient="records")
    )

    # By Country
    country_dist = (
        df.groupby("Country").size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .to_dict(orient="records")
    )

    # By Year (extract year from Filing Date)
    df["Year"] = pd.to_datetime(df["Filing Date"], errors="coerce").dt.year
    year_dist = (
        df.groupby("Year").size()
        .reset_index(name="count")
        .sort_values("Year")
        .to_dict(orient="records")
    )

    # By Assignee (top 15)
    assignee_dist = (
        df.groupby("Assignee").size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .head(15)
        .to_dict(orient="records")
    )

    # By Inventor (top 15)
    inventor_dist = (
        df.groupby("Inventor").size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .head(15)
        .to_dict(orient="records")
    )

    # By CPC Class
    cpc_dist = (
        df.groupby("CPC Class").size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .to_dict(orient="records")
    )

    return {
        "total_patents": len(df),
        "total_technologies": df["Technology"].nunique(),
        "total_countries": df["Country"].nunique(),
        "total_assignees": df["Assignee"].nunique(),
        "by_technology": tech_dist,
        "by_country": country_dist,
        "by_year": year_dist,
        "by_assignee": assignee_dist,
        "by_inventor": inventor_dist,
        "by_cpc_class": cpc_dist,
    }


def get_patent_trends() -> Dict[str, Any]:
    """
    Count patents per year with year-over-year growth rates.

    Returns yearly counts and growth percentages for line chart rendering.
    """
    df = _load_patents()
    df["Year"] = pd.to_datetime(df["Filing Date"], errors="coerce").dt.year

    year_counts = df.groupby("Year").size().reset_index(name="count").sort_values("Year")

    trends = []
    prev_count = 0
    for _, row in year_counts.iterrows():
        count = int(row["count"])
        growth = round(((count - prev_count) / prev_count) * 100, 1) if prev_count > 0 else 0.0
        trends.append({
            "year": int(row["Year"]),
            "count": count,
            "growth_pct": growth,
        })
        prev_count = count

    # Citation trends by year
    citation_by_year = (
        df.groupby("Year")["Citations"]
        .agg(["sum", "mean"])
        .reset_index()
        .sort_values("Year")
    )
    citation_trends = [
        {
            "year": int(r["Year"]),
            "total_citations": int(r["sum"]),
            "avg_citations": round(float(r["mean"]), 1),
        }
        for _, r in citation_by_year.iterrows()
    ]

    return {
        "trends": trends,
        "citation_trends": citation_trends,
        "total_patents": len(df),
        "total_citations": int(df["Citations"].sum()),
        "avg_citations": round(float(df["Citations"].mean()), 1),
        "year_range": {
            "min": int(df["Year"].min()),
            "max": int(df["Year"].max()),
        },
    }


def get_top_assignees(limit: int = 10) -> List[Dict[str, Any]]:
    """Get top patent-holding companies/assignees."""
    df = _load_patents()
    counts = df.groupby("Assignee").agg(
        patent_count=("Patent ID", "count"),
        avg_citations=("Citations", "mean"),
        technologies=("Technology", lambda x: list(x.unique())),
    ).reset_index()
    counts = counts.sort_values("patent_count", ascending=False).head(limit)

    return [
        {
            "assignee": row["Assignee"],
            "patent_count": int(row["patent_count"]),
            "avg_citations": round(float(row["avg_citations"]), 1),
            "technologies": row["technologies"],
        }
        for _, row in counts.iterrows()
    ]
