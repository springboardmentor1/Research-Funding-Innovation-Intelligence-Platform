"""
Funding Opportunity Discovery Module (spec section 3):
  - Funding recommendation engine
  - Eligibility matching

Scoring: Domain overlap 50%, Keyword overlap 30%, Role eligibility 20%
(role mismatch also hard-flags 'eligible': false, not just a score penalty)
"""
from app.models.profile import ResearchProfile
from app.models.funding import FundingOpportunity
from app.models.user import User


def _normalize(items: list[str]) -> set[str]:
    return {i.strip().lower() for i in items if i and i.strip()}


def score_opportunity(user: User, profile: ResearchProfile, opportunity: FundingOpportunity) -> dict:
    profile_domains = _normalize(profile.research_domains or [])
    profile_keywords = _normalize(profile.keywords or [])

    opp_domains = _normalize(opportunity.eligible_domains or [])
    opp_keywords = _normalize(opportunity.eligible_keywords or [])
    opp_roles = _normalize(opportunity.eligible_roles or [])

    matched_domains = profile_domains & opp_domains
    matched_keywords = profile_keywords & opp_keywords

    domain_score = (len(matched_domains) / len(opp_domains)) if opp_domains else 0.5
    keyword_score = (len(matched_keywords) / len(opp_keywords)) if opp_keywords else 0.5

    if not opp_domains and not opp_keywords:
        domain_score = keyword_score = 0.3

    role_eligible = (not opp_roles) or (user.role.value in opp_roles)

    match_score = round((domain_score * 0.5 + keyword_score * 0.3 + (1.0 if role_eligible else 0.0) * 0.2) * 100, 1)

    return {
        "match_score": match_score,
        "matched_domains": sorted(matched_domains),
        "matched_keywords": sorted(matched_keywords),
        "eligible": role_eligible,
    }


def recommend_funding(user: User, profile: ResearchProfile, opportunities: list[FundingOpportunity], top_n: int = 10) -> list[dict]:
    scored = []
    for opp in opportunities:
        result = score_opportunity(user, profile, opp)
        scored.append({"opportunity": opp, **result})

    scored.sort(key=lambda r: (r["eligible"], r["match_score"]), reverse=True)
    return scored[:top_n]
