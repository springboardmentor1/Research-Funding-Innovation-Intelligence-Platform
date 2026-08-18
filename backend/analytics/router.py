"""
Analytics API Router.

Publication trends, emerging topics, keyword analysis, and
research intelligence dashboard endpoints.
"""

from fastapi import APIRouter, Query, HTTPException
from analytics.trends import get_publication_trends, get_area_distribution
from analytics.topics import get_top_keywords, get_keyword_trends, get_author_stats
from recommendation.engine import get_funding_data

router = APIRouter(prefix="/analytics", tags=["Research Analytics"])


# ── Publication Trends ────────────────────────────────────────────────────────


@router.get("/publication-trends")
def publication_trends(
    area: str = Query(None, description="Filter by research area keyword"),
):
    """
    Get publication trend data (papers per year).

    Optionally filter by research area to see domain-specific trends.
    """
    try:
        data = get_publication_trends(area=area)
        return data
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Top Keywords / Emerging Topics ────────────────────────────────────────────


@router.get("/top-keywords")
def top_keywords(
    limit: int = Query(10, ge=1, le=50, description="Number of keywords to return"),
):
    """Get the most frequent research keywords (emerging topics)."""
    try:
        topics = get_top_keywords(limit=limit)
        return {"count": len(topics), "topics": topics}
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/keyword-trends")
def keyword_trends():
    """Get per-year frequency trends for the top 5 keywords."""
    try:
        data = get_keyword_trends()
        return {"keyword_trends": data}
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Area Distribution ────────────────────────────────────────────────────────


@router.get("/area-distribution")
def area_distribution():
    """Get paper distribution across research areas."""
    try:
        areas = get_area_distribution()
        return {"areas": areas}
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Author Stats ─────────────────────────────────────────────────────────────


@router.get("/top-authors")
def top_authors(
    limit: int = Query(10, ge=1, le=50),
):
    """Get most prolific authors."""
    try:
        authors = get_author_stats(limit=limit)
        return {"authors": authors}
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Research Intelligence Dashboard ──────────────────────────────────────────


@router.get("/dashboard")
def intelligence_dashboard():
    """
    Aggregated research intelligence dashboard data.

    Returns combined stats: total papers, funding grants, trending topic,
    top agency, most active year, trends, and keyword data.
    """
    try:
        # Publication data
        pub_data = get_publication_trends()
        trends = pub_data.get("trends", [])

        # Find most active year
        most_active_year = None
        max_count = 0
        for t in trends:
            if t["count"] > max_count:
                max_count = t["count"]
                most_active_year = t["year"]

        # Top keywords
        keywords = get_top_keywords(limit=10)
        trending_topic = keywords[0]["keyword"] if keywords else "N/A"

        # Funding data
        try:
            funding_df = get_funding_data()
            total_grants = len(funding_df)
            # Top agency
            agency_counts = funding_df["Organization"].value_counts()
            top_agency = agency_counts.index[0] if not agency_counts.empty else "N/A"
            top_agency_count = int(agency_counts.iloc[0]) if not agency_counts.empty else 0

            # Agency distribution
            agency_dist = [
                {"agency": str(agency), "count": int(count)}
                for agency, count in agency_counts.items()
            ]

            # Funding by area
            area_counts = funding_df["Area"].value_counts()
            funding_by_area = [
                {"area": str(area), "count": int(count)}
                for area, count in area_counts.items()
            ]
        except Exception:
            total_grants = 0
            top_agency = "N/A"
            top_agency_count = 0
            agency_dist = []
            funding_by_area = []

        # Area distribution
        area_dist = get_area_distribution()

        return {
            "summary": {
                "total_papers": pub_data.get("total_papers", 0),
                "total_citations": pub_data.get("total_citations", 0),
                "avg_citations": pub_data.get("avg_citations", 0),
                "total_grants": total_grants,
                "trending_topic": trending_topic,
                "top_agency": top_agency,
                "top_agency_count": top_agency_count,
                "most_active_year": most_active_year,
            },
            "publication_trends": trends,
            "top_keywords": keywords,
            "agency_distribution": agency_dist,
            "funding_by_area": funding_by_area,
            "research_area_distribution": area_dist,
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Funding Analytics ────────────────────────────────────────────────────────


@router.get("/funding")
def funding_analytics():
    """
    Funding analytics — opportunities by area, agency, amount distribution,
    upcoming deadlines.
    """
    try:
        funding_df = get_funding_data()
        total = len(funding_df)

        # By area
        area_counts = funding_df["Area"].value_counts()
        by_area = [
            {"area": str(a), "count": int(c)}
            for a, c in area_counts.items()
        ]

        # By agency
        agency_counts = funding_df["Organization"].value_counts()
        by_agency = [
            {"agency": str(a), "count": int(c)}
            for a, c in agency_counts.items()
        ]

        # Amount distribution
        amounts = []
        for _, row in funding_df.iterrows():
            amt_str = str(row.get("Amount", ""))
            amounts.append(amt_str)

        # Upcoming deadlines (all)
        deadlines = []
        for _, row in funding_df.iterrows():
            deadlines.append({
                "grant": str(row.get("Grant", "")),
                "deadline": str(row.get("Deadline", "")),
                "area": str(row.get("Area", "")),
                "amount": str(row.get("Amount", "")),
                "organization": str(row.get("Organization", "")),
            })

        return {
            "total_opportunities": total,
            "by_area": by_area,
            "by_agency": by_agency,
            "deadlines": deadlines,
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Patent Analytics ─────────────────────────────────────────────────────────


@router.get("/patents")
def patent_analytics():
    """
    Patent analytics — patents by year, technology, country, top assignees,
    citation counts.
    """
    try:
        from innovation.patent_analytics import (
            get_patent_landscape,
            get_patent_trends,
            get_top_assignees,
        )

        landscape = get_patent_landscape()
        trends = get_patent_trends()
        assignees = get_top_assignees(limit=10)

        return {
            "total_patents": landscape["total_patents"],
            "by_technology": landscape.get("by_technology", []),
            "by_country": landscape.get("by_country", []),
            "by_year": landscape.get("by_year", []),
            "by_assignee": landscape.get("by_assignee", []),
            "trends": trends.get("trends", []),
            "citation_trends": trends.get("citation_trends", []),
            "top_assignees": assignees,
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Innovation Analytics ─────────────────────────────────────────────────────


@router.get("/innovation")
def innovation_analytics():
    """
    Innovation analytics — average score, top 10 innovations,
    technology readiness, market potential, funding attractiveness.
    """
    try:
        from innovation.scoring import get_score_distribution, get_ranked_patents

        score_dist = get_score_distribution()
        top_patents = get_ranked_patents(top_n=10)

        return {
            "average_score": score_dist.get("avg_score", 0),
            "max_score": score_dist.get("max_score", 0),
            "min_score": score_dist.get("min_score", 0),
            "total_patents": score_dist.get("total_patents", 0),
            "distribution": score_dist.get("distribution", []),
            "top_innovations": top_patents,
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Commercialization Analytics ──────────────────────────────────────────────


@router.get("/commercialization")
def commercialization_analytics():
    """
    Commercialization analytics — recommendations with scores,
    distribution summary, top commercializable patents.
    """
    try:
        from innovation.commercialization import get_commercialization_recommendations

        data = get_commercialization_recommendations()

        # Build a concise opportunities table
        opportunities = []
        for p in data.get("patents", [])[:20]:
            rec = p.get("recommendation", {})
            opportunities.append({
                "technology": p.get("technology", "N/A"),
                "score": p.get("innovation_score", 0),
                "recommendation": rec.get("action", "N/A"),
                "description": rec.get("description", ""),
            })

        return {
            "total_patents": data.get("total_patents", 0),
            "distribution": data.get("distribution", []),
            "top_commercializable": data.get("top_commercializable", [])[:10],
            "opportunities": opportunities,
            "thresholds": data.get("thresholds", []),
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))

