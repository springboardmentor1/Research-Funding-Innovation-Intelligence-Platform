from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.profile import ResearchProfile
from app.models.funding import FundingOpportunity
from app.schemas.dashboard import ResearcherDashboard
from app.core.deps import get_current_user
from app.services.funding_engine import recommend_funding
from app.services.research_trends import analyze_trend

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/researcher", response_model=ResearcherDashboard)
def researcher_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Researcher Dashboard (spec section 9): funding recommendations, research trends,
    publication analytics -- all in one call.
    """
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Research profile not found")

    opportunities = db.query(FundingOpportunity).all()
    ranked = recommend_funding(current_user, profile, opportunities, top_n=5)
    funding_recs = [
        {
            "opportunity": r["opportunity"],
            "match_score": r["match_score"],
            "matched_domains": r["matched_domains"],
            "matched_keywords": r["matched_keywords"],
            "eligible": r["eligible"],
        }
        for r in ranked
    ]

    trends = []
    for domain in (profile.research_domains or [])[:3]:
        try:
            trends.append(analyze_trend(domain, limit=25))
        except Exception:
            continue

    return ResearcherDashboard(profile=profile, funding_recommendations=funding_recs, research_trends=trends)


from app.models.patent import Patent
from app.schemas.innovation_dashboard import InnovationDashboard
from app.services.innovation_scoring import compute_innovation_score
from app.services.commercialization import generate_recommendations
from app.services.patent_analytics import cluster_by_domain, trend_by_year, competitor_analysis


@router.get("/innovation", response_model=InnovationDashboard)
def innovation_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Innovation Analytics Dashboard (spec section 9): innovation score, commercialization
    guidance, and patent landscape -- all in one call.
    """
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Research profile not found")
    if not profile.research_domains:
        raise HTTPException(status_code=400, detail="Add at least one research domain to your profile first")

    all_patents = db.query(Patent).all()
    top_domain = profile.research_domains[0]
    domain_patents = [
        p for p in all_patents if top_domain.lower() in [d.lower() for d in (p.technology_domain or [])]
    ]
    opportunities = db.query(FundingOpportunity).all()

    score_result = compute_innovation_score(current_user, profile, domain_patents, opportunities)
    recommendations = generate_recommendations(score_result)

    return InnovationDashboard(
        innovation_score=score_result,
        commercialization_recommendations=recommendations,
        patent_clusters=cluster_by_domain(all_patents),
        patent_trends=trend_by_year(all_patents),
        top_competitors=competitor_analysis(all_patents),
    )


from app.models.user import UserRole
from app.core.deps import require_roles
from app.schemas.manager_dashboard import StartupDashboard, InnovationManagerDashboard, TechnologyOpportunity, FundingAnalyticsEntry
from app.services.technology_intelligence import classify_maturity


def _technology_opportunities_from_patents(all_patents: list[Patent]) -> list[dict]:
    """
    Technology opportunity scan without external API calls (used for multi-user / manager-wide
    views where calling OpenAlex per domain would be slow). Maturity here is estimated from
    patent volume alone; per-researcher pages use the full publication+patent signal instead.
    """
    clusters = cluster_by_domain(all_patents)
    results = []
    for c in clusters:
        maturity = classify_maturity(
            is_publication_emerging=False,
            patent_count=c["patent_count"],
            avg_patent_citations=c["avg_citation_count"],
        )
        results.append({
            "domain": c["technology_domain"],
            "patent_count": c["patent_count"],
            "avg_citation_count": c["avg_citation_count"],
            "maturity_stage": maturity,
        })
    return results


@router.get("/startup", response_model=StartupDashboard)
def startup_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Startup Dashboard (spec section 9): funding opportunities, technology opportunities,
    patent intelligence, commercialization insights.
    """
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Research profile not found")

    opportunities = db.query(FundingOpportunity).all()
    ranked = recommend_funding(current_user, profile, opportunities, top_n=5)
    funding_recs = [
        {"opportunity": r["opportunity"], "match_score": r["match_score"],
         "matched_domains": r["matched_domains"], "matched_keywords": r["matched_keywords"], "eligible": r["eligible"]}
        for r in ranked
    ]

    all_patents = db.query(Patent).all()
    tech_opportunities = [t for t in _technology_opportunities_from_patents(all_patents) if t["maturity_stage"] in ("Emerging", "Growing")]

    score_result = None
    commercialization = []
    if profile.research_domains:
        top_domain = profile.research_domains[0]
        domain_patents = [p for p in all_patents if top_domain.lower() in [d.lower() for d in (p.technology_domain or [])]]
        try:
            score_result = compute_innovation_score(current_user, profile, domain_patents, opportunities)
            commercialization = generate_recommendations(score_result)
        except Exception:
            pass  # innovation score is a bonus on this dashboard; funding/patent data below still returns

    return StartupDashboard(
        funding_opportunities=funding_recs,
        technology_opportunities=tech_opportunities,
        patent_intelligence=cluster_by_domain(all_patents),
        innovation_score=score_result,
        commercialization_insights=commercialization,
    )


@router.get("/innovation-manager", response_model=InnovationManagerDashboard)
def innovation_manager_dashboard(
    db: Session = Depends(get_db),
    _manager: User = Depends(require_roles(UserRole.INNOVATION_MANAGER, UserRole.ADMIN)),
):
    """
    Innovation Manager Dashboard (spec section 9): portfolio analytics, innovation pipeline
    tracking, technology trend monitoring, funding analytics.
    """
    all_patents = db.query(Patent).all()
    all_opportunities = db.query(FundingOpportunity).all()

    category_counts: dict[str, int] = {}
    for opp in all_opportunities:
        category_counts[opp.source_category] = category_counts.get(opp.source_category, 0) + 1
    funding_analytics = [
        FundingAnalyticsEntry(source_category=cat, opportunity_count=count)
        for cat, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    total_researchers = db.query(User).filter(User.role == UserRole.RESEARCHER).count()
    total_startups = db.query(User).filter(User.role == UserRole.STARTUP_FOUNDER).count()

    return InnovationManagerDashboard(
        portfolio_patent_clusters=cluster_by_domain(all_patents),
        technology_pipeline=_technology_opportunities_from_patents(all_patents),
        funding_analytics=funding_analytics,
        total_researchers_tracked=total_researchers,
        total_startups_tracked=total_startups,
    )
