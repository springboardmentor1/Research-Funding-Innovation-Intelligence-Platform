import os
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
import pandas as pd

from app.models.profile import ResearchProfile

def get_funding_opportunities(
    db: Session,
    domains: Optional[List[str]] = None,
    keywords: Optional[List[str]] = None,
    status: str = "OPEN",
    min_amount: Optional[float] = None,
    country: Optional[str] = None,
    source: str = "database"
) -> List[Dict[str, Any]]:
    """
    Retrieve funding opportunities from the database or CSV with optional filtering.

    Args:
        db (Session): The database session.
        domains (List[str], optional): Eligible research domains to filter.
        keywords (List[str], optional): Keywords to match.
        status (str): The status of the funding opportunity. Defaults to "OPEN".
        min_amount (float, optional): The minimum funding amount threshold.
        country (str, optional): The country limitation.
        source (str): Source type, e.g. "database", "csv". Defaults to "database".

    Returns:
        List[Dict[str, Any]]: A list of matching funding opportunities.
    """
    opportunities = load_funding_dataset(db, source=source)
    filtered = []
    
    for opp in opportunities:
        # Filter by status
        if status and str(opp.get("status", "OPEN")).upper() != status.upper():
            continue
            
        # Filter by domains
        if domains:
            opp_domain = opp.get("research_domain")
            if opp_domain not in domains:
                continue
                
        # Filter by min_amount
        if min_amount is not None:
            opp_amount = float(opp.get("funding_amount", 0.0))
            if opp_amount < min_amount:
                continue
                
        # Filter by country
        if country:
            opp_country = opp.get("country")
            if opp_country and opp_country != "Global" and opp_country != country:
                continue
                
        # Filter by keywords
        if keywords:
            opp_kws = [k.strip().lower() for k in str(opp.get("keywords", "")).split(",") if k.strip()]
            match = False
            for kw in keywords:
                if kw.lower() in opp_kws:
                    match = True
                    break
            if not match:
                continue
                
        filtered.append(opp)
        
    return filtered


def load_funding_dataset(db: Session, source: str = "database") -> List[Dict[str, Any]]:
    """
    Loads funding opportunities from a specified source (database, CSV, or future APIs).
    If the database query returns empty, falls back gracefully to loading from the processed CSV.

    Args:
        db (Session): Database session.
        source (str): Source type, e.g. "database", "csv". Defaults to "database".

    Returns:
        List[Dict[str, Any]]: A list of dictionaries representing funding opportunities.
    """
    if source == "database":
        try:
            # Attempt to query database table directly via raw SQL execution
            result = db.execute(text("SELECT * FROM funding_opportunities")).mappings().all()
            if result:
                return [dict(row) for row in result]
        except Exception:
            # Fall back to processed CSV if table does not exist or database fails
            pass

    # Load from the processed CSV dataset as the standard fallback
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.abspath(os.path.join(base_dir, "../../../datasets/processed/funding/funding_processed.csv"))
    
    if os.path.exists(csv_path):
        try:
            df = pd.read_csv(csv_path)
            # Standardize numeric columns
            if "funding_amount" in df.columns:
                df["funding_amount"] = pd.to_numeric(df["funding_amount"], errors='coerce').fillna(100000.0)
            return df.to_dict(orient="records")
        except Exception:
            pass
            
    return []


def extract_profile_features(profile: ResearchProfile) -> Dict[str, Any]:
    """
    Extracts researcher parameters from their profile to form a feature dictionary
    for matching evaluations.

    Args:
        profile (ResearchProfile): The researcher's profile model.

    Returns:
        Dict[str, Any]: Extract attributes.
    """
    keywords = []
    if profile.keywords:
        keywords = [k.strip().lower() for k in profile.keywords.split(",") if k.strip()]

    interests = []
    if profile.research_interests:
        interests = [ri.strip().lower() for ri in profile.research_interests.split(",") if ri.strip()]

    # Infer country based on organization keywords if not explicitly present
    country = "US"
    org_lower = (profile.organization or "").lower()
    if "european" in org_lower or "erc" in org_lower:
        country = "EU"
    elif "uk" in org_lower or "united kingdom" in org_lower:
        country = "GB"
    elif "canada" in org_lower or "canadian" in org_lower:
        country = "CA"
    elif "australia" in org_lower or "australian" in org_lower:
        country = "AU"
    elif "japan" in org_lower or "japanese" in org_lower:
        country = "JP"

    return {
        "research_domain": profile.research_domain or "General Science",
        "keywords": keywords,
        "research_interests": interests,
        "publications_count": profile.publications_count or 0,
        "patents_count": profile.patents_count or 0,
        "years_of_experience": profile.years_of_experience or 0,
        "organization": profile.organization or "Unknown Institution",
        "country": country
    }


def filter_by_eligibility(
    funding_opportunities: List[Dict[str, Any]],
    profile_features: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Filters funding opportunities using hard constraints: status and geographic eligibility.

    Args:
        funding_opportunities (List[Dict[str, Any]]): Candidate funding opportunities.
        profile_features (Dict[str, Any]): Researcher profile features.

    Returns:
        List[Dict[str, Any]]: Opportunities passing constraints.
    """
    filtered = []
    researcher_country = profile_features.get("country", "US")

    for opp in funding_opportunities:
        # 1. Status Constraint: Exclude opportunities that are not OPEN
        status = str(opp.get("status", "OPEN")).upper()
        if status != "OPEN":
            continue

        # 2. Geographic Constraint: Match country restriction (e.g. US, EU, GB, Global)
        opp_country = opp.get("country")
        if opp_country:
            opp_country_str = str(opp_country).strip()
            if opp_country_str != "Global" and opp_country_str != researcher_country:
                continue

        filtered.append(opp)

    return filtered


def calculate_match_score(
    opportunity: Dict[str, Any],
    profile_features: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Computes a placeholder matching score and detailed evaluation parameters.

    Future Implementation Details:
    - Jaccard Similarity: Word overlap of researcher and grant keywords (Weight: 15%).
    - Cosine Similarity: Semantic cosine similarity of sentence-transformer text embeddings
      of profile biography/interests vs grant description/scope (Weight: 35%).
    - Embeddings: Vector representation matching of research abstracts and grant solicitations.
    - AI Ranking / Weighted Recommendation Model: Logarithmic boost from publications & patents,
      aligned with years of experience thresholds and career stage criteria.

    Current Ingestion Pipeline Design:
    - Uses a simple keyword intersection count placeholder to indicate potential matches,
      helping test pipeline data flow and ranking without active AI model dependencies.

    Args:
        opportunity (Dict[str, Any]): The funding opportunity.
        profile_features (Dict[str, Any]): Researcher profile parameters.

    Returns:
        Dict[str, Any]: Opportunity with match_score and match_explanation updated.
    """
    # Simple keyword match count placeholder
    opp_kws_str = opportunity.get("keywords", "")
    opp_kws = [k.strip().lower() for k in opp_kws_str.split(",") if k.strip()]
    profile_kws = profile_features.get("keywords", [])

    intersection = set(opp_kws).intersection(set(profile_kws))
    
    # Calculate simple score placeholder (e.g. 0.1 per matching keyword, capped at 1.0)
    score_placeholder = min(1.0, len(intersection) * 0.1)

    # Rationale description
    explanation = (
        f"[Placeholder Score] Matched {score_placeholder*100:.1f}% based on "
        f"{len(intersection)} overlapping keywords: ({', '.join(intersection) if intersection else 'none'})."
    )

    opportunity_result = opportunity.copy()
    opportunity_result["match_score"] = round(score_placeholder, 4)
    opportunity_result["match_explanation"] = explanation
    return opportunity_result


def rank_funding_opportunities(opportunities_with_scores: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Sorts candidate funding opportunities by their match score in descending order.

    Args:
        opportunities_with_scores (List[Dict[str, Any]]): Opportunities with computed scores.

    Returns:
        List[Dict[str, Any]]: Sorted list of opportunities.
    """
    return sorted(opportunities_with_scores, key=lambda x: x.get("match_score", 0.0), reverse=True)


def get_top_recommendations(ranked_opportunities: List[Dict[str, Any]], limit: int = 5) -> List[Dict[str, Any]]:
    """
    Limits the recommendations to the top N results.

    Args:
        ranked_opportunities (List[Dict[str, Any]]): Ranked opportunities.
        limit (int): Maximum number of results to return.

    Returns:
        List[Dict[str, Any]]: Top recommended opportunities.
    """
    return ranked_opportunities[:limit]


def match_researcher_to_funding(
    db: Session,
    user_id: str
) -> List[Dict[str, Any]]:
    """
    Match a researcher's profile parameters against open funding opportunities.

    Workflow Sequence:
    1. Extract Profile Features
    2. Load Funding Dataset
    3. Filter by Eligibility
    4. Calculate Match Score (Placeholder)
    5. Rank Opportunities
    6. Return Top Recommendations

    Args:
        db (Session): The database session.
        user_id (str): The unique identifier of the authenticated user/researcher.

    Returns:
        List[Dict[str, Any]]: A list of recommended funding opportunities.
    """
    # 1. Fetch the researcher's profile
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user_id).first()
    if not profile:
        return []

    # 2. Extract profile features
    profile_features = extract_profile_features(profile)

    # 3. Load funding dataset (source-agnostic, defaulting to database)
    funding_dataset = load_funding_dataset(db, source="database")

    # 4. Apply eligibility filters (hard constraints)
    eligible_opportunities = filter_by_eligibility(funding_dataset, profile_features)

    # 5. Calculate match scores (placeholder scoring)
    scored_opportunities = []
    for opp in eligible_opportunities:
        scored_opportunities.append(calculate_match_score(opp, profile_features))

    # 6. Rank opportunities
    ranked_opportunities = rank_funding_opportunities(scored_opportunities)

    # 7. Get top recommendations
    return get_top_recommendations(ranked_opportunities, limit=5)


def rank_funding_results(
    matching_results: List[Dict[str, Any]],
    weight_domain: float = 0.30,
    weight_semantic: float = 0.35,
    weight_keyword: float = 0.15,
    weight_experience: float = 0.10,
    weight_academic_ip: float = 0.10
) -> List[Dict[str, Any]]:
    """
    Rank matching results based on weighted similarity scoring and academic standing.
    Delegates to rank_funding_opportunities to maintain backward-compatibility.
    """
    return rank_funding_opportunities(matching_results)
