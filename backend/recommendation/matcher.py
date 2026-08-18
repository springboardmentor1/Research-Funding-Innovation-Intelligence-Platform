"""
Grant Matching Engine — Multi-criteria weighted scoring.

Goes beyond simple keyword matching by considering research area,
country eligibility, organization type, and keyword overlap.
"""

from typing import List, Dict, Any, Set
from recommendation.engine import _tokenize, _jaccard, get_funding_data


# ── Weights ───────────────────────────────────────────────────────────────────
WEIGHT_KEYWORDS = 0.40
WEIGHT_AREA = 0.25
WEIGHT_COUNTRY = 0.15
WEIGHT_ELIGIBILITY = 0.10
WEIGHT_ORG = 0.10


def _area_score(user_area: str, grant_area: str) -> float:
    """Score research-area alignment (exact → 1.0, partial → 0.5, none → 0)."""
    if not user_area or not grant_area:
        return 0.0
    ua, ga = user_area.lower().strip(), grant_area.lower().strip()
    if ua == ga:
        return 1.0
    if ua in ga or ga in ua:
        return 0.7
    # Token overlap
    user_tokens = set(ua.split())
    grant_tokens = set(ga.split())
    if user_tokens & grant_tokens:
        return 0.4
    return 0.0


def _country_score(user_country: str, grant_country: str) -> float:
    """1.0 if countries match or grant is global, else 0."""
    if not grant_country:
        return 0.5
    gc = grant_country.lower().strip()
    if gc in ("global", "international", "worldwide"):
        return 1.0
    if not user_country:
        return 0.3
    return 1.0 if user_country.lower().strip() in gc else 0.0


def _eligibility_score(user_org: str, grant_elig: str) -> float:
    """Check if user's organization type appears in the eligibility list."""
    if not grant_elig:
        return 0.5
    if not user_org:
        return 0.3
    return 0.8 if user_org.lower().strip() in grant_elig.lower() else 0.2


def _org_score(user_university: str, grant_org: str) -> float:
    """Bonus when the user is from the same organization offering the grant."""
    if not user_university or not grant_org:
        return 0.0
    if grant_org.lower().strip() in user_university.lower().strip():
        return 1.0
    return 0.0


def match_grants(
    research_interests: str,
    user_keywords: str,
    research_area: str,
    country: str = "India",
    university: str = "",
    department: str = "",
    top_n: int = 10,
) -> List[Dict[str, Any]]:
    """
    Multi-criteria grant matching with weighted composite score.

    Returns a ranked list of grants with individual and composite scores.
    """
    df = get_funding_data()

    user_tokens: Set[str] = (
        _tokenize(research_interests)
        | _tokenize(user_keywords)
        | _tokenize(research_area)
    )

    results: List[Dict[str, Any]] = []
    for _, row in df.iterrows():
        grant_tokens = _tokenize(str(row.get("Keywords", ""))) | _tokenize(
            str(row.get("Area", ""))
        )

        kw = _jaccard(user_tokens, grant_tokens)
        ar = _area_score(research_area, str(row.get("Area", "")))
        co = _country_score(country, str(row.get("Country", "")))
        el = _eligibility_score(department, str(row.get("Eligibility", "")))
        og = _org_score(university, str(row.get("Organization", "")))

        composite = (
            WEIGHT_KEYWORDS * kw
            + WEIGHT_AREA * ar
            + WEIGHT_COUNTRY * co
            + WEIGHT_ELIGIBILITY * el
            + WEIGHT_ORG * og
        )

        results.append(
            {
                "grant_name": row.get("Grant", ""),
                "agency": row.get("Organization", ""),
                "area": row.get("Area", ""),
                "amount": row.get("Amount", ""),
                "deadline": row.get("Deadline", ""),
                "description": row.get("Description", ""),
                "country": row.get("Country", ""),
                "eligibility": row.get("Eligibility", ""),
                "keywords": row.get("Keywords", ""),
                "similarity_score": round(composite * 100, 1),
                "breakdown": {
                    "keyword_match": round(kw * 100, 1),
                    "area_match": round(ar * 100, 1),
                    "country_match": round(co * 100, 1),
                    "eligibility_match": round(el * 100, 1),
                    "org_match": round(og * 100, 1),
                },
            }
        )

    results.sort(key=lambda r: r["similarity_score"], reverse=True)
    return results[:top_n]
