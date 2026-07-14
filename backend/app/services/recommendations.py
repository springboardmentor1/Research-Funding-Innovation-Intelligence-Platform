import os
import csv
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.profile import ResearchProfile
from app.schemas.recommendations import GrantRecommendationResponse, GrantMatchBreakdownResponse

# Resolve paths
SERVICE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_APP_DIR = os.path.dirname(SERVICE_DIR)
BACKEND_DIR = os.path.dirname(BACKEND_APP_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
GRANTS_CSV = os.path.join(PROJECT_ROOT, "datasets", "processed", "grants", "grants_processed.csv")

def load_grants_from_csv() -> list[dict]:
    """Loads all processed grants from the CSV dataset."""
    if not os.path.exists(GRANTS_CSV):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Processed grants dataset not found at {GRANTS_CSV}. Please run the data pipeline first."
        )
    
    grants = []
    with open(GRANTS_CSV, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            grants.append(row)
    return grants

def calculate_match(profile: ResearchProfile, grant: dict) -> dict:
    """Calculates matching scores and details between a researcher profile and a grant."""
    grant_title = grant.get("title", "").lower()
    grant_desc = grant.get("description", "").lower()
    grant_text = f"{grant_title} {grant_desc}"

    # Extract user attributes
    domains = profile.research_domains if isinstance(profile.research_domains, list) else []
    keywords = profile.keywords if isinstance(profile.keywords, list) else []
    tech_areas = profile.technology_areas if isinstance(profile.technology_areas, list) else []

    # Find intersections
    matching_domains = [d for d in domains if d.lower() in grant_text]
    matching_keywords = [k for k in keywords if k.lower() in grant_text]
    matching_tech_areas = [t for t in tech_areas if t.lower() in grant_text]

    # Calculate match score (Weighted: Domains 40%, Keywords 40%, Tech Areas 20%)
    # Domain points: 20% per matched domain (max 40%)
    domain_score = min(len(matching_domains) * 20.0, 40.0)
    
    # Keyword points: 10% per matched keyword (max 40%)
    keyword_score = min(len(matching_keywords) * 10.0, 40.0)
    
    # Tech Area points: 10% per matched tech area (max 20%)
    tech_score = min(len(matching_tech_areas) * 10.0, 20.0)

    total_score = domain_score + keyword_score + tech_score

    # Fallback score if there are no exact phrase matches, check individual keyword tokens
    if total_score == 0.0:
        # Check if individual words from keywords overlap with grant text
        all_words = set()
        for kw in keywords + domains + tech_areas:
            all_words.update([w.lower() for w in kw.split() if len(w) > 3])
        
        overlapping_words = [w for w in all_words if w in grant_text]
        if overlapping_words:
            # Low semantic relevance fallback score (capped at 15%)
            total_score = min(len(overlapping_words) * 2.0, 15.0)

    # Generate explanation rationale
    score_rounded = round(total_score, 1)
    if score_rounded >= 70.0:
        rationale = (
            f"Strong Match ({score_rounded}%). Your research profiles directly align with this opportunity. "
            f"We detected strong synergy in your research domains ({', '.join(matching_domains)}) "
            f"and keywords ({', '.join(matching_keywords)})."
        )
    elif score_rounded >= 40.0:
        rationale = (
            f"Moderate Match ({score_rounded}%). There is good overlap with your research focus. "
            f"Direct matches found for: {', '.join(matching_domains + matching_keywords)}."
        )
    elif score_rounded > 0.0:
        rationale = (
            f"Low Match ({score_rounded}%). Minimal direct matching keywords were identified, but "
            f"there is a general alignment with some concepts in your profile."
        )
    else:
        rationale = "No direct overlap identified. This grant is recommended based on overall system popularity."

    return {
        "match_score": score_rounded,
        "matching_domains": matching_domains,
        "matching_keywords": matching_keywords,
        "matching_technology_areas": matching_tech_areas,
        "match_rationale": rationale
    }

def get_recommendations_for_user(db: Session, user_id: int) -> list[GrantRecommendationResponse]:
    """Retrieves all grants matched and sorted by recommendation score for a given user."""
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research profile not found. You must build your profile to receive recommendations."
        )
    
    grants = load_grants_from_csv()
    recommendations = []

    for grant in grants:
        match_details = calculate_match(profile, grant)
        
        recommendations.append(
            GrantRecommendationResponse(
                grant_id=grant["grant_id"],
                title=grant["title"],
                funder=grant["funder"],
                amount=grant["amount"],
                description=grant["description"],
                deadline=grant["deadline"],
                url=grant["url"],
                match_score=match_details["match_score"],
                matching_domains=match_details["matching_domains"],
                matching_keywords=match_details["matching_keywords"],
                matching_technology_areas=match_details["matching_technology_areas"],
                match_rationale=match_details["match_rationale"]
            )
        )
    
    # Sort recommendations by match_score descending, and secondary sorting by grant ID
    recommendations.sort(key=lambda x: (x.match_score, x.grant_id), reverse=True)
    return recommendations

def get_match_breakdown(db: Session, user_id: int, grant_id: str) -> GrantMatchBreakdownResponse:
    """Gets detailed scoring breakdown for a single grant."""
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research profile not found. Please create one to calculate matches."
        )
        
    grants = load_grants_from_csv()
    target_grant = next((g for g in grants if g["grant_id"] == grant_id), None)
    
    if not target_grant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Grant opportunity with ID {grant_id} not found."
        )
        
    match_details = calculate_match(profile, target_grant)
    return GrantMatchBreakdownResponse(
        grant_id=grant_id,
        match_score=match_details["match_score"],
        matching_domains=match_details["matching_domains"],
        matching_keywords=match_details["matching_keywords"],
        matching_technology_areas=match_details["matching_technology_areas"],
        match_rationale=match_details["match_rationale"]
    )
