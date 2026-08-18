"""
Innovation Intelligence API Router — Milestone 3.

Endpoints:
  GET /innovation/patent-landscape       — Patent landscape analysis
  GET /innovation/patent-trends          — Yearly patent trends
  GET /innovation/technology-intelligence — Technology frequency ranking
  GET /innovation/emerging-technologies  — Fastest-growing technologies
  GET /innovation/scores                 — Innovation scores for all patents
  GET /innovation/commercialization      — Commercialization recommendations
  GET /innovation/dashboard              — Aggregated innovation dashboard
"""

from fastapi import APIRouter, Query, HTTPException

from innovation.patent_analytics import (
    get_patent_landscape,
    get_patent_trends,
    get_top_assignees,
)
from innovation.tech_intelligence import (
    get_technology_frequency,
    get_emerging_technologies,
    get_technology_growth_matrix,
)
from innovation.scoring import (
    compute_innovation_scores,
    get_ranked_patents,
    get_score_distribution,
)
from innovation.commercialization import get_commercialization_recommendations

router = APIRouter(prefix="/innovation", tags=["Innovation Intelligence"])


# ── Patent Landscape ──────────────────────────────────────────────────────────

@router.get("/patent-landscape")
def patent_landscape():
    """Full patent landscape analysis — distributions by technology, country, year, assignee."""
    try:
        return get_patent_landscape()
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Patent Trends ─────────────────────────────────────────────────────────────

@router.get("/patent-trends")
def patent_trends():
    """Yearly patent filing trends with growth rates."""
    try:
        return get_patent_trends()
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Technology Intelligence ───────────────────────────────────────────────────

@router.get("/technology-intelligence")
def technology_intelligence():
    """Technology frequency ranking with stats."""
    try:
        freq = get_technology_frequency()
        matrix = get_technology_growth_matrix()
        return {
            "technologies": freq,
            "growth_matrix": matrix,
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Emerging Technologies ─────────────────────────────────────────────────────

@router.get("/emerging-technologies")
def emerging_technologies(
    top_n: int = Query(10, ge=1, le=20, description="Number of emerging technologies to return"),
):
    """Identify the fastest-growing technologies."""
    try:
        return {"emerging": get_emerging_technologies(top_n=top_n)}
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Innovation Scores ─────────────────────────────────────────────────────────

@router.get("/scores")
def innovation_scores(
    top_n: int = Query(None, ge=1, le=500, description="Limit to top N patents (optional)"),
):
    """Get innovation scores for all patents (or top N)."""
    try:
        if top_n:
            patents = get_ranked_patents(top_n=top_n)
        else:
            patents = compute_innovation_scores()
        dist = get_score_distribution()
        return {
            "patents": patents,
            "distribution": dist,
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Commercialization ─────────────────────────────────────────────────────────

@router.get("/commercialization")
def commercialization():
    """Commercialization recommendations for all patents."""
    try:
        return get_commercialization_recommendations()
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Innovation Dashboard ─────────────────────────────────────────────────────

@router.get("/dashboard")
def innovation_dashboard():
    """
    Aggregated innovation dashboard data.

    Returns combined stats: total patents, top technology, top company,
    highest score, emerging technologies, commercialization summary.
    """
    try:
        landscape = get_patent_landscape()
        trends = get_patent_trends()
        tech_freq = get_technology_frequency()
        emerging = get_emerging_technologies(top_n=5)
        top_patents = get_ranked_patents(top_n=10)
        score_dist = get_score_distribution()
        commerc = get_commercialization_recommendations()

        # Top technology
        top_tech = tech_freq[0] if tech_freq else {"technology": "N/A", "count": 0}
        # Top company
        top_assignees = landscape.get("by_assignee", [])
        top_company = top_assignees[0] if top_assignees else {"Assignee": "N/A", "count": 0}

        return {
            "summary": {
                "total_patents": landscape["total_patents"],
                "total_technologies": landscape["total_technologies"],
                "total_countries": landscape["total_countries"],
                "total_assignees": landscape["total_assignees"],
                "highest_score": score_dist["max_score"],
                "avg_score": score_dist["avg_score"],
                "top_technology": top_tech["technology"],
                "top_technology_count": top_tech["count"],
                "top_company": top_company.get("Assignee", top_company.get("assignee", "N/A")),
                "top_company_count": top_company.get("count", 0),
            },
            "patent_trends": trends["trends"],
            "technology_ranking": tech_freq[:8],
            "emerging_technologies": emerging,
            "top_scored_patents": top_patents[:5],
            "score_distribution": score_dist["distribution"],
            "commercialization_distribution": commerc["distribution"],
            "top_commercializable": commerc["top_commercializable"][:5],
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
