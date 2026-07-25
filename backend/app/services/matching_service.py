from datetime import date

from sqlalchemy.orm import Session

from app.models.research_profile import ResearchProfile
from app.models.funding_opportunity import FundingOpportunity


def get_matching_funding(db: Session, user_id: int):
    """
    Returns funding opportunities ranked by match score
    for the given user's research profile.
    """

    profile = (
        db.query(ResearchProfile)
        .filter(ResearchProfile.user_id == user_id)
        .first()
    )

    if not profile:
        return []

    opportunities = (
        db.query(FundingOpportunity)
        .all()
    )

    recommendations = []
    for funding in opportunities:

        score = 0
        reasons = []
        suggestions = set()

        # Rule 1 - Research Area Match
        if (
            funding.research_area.lower()
            == profile.research_area.lower()
        ):
            score += 40
            reasons.append("Research area matches")
        else:
            suggestions.add("Update your research area to better align with this funding opportunity")

        # Rule 2 - Experience Match
        required_experience = funding.min_experience or 0

        if (
            profile.experience_years is not None
            and profile.experience_years >= required_experience
        ):
            score += 20
            reasons.append("Experience requirement satisfied")
        else:
            suggestions.add("Gain additional research experience")

        # Rule 3 - Eligibility Match
        if (
            profile.designation
            and funding.eligibility
            and profile.designation.lower() == funding.eligibility.lower()
        ):
            score += 15
            reasons.append("Eligibility criteria satisfied")
        else:
            suggestions.add("Review the eligibility requirements before applying")
            
        # Rule 4 - Bio Keyword Match
        if profile.bio and funding.description:
            profile_keywords = profile.bio.lower().split()
            funding_description = funding.description.lower()

            for keyword in profile_keywords:
                if keyword in funding_description:
                    score += 15
                    reasons.append("Research interests match funding description")
                    break
                else:
                    suggestions.add("Expand your research profile with more detailed research interests")

        # Rule 5 - Funding Status
        if funding.status and funding.status.lower() == "open":
            score += 5
            reasons.append("Funding is open")

        # Rule 6 - Deadline
        if funding.deadline and funding.deadline >= date.today():
            score += 5
            reasons.append("Application deadline is active")
        match_percentage = f"{score}%"
        if score >= 90:
            match_level = "Excellent Match"
        elif score >= 75:
            match_level = "Very Good Match"
        elif score >= 60:
            match_level = "Good Match"
        elif score >= 40:
            match_level = "Fair Match"
        else:
            match_level = "Low Match"

        recommendations.append({
            "funding": funding,
            "score": score,
            "match_percentage": match_percentage,
            "match_level": match_level,
            "reasons": reasons,
            "suggestions": sorted(list(suggestions)),
        })

    return recommendations