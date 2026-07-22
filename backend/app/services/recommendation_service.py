from app.models.funding import FundingOpportunity
from app.models.research_profile import ResearchProfile


def calculate_match_score(
    profile: ResearchProfile,
    funding: FundingOpportunity
):
    score = 0
    matched_keywords = []

    # Research Domain Match
    if (
        profile.research_domain
        and funding.research_area
        and profile.research_domain.lower() == funding.research_area.lower()
    ):
        score += 40

    # Technology Area Match
    if (
        profile.technology_area
        and funding.description
        and profile.technology_area.lower() in funding.description.lower()
    ):
        score += 20

    # Keyword Match
    if profile.keywords and funding.keywords:

        profile_keywords = [
            k.strip().lower()
            for k in profile.keywords.split(",")
        ]

        funding_keywords = [
            k.strip().lower()
            for k in funding.keywords.split(",")
        ]

        for keyword in profile_keywords:

            if keyword in funding_keywords:
                score += 10
                matched_keywords.append(keyword)

    # Experience Bonus
    if profile.publication_count >= 5:
        score += 10

    if profile.patent_count >= 2:
        score += 10

    return {
        "score": score,
        "matched_keywords": matched_keywords
    }