"""
Innovation Scoring Engine.

Assigns a weighted innovation score to each patent using:
  - Research Novelty  (30%) — recency + technology rarity
  - Patent Strength   (20%) — citation count relative to peers
  - Technology Maturity (15%) — based on technology age spread
  - Market Potential   (20%) — technology growth rate
  - Funding Relevance  (15%) — overlap with funding.csv areas

Formula:
  Innovation Score = (Novelty × 0.30) + (Strength × 0.20) +
                     (Maturity × 0.15) + (Market × 0.20) +
                     (Funding × 0.15)
"""

import pandas as pd
import os
from typing import List, Dict, Any

PATENTS_CSV = os.path.join(os.path.dirname(__file__), "..", "dataset", "patents.csv")
FUNDING_CSV = os.path.join(os.path.dirname(__file__), "..", "dataset", "funding.csv")


def _load_patents() -> pd.DataFrame:
    csv_path = os.path.abspath(PATENTS_CSV)
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Patents dataset not found at {csv_path}")
    df = pd.read_csv(csv_path).fillna("")
    df["Year"] = pd.to_datetime(df["Filing Date"], errors="coerce").dt.year
    df["Citations"] = pd.to_numeric(df["Citations"], errors="coerce").fillna(0).astype(int)
    return df


def _load_funding_areas() -> set:
    """Load unique funding areas and keywords for relevance scoring."""
    csv_path = os.path.abspath(FUNDING_CSV)
    if not os.path.exists(csv_path):
        return set()
    df = pd.read_csv(csv_path).fillna("")
    areas = set()
    for _, row in df.iterrows():
        area = str(row.get("Area", "")).lower().strip()
        if area:
            areas.add(area)
        keywords = str(row.get("Keywords", ""))
        for kw in keywords.split(","):
            kw = kw.strip().lower()
            if kw:
                areas.add(kw)
    return areas


def _normalize(values: pd.Series) -> pd.Series:
    """Min-max normalize a series to 0–100 range."""
    vmin, vmax = values.min(), values.max()
    if vmax == vmin:
        return pd.Series([50.0] * len(values), index=values.index)
    return ((values - vmin) / (vmax - vmin) * 100).round(1)


def compute_innovation_scores() -> List[Dict[str, Any]]:
    """
    Compute innovation scores for all patents.

    Returns a list of patent dicts with individual component scores
    and the weighted composite score.
    """
    df = _load_patents()
    funding_areas = _load_funding_areas()

    max_year = df["Year"].max()

    # ── 1. Research Novelty (30%) ─────────────────────────────────────────────
    # Recency: more recent = higher novelty
    recency = df["Year"] - df["Year"].min()
    # Technology rarity: rarer tech = more novel
    tech_counts = df["Technology"].value_counts()
    rarity = df["Technology"].map(lambda t: 1.0 / tech_counts.get(t, 1))
    novelty_raw = _normalize(recency) * 0.7 + _normalize(rarity) * 0.3
    novelty = _normalize(novelty_raw)

    # ── 2. Patent Strength (20%) ──────────────────────────────────────────────
    # Citation-based, normalized across dataset
    strength = _normalize(df["Citations"].astype(float))

    # ── 3. Technology Maturity (15%) ──────────────────────────────────────────
    # Technologies with longer history and wider adoption = more mature
    tech_year_range = df.groupby("Technology")["Year"].agg(["min", "max", "count"])
    tech_year_range["maturity"] = (
        (tech_year_range["max"] - tech_year_range["min"]) * 0.4 +
        tech_year_range["count"] * 0.6
    )
    tech_maturity_norm = _normalize(tech_year_range["maturity"])
    maturity = df["Technology"].map(lambda t: tech_maturity_norm.get(t, 50.0))
    maturity = maturity.astype(float)

    # ── 4. Market Potential (20%) ─────────────────────────────────────────────
    # Growth rate of the patent's technology
    years = sorted(df["Year"].unique())
    mid = len(years) // 2
    early_years = set(years[:mid])
    recent_years = set(years[mid:])

    growth_by_tech = {}
    for tech in df["Technology"].unique():
        tech_df = df[df["Technology"] == tech]
        early = len(tech_df[tech_df["Year"].isin(early_years)])
        recent = len(tech_df[tech_df["Year"].isin(recent_years)])
        if early > 0:
            growth_by_tech[tech] = ((recent - early) / early) * 100
        else:
            growth_by_tech[tech] = 100.0 if recent > 0 else 0.0

    market_raw = df["Technology"].map(lambda t: growth_by_tech.get(t, 0.0))
    market = _normalize(market_raw)

    # ── 5. Funding Relevance (15%) ────────────────────────────────────────────
    # Check if patent's technology appears in funding keywords/areas
    def funding_score(row):
        tech = str(row["Technology"]).lower()
        title = str(row["Title"]).lower()
        matches = sum(1 for area in funding_areas if area in tech or area in title)
        return min(matches * 25, 100)  # cap at 100

    funding = df.apply(funding_score, axis=1).astype(float)

    # ── Composite Score ───────────────────────────────────────────────────────
    composite = (
        novelty * 0.30 +
        strength * 0.20 +
        maturity * 0.15 +
        market * 0.20 +
        funding * 0.15
    ).round(1)

    # Build results
    results = []
    for i, (_, row) in enumerate(df.iterrows()):
        results.append({
            "patent_id": row["Patent ID"],
            "title": row["Title"],
            "assignee": row["Assignee"],
            "inventor": row["Inventor"],
            "year": int(row["Year"]) if pd.notna(row["Year"]) else 0,
            "technology": row["Technology"],
            "country": row["Country"],
            "citations": int(row["Citations"]),
            "cpc_class": row["CPC Class"],
            "innovation_score": float(composite.iloc[i]),
            "breakdown": {
                "research_novelty": float(novelty.iloc[i]),
                "patent_strength": float(strength.iloc[i]),
                "technology_maturity": float(maturity.iloc[i]),
                "market_potential": float(market.iloc[i]),
                "funding_relevance": float(funding.iloc[i]),
            },
        })

    # Sort by score descending
    results.sort(key=lambda r: r["innovation_score"], reverse=True)
    return results


def get_ranked_patents(top_n: int = 20) -> List[Dict[str, Any]]:
    """Return the top N patents by innovation score."""
    all_scores = compute_innovation_scores()
    return all_scores[:top_n]


def get_score_distribution() -> Dict[str, Any]:
    """Get innovation score distribution for histogram."""
    all_scores = compute_innovation_scores()
    scores = [p["innovation_score"] for p in all_scores]

    # Buckets: 0-20, 20-40, 40-60, 60-80, 80-100
    buckets = [
        {"range": "0-20", "count": sum(1 for s in scores if s < 20)},
        {"range": "20-40", "count": sum(1 for s in scores if 20 <= s < 40)},
        {"range": "40-60", "count": sum(1 for s in scores if 40 <= s < 60)},
        {"range": "60-80", "count": sum(1 for s in scores if 60 <= s < 80)},
        {"range": "80-100", "count": sum(1 for s in scores if s >= 80)},
    ]

    avg_score = round(sum(scores) / len(scores), 1) if scores else 0
    max_score = round(max(scores), 1) if scores else 0
    min_score = round(min(scores), 1) if scores else 0

    return {
        "distribution": buckets,
        "avg_score": avg_score,
        "max_score": max_score,
        "min_score": min_score,
        "total_patents": len(scores),
    }
