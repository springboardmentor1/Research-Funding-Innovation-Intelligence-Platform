"""
Innovation Scoring Engine (spec section 7):
  Innovation Score = Research Novelty (30%) + Patent Strength (20%)
                    + Technology Maturity (15%) + Market Potential (20%)
                    + Funding Relevance (15%)
"""
from app.models.user import User
from app.models.profile import ResearchProfile
from app.models.patent import Patent
from app.models.funding import FundingOpportunity
from app.services.technology_intelligence import analyze_technology
from app.services.funding_engine import recommend_funding

WEIGHTS = {
    "research_novelty": 0.30,
    "patent_strength": 0.20,
    "technology_maturity": 0.15,
    "market_potential": 0.20,
    "funding_relevance": 0.15,
}

MATURITY_SCORE_MAP = {"Emerging": 50, "Growing": 75, "Mature": 100, "Declining": 25}


def _research_novelty_score(trend: dict) -> float:
    score = 50.0
    if trend.get("is_emerging_trend"):
        score += 30
    if trend.get("avg_citations_per_paper", 0) >= 5:
        score += 20
    return min(score, 100.0)


def _patent_strength_score(domain_patents: list[Patent]) -> float:
    if not domain_patents:
        return 0.0
    count_score = min(len(domain_patents) * 10, 60)
    avg_citations = sum(p.citation_count for p in domain_patents) / len(domain_patents)
    citation_score = min(avg_citations * 2, 40)
    return round(count_score + citation_score, 2)


def _market_and_funding_scores(user: User, profile: ResearchProfile, opportunities: list[FundingOpportunity]) -> tuple[float, float]:
    if not opportunities:
        return 0.0, 0.0

    ranked = recommend_funding(user, profile, opportunities, top_n=len(opportunities))
    eligible = [r for r in ranked if r["eligible"]]

    funding_relevance = eligible[0]["match_score"] if eligible else 0.0

    distinct_categories = {r["opportunity"].source_category for r in eligible}
    market_potential = min(len(distinct_categories) * 25 + len(eligible) * 5, 100.0)

    return round(market_potential, 2), round(funding_relevance, 2)


def compute_innovation_score(
    user: User,
    profile: ResearchProfile,
    domain_patents: list[Patent],
    all_opportunities: list[FundingOpportunity],
) -> dict:
    top_domain = (profile.research_domains or [None])[0]
    if not top_domain:
        raise ValueError("Profile has no research_domains set; cannot compute innovation score")

    tech_analysis = analyze_technology(top_domain, domain_patents)

    research_novelty = _research_novelty_score(tech_analysis["publication_trend"])
    patent_strength = _patent_strength_score(domain_patents)
    technology_maturity = MATURITY_SCORE_MAP.get(tech_analysis["maturity_stage"], 50)
    market_potential, funding_relevance = _market_and_funding_scores(user, profile, all_opportunities)

    total = (
        research_novelty * WEIGHTS["research_novelty"]
        + patent_strength * WEIGHTS["patent_strength"]
        + technology_maturity * WEIGHTS["technology_maturity"]
        + market_potential * WEIGHTS["market_potential"]
        + funding_relevance * WEIGHTS["funding_relevance"]
    )

    return {
        "domain": top_domain,
        "innovation_score": round(total, 2),
        "breakdown": {
            "research_novelty": {"score": research_novelty, "weight": WEIGHTS["research_novelty"]},
            "patent_strength": {"score": patent_strength, "weight": WEIGHTS["patent_strength"]},
            "technology_maturity": {"score": technology_maturity, "weight": WEIGHTS["technology_maturity"]},
            "market_potential": {"score": market_potential, "weight": WEIGHTS["market_potential"]},
            "funding_relevance": {"score": funding_relevance, "weight": WEIGHTS["funding_relevance"]},
        },
        "maturity_stage": tech_analysis["maturity_stage"],
    }
