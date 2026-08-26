import os
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
import pandas as pd

from app.models.profile import ResearchProfile
from app.models.funding import FundingOpportunity
from app.schemas.funding import AIRecommendation, FundingRecommendationResponse


# ─────────────────────────────────────────────────────────────
# Dataset Loader
# ─────────────────────────────────────────────────────────────

def load_funding_dataset(db: Session, source: str = "database") -> List[Dict[str, Any]]:
    """
    Load funding opportunities.
    Priority 1: PostgreSQL (5 000 seeded rows).
    Priority 2: Processed CSV fallback.
    """
    if source == "database":
        try:
            result = db.execute(text("""
                SELECT
                    id,
                    COALESCE(funding_id, CAST(id AS TEXT))      AS funding_id,
                    COALESCE(title, 'Untitled')                  AS funding_title,
                    COALESCE(title, 'Untitled')                  AS title,
                    funding_agency,
                    funding_type,
                    COALESCE(research_domain, 'General')         AS research_domain,
                    keywords,
                    eligibility,
                    COALESCE(funding_amount, 0)                  AS funding_amount,
                    COALESCE(currency, 'USD')                    AS currency,
                    deadline                                     AS application_deadline,
                    deadline,
                    duration,
                    COALESCE(country, 'Global')                  AS country,
                    description,
                    COALESCE(source_url, application_url)        AS source_url,
                    COALESCE(application_url, source_url)        AS url,
                    application_url,
                    COALESCE(status, 'OPEN')                     AS status
                FROM funding_opportunities
            """)).mappings().all()
            if result:
                return [dict(row) for row in result]
        except Exception:
            pass

    # CSV fallback
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.abspath(
        os.path.join(base_dir, "../../../datasets/processed/funding/funding_processed.csv")
    )
    if os.path.exists(csv_path):
        try:
            df = pd.read_csv(csv_path)
            if "funding_amount" in df.columns:
                df["funding_amount"] = pd.to_numeric(df["funding_amount"], errors="coerce").fillna(0.0)
            # Normalise column names so downstream code can use funding_title
            if "funding_title" not in df.columns and "title" in df.columns:
                df["funding_title"] = df["title"]
            return df.to_dict(orient="records")
        except Exception:
            pass

    return []


# ─────────────────────────────────────────────────────────────
# Profile Feature Extraction
# ─────────────────────────────────────────────────────────────

def extract_profile_features(profile: ResearchProfile) -> Dict[str, Any]:
    keywords: List[str] = []
    if profile.keywords:
        keywords = [k.strip().lower() for k in profile.keywords.split(",") if k.strip()]

    interests: List[str] = []
    if profile.research_interests:
        interests = [ri.strip().lower() for ri in profile.research_interests.split(",") if ri.strip()]

    tech_areas: List[str] = []
    if profile.technology_areas:
        tech_areas = [t.strip().lower() for t in profile.technology_areas.split(",") if t.strip()]

    # Infer country from organisation name
    country = "US"
    org_lower = (profile.organization or "").lower()
    if any(w in org_lower for w in ["european", " erc", "horizon", "eu "]):
        country = "EU"
    elif any(w in org_lower for w in ["uk ", "united kingdom", "ukri"]):
        country = "GB"
    elif any(w in org_lower for w in ["canada", "canadian", "cihr"]):
        country = "CA"
    elif any(w in org_lower for w in ["australia", "australian", "arc "]):
        country = "AU"
    elif any(w in org_lower for w in ["japan", "japanese", "jsps"]):
        country = "JP"

    return {
        "research_domain": (profile.research_domain or "").lower(),
        "research_subdomain": (profile.research_subdomain or "").lower(),
        "keywords": keywords,
        "research_interests": interests,
        "technology_areas": tech_areas,
        # Combined keyword set for broad matching
        "all_terms": set(keywords + interests + tech_areas
                         + [(profile.research_domain or "").lower()]
                         + [(profile.research_subdomain or "").lower()]),
        "publications_count": profile.publications_count or 0,
        "patents_count": profile.patents_count or 0,
        "years_of_experience": profile.years_of_experience or 0,
        "organization": profile.organization or "Unknown Institution",
        "country": country,
    }


# ─────────────────────────────────────────────────────────────
# Eligibility Filter  (relaxed – include OPEN + show all for
#  researchers without strict country constraints)
# ─────────────────────────────────────────────────────────────

def filter_by_eligibility(
    funding_opportunities: List[Dict[str, Any]],
    profile_features: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """
    Hard constraints:
      - Status must be OPEN  (ARCHIVED / CLOSED excluded)
      - Country must match researcher or be 'Global'  (lenient: if no country set, pass)
    """
    researcher_country = profile_features.get("country", "US")
    filtered = []

    for opp in funding_opportunities:
        opp_status = str(opp.get("status", "OPEN")).strip().upper()
        if opp_status not in ("OPEN",):
            continue

        opp_country = str(opp.get("country") or "Global").strip()
        if opp_country and opp_country not in ("Global", "", researcher_country):
            continue

        filtered.append(opp)

    return filtered


# ─────────────────────────────────────────────────────────────
# Match Scoring  (multi-signal, 0-1 range)
# ─────────────────────────────────────────────────────────────

def calculate_match_score(
    opportunity: Dict[str, Any],
    profile_features: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Compute a composite match score using:
      - Domain match (40 pts)        exact research_domain match
      - Keyword overlap  (40 pts)    Jaccard similarity of term sets
      - Experience bonus (20 pts)    normalised years of experience

    Returns opportunity dict with match_score (0-1) and match_explanation added.
    """
    profile_domain    = profile_features.get("research_domain", "").lower()
    profile_all_terms = profile_features.get("all_terms", set())
    years_exp         = profile_features.get("years_of_experience", 0)

    # ── Signal 1: domain match ──
    opp_domain = str(opp.get("research_domain") or "").lower() if (opp := opportunity) else ""
    domain_score = 1.0 if (profile_domain and profile_domain == opp_domain) else 0.0

    # ── Signal 2: keyword / term Jaccard ──
    opp_kws_raw = str(opportunity.get("keywords") or "")
    opp_terms   = {k.strip().lower() for k in opp_kws_raw.replace(";", ",").split(",") if k.strip()}
    # also tokenise title words
    title_words = {w.lower() for w in str(opportunity.get("funding_title") or opportunity.get("title") or "").split()}
    opp_terms   = opp_terms | title_words

    if profile_all_terms and opp_terms:
        intersection = profile_all_terms & opp_terms
        union        = profile_all_terms | opp_terms
        jaccard      = len(intersection) / len(union) if union else 0.0
    else:
        intersection = set()
        jaccard      = 0.0

    # ── Signal 3: experience ──
    exp_score = min(1.0, years_exp / 20.0)   # cap at 20 yrs → 1.0

    # ── Composite ──
    composite = (0.40 * domain_score) + (0.40 * jaccard) + (0.20 * exp_score)
    composite = round(min(1.0, composite), 4)

    matched_kws = ", ".join(list(intersection)[:5]) if intersection else "none"
    explanation = (
        f"Domain: {'✓ Aligned' if domain_score else '✗ Different'} | "
        f"Keyword overlap: {matched_kws} | "
        f"Experience bonus: {int(exp_score * 100)}%"
    )

    opp_result = opportunity.copy()
    opp_result["match_score"]       = composite
    opp_result["match_explanation"] = explanation
    return opp_result


# ─────────────────────────────────────────────────────────────
# Ranking & Limiting
# ─────────────────────────────────────────────────────────────

def rank_funding_opportunities(opps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return sorted(opps, key=lambda x: x.get("match_score", 0.0), reverse=True)


def rank_funding_results(matching_results: List[Dict[str, Any]], **_) -> List[Dict[str, Any]]:
    """Backward-compat alias."""
    return rank_funding_opportunities(matching_results)


def get_top_recommendations(ranked: List[Dict[str, Any]], limit: int = 5) -> List[Dict[str, Any]]:
    return ranked[:limit]


# ─────────────────────────────────────────────────────────────
# Simple Query Endpoint (for /funding/list style routes)
# ─────────────────────────────────────────────────────────────

def get_funding_opportunities(
    db: Session,
    domains: Optional[List[str]] = None,
    keywords: Optional[List[str]] = None,
    status: str = "OPEN",
    min_amount: Optional[float] = None,
    country: Optional[str] = None,
    source: str = "database",
) -> List[Dict[str, Any]]:
    opportunities = load_funding_dataset(db, source=source)
    filtered = []

    for opp in opportunities:
        if status and str(opp.get("status", "OPEN")).upper() != status.upper():
            continue
        if domains:
            if opp.get("research_domain") not in domains:
                continue
        if min_amount is not None:
            if float(opp.get("funding_amount") or 0) < min_amount:
                continue
        if country:
            opp_c = opp.get("country")
            if opp_c and opp_c != "Global" and opp_c != country:
                continue
        if keywords:
            opp_kws = [k.strip().lower() for k in str(opp.get("keywords") or "").split(",") if k.strip()]
            if not any(kw.lower() in opp_kws for kw in keywords):
                continue
        filtered.append(opp)

    return filtered


# ─────────────────────────────────────────────────────────────
# Internal Pipeline: match_researcher_to_funding
# ─────────────────────────────────────────────────────────────

def match_researcher_to_funding(db: Session, user_id: str) -> List[Dict[str, Any]]:
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user_id).first()
    if not profile:
        return []
    features  = extract_profile_features(profile)
    dataset   = load_funding_dataset(db)
    eligible  = filter_by_eligibility(dataset, features)
    scored    = [calculate_match_score(o, features) for o in eligible]
    ranked    = rank_funding_opportunities(scored)
    return get_top_recommendations(ranked, limit=5)


# ─────────────────────────────────────────────────────────────
# Main Public Endpoint
# ─────────────────────────────────────────────────────────────

def get_personalized_recommendations(
    db: Session,
    user_id: str,
    country: Optional[str] = None,
    funding_type: Optional[str] = None,
    minimum_match_score: Optional[float] = None,
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """
    Full pipeline:
      Profile → load dataset → eligibility filter → score → optional filters → rank → format
    """
    # 1. Profile
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user_id).first()
    if not profile:
        raise ValueError(f"Research profile not found for user {user_id}")

    # 2. Features
    features = extract_profile_features(profile)

    # 3. Dataset (DB first)
    dataset = load_funding_dataset(db, source="database")

    # 4. Eligibility
    eligible = filter_by_eligibility(dataset, features)

    # 5. Score
    scored = [calculate_match_score(o, features) for o in eligible]

    # 6. Optional filters
    filtered: List[Dict[str, Any]] = []
    threshold = None
    if minimum_match_score is not None:
        threshold = minimum_match_score / 100.0 if minimum_match_score > 1.0 else minimum_match_score

    for opp in scored:
        if country:
            if str(opp.get("country") or "").strip().lower() != country.strip().lower():
                continue
        if funding_type:
            if str(opp.get("funding_type") or "").strip().lower() != funding_type.strip().lower():
                continue
        if threshold is not None and opp.get("match_score", 0.0) < threshold:
            continue
        filtered.append(opp)

    # 7. Rank
    ranked = rank_funding_opportunities(filtered)

    # 8. Generate AI Recommendations (Mocking AI step as per architecture)
    ai_recommendations = []
    for opp in ranked:
        opp_domain = opp.get("research_domain") or "Unknown"
        prof_domain = features.get("research_domain") or ""
        domain_match = "Aligned" if opp_domain.lower() == prof_domain else "Different"

        intersection = features.get("all_terms", set()) & {
            k.strip().lower()
            for k in str(opp.get("keywords") or "").split(",")
            if k.strip()
        }
        keyword_matches = ", ".join(list(intersection)[:5]) or "None"

        explanation = (
            f"Matched because: "
            f"• Research Domain: {opp_domain} ({domain_match}) "
            f"• Keyword Match: {keyword_matches} "
            f"• Eligibility: {opp.get('country', 'Global')} "
            f"• Funding Type: {opp.get('funding_type') or 'Grant'}"
        )

        funding_id = str(opp.get("funding_id") or opp.get("id", ""))
        ai_recommendations.append(
            AIRecommendation(
                funding_id=funding_id,
                match_score=round(opp.get("match_score", 0.0) * 100, 1),
                recommendation_reason=explanation
            )
        )

    # 9. Format for frontend (combine DB + AI)
    results = []
    for ai_result in ai_recommendations:
        if len(results) >= limit:
            break
            
        funding = db.query(FundingOpportunity).filter(
            FundingOpportunity.funding_id == ai_result.funding_id
        ).first()
        
        # Only recommend funding opportunities provided in the database and verified
        if not funding or not funding.verified:
            continue
            
        results.append({
            "funding_id": funding.funding_id,
            "title": funding.title or "Untitled",
            "funding_agency": funding.funding_agency or "Unknown Sponsor",
            "research_domain": funding.research_domain or "Unknown",
            "funding_amount": funding.funding_amount or 0.0,
            "currency": funding.currency or "USD",
            "funding_type": funding.funding_type or "Grant",
            "country": funding.country or "Global",
            "application_deadline": str(funding.deadline) if funding.deadline else None,
            "deadline": str(funding.deadline) if funding.deadline else None,
            "duration": funding.duration,
            "eligibility": funding.eligibility,
            "match_score": ai_result.match_score,
            "recommendation_reason": ai_result.recommendation_reason,
            "source_url": funding.source_url,
            "url": funding.source_url, # Alias for backwards compatibility
            "verified": funding.verified
        })

    return results
