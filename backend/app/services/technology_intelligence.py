"""
Technology Intelligence Module (spec section 6):
  - Emerging technology identification
  - Technology maturity analysis
  - Technology adoption tracking

Heuristic (Milestone 3, upgradable to a real ML classifier later):
  Combines publication trend direction (research_trends.analyze_trend) with patent
  filing volume in the same domain to classify each technology's maturity stage.
"""
from app.services.research_trends import analyze_trend

MATURITY_STAGES = ["Emerging", "Growing", "Mature", "Declining"]


def classify_maturity(is_publication_emerging: bool, patent_count: int, avg_patent_citations: float) -> str:
    if patent_count >= 10 and avg_patent_citations >= 10:
        return "Mature"
    if is_publication_emerging and patent_count >= 2:
        return "Growing"
    if is_publication_emerging and patent_count < 2:
        return "Emerging"
    return "Declining"


def analyze_technology(domain: str, patents_in_domain: list) -> dict:
    """
    Combines OpenAlex research trend data with patent volume for one technology domain.
    Falls back to a neutral trend (rather than raising) if OpenAlex is unreachable, so
    every caller -- dashboards, PDF reports, the score endpoint -- degrades gracefully
    instead of failing outright when the external API has an outage.
    """
    try:
        trend = analyze_trend(domain, limit=25)
    except Exception:
        trend = {
            "query": domain, "total_publications_sampled": 0,
            "publications_by_year": [], "top_venues": [],
            "avg_citations_per_paper": 0, "is_emerging_trend": False,
        }

    patent_count = len(patents_in_domain)
    avg_citations = (
        sum(p.citation_count for p in patents_in_domain) / patent_count if patent_count else 0
    )

    maturity = classify_maturity(trend["is_emerging_trend"], patent_count, avg_citations)

    return {
        "domain": domain,
        "maturity_stage": maturity,
        "publication_trend": trend,
        "patent_count": patent_count,
        "avg_patent_citations": round(avg_citations, 2),
        "is_emerging_opportunity": maturity in ("Emerging", "Growing"),
    }
