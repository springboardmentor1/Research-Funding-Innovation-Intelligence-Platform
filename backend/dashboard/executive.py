"""
Executive Dashboard — Aggregated Intelligence Summary.

Pulls data from every existing service module and returns a single
unified payload for the Executive Dashboard frontend page.
"""

from typing import Dict, Any, List

from analytics.trends import get_publication_trends, get_area_distribution
from analytics.topics import get_top_keywords
from recommendation.engine import get_funding_data
from innovation.patent_analytics import get_patent_landscape, get_patent_trends
from innovation.tech_intelligence import get_technology_frequency, get_emerging_technologies
from innovation.scoring import get_score_distribution, get_ranked_patents
from innovation.commercialization import get_commercialization_recommendations


def get_executive_summary() -> Dict[str, Any]:
    """
    Build the full executive dashboard payload.

    Aggregates:
      - Research papers summary (total, top topic)
      - Funding summary (total opportunities, top agency)
      - Patent summary (total, top technology)
      - Innovation score summary (average, max)
      - Commercialization summary (top opportunity)
    """

    # ── Research ──────────────────────────────────────────────────────────────
    try:
        pub_data = get_publication_trends()
        total_papers = pub_data.get("total_papers", 0)
        pub_trends = pub_data.get("trends", [])
    except Exception:
        total_papers = 0
        pub_trends = []

    try:
        keywords = get_top_keywords(limit=10)
        top_research_topic = keywords[0]["keyword"] if keywords else "N/A"
    except Exception:
        keywords = []
        top_research_topic = "N/A"

    try:
        area_distribution = get_area_distribution()
    except Exception:
        area_distribution = []

    # ── Funding ───────────────────────────────────────────────────────────────
    try:
        funding_df = get_funding_data()
        total_funding = len(funding_df)

        agency_counts = funding_df["Organization"].value_counts()
        top_agency = str(agency_counts.index[0]) if not agency_counts.empty else "N/A"

        area_counts = funding_df["Area"].value_counts()
        funding_by_area = [
            {"area": str(area), "count": int(count)}
            for area, count in area_counts.items()
        ]
    except Exception:
        total_funding = 0
        top_agency = "N/A"
        funding_by_area = []

    # ── Patents ───────────────────────────────────────────────────────────────
    try:
        landscape = get_patent_landscape()
        total_patents = landscape["total_patents"]
    except Exception:
        total_patents = 0
        landscape = {}

    try:
        patent_trend_data = get_patent_trends()
        patent_trends = patent_trend_data.get("trends", [])
    except Exception:
        patent_trends = []

    # ── Technology ────────────────────────────────────────────────────────────
    try:
        tech_freq = get_technology_frequency()
        top_technology = tech_freq[0]["technology"] if tech_freq else "N/A"
    except Exception:
        tech_freq = []
        top_technology = "N/A"

    try:
        emerging = get_emerging_technologies(top_n=5)
    except Exception:
        emerging = []

    # ── Innovation ────────────────────────────────────────────────────────────
    try:
        score_dist = get_score_distribution()
        avg_innovation_score = score_dist.get("avg_score", 0)
        max_innovation_score = score_dist.get("max_score", 0)
    except Exception:
        avg_innovation_score = 0
        max_innovation_score = 0
        score_dist = {}

    try:
        top_patents = get_ranked_patents(top_n=10)
    except Exception:
        top_patents = []

    # ── Commercialization ─────────────────────────────────────────────────────
    try:
        commerc = get_commercialization_recommendations()
        top_commercializable = commerc.get("top_commercializable", [])[:5]
        commerc_distribution = commerc.get("distribution", [])

        # Top commercialization opportunity
        if top_commercializable:
            top_opp = top_commercializable[0]
            top_commercialization = {
                "technology": top_opp.get("technology", "N/A"),
                "score": top_opp.get("innovation_score", 0),
                "recommendation": top_opp.get("recommendation", {}).get("action", "N/A"),
            }
        else:
            top_commercialization = {"technology": "N/A", "score": 0, "recommendation": "N/A"}
    except Exception:
        top_commercializable = []
        commerc_distribution = []
        top_commercialization = {"technology": "N/A", "score": 0, "recommendation": "N/A"}

    # ── Build response ────────────────────────────────────────────────────────
    return {
        "summary": {
            "total_papers": total_papers,
            "total_funding": total_funding,
            "total_patents": total_patents,
            "top_research_topic": top_research_topic,
            "top_technology": top_technology,
            "average_innovation_score": avg_innovation_score,
            "max_innovation_score": max_innovation_score,
            "top_agency": top_agency,
            "top_commercialization": top_commercialization,
        },
        "publication_trends": pub_trends,
        "funding_by_area": funding_by_area,
        "patent_trends": patent_trends,
        "emerging_technologies": emerging,
        "top_keywords": keywords,
        "area_distribution": area_distribution,
        "technology_ranking": tech_freq[:8] if tech_freq else [],
        "top_scored_patents": top_patents[:5],
        "commercialization_distribution": commerc_distribution,
        "top_commercializable": top_commercializable,
    }
