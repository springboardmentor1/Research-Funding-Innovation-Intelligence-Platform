from sqlalchemy.orm import Session
from sqlalchemy import func
from models.user import User
from models.profile import ResearchProfile
from models.funding import FundingOpportunity
from services.funding_matcher import match_funding_opportunities
from services.innovation_service import get_score, calculate_score, get_recommendations, generate_recommendations
from services.trend_analyzer import research_hotspots, emerging_keywords

def get_researcher_dashboard(db: Session, user: User):
    profile = user.profile
    if not profile:
        return {"error": "Profile not found"}
        
    # Get Innovation Score (calculate if not exists)
    score_obj = get_score(db, profile.id)
    if not score_obj:
        score_obj = calculate_score(db, profile.id)
        
    # Get Funding Recommendations
    funding = match_funding_opportunities(db, profile, limit=5)
    
    # Get Research Trends (hotspots)
    trends = research_hotspots(db)
    
    # Analytics from profile
    pub_analytics = {
        "total_citations": profile.total_citations,
        "h_index": profile.h_index,
        "linked_publications_count": len(profile.linked_publications)
    }
    
    patent_insights = {
        "linked_patents_count": len(profile.linked_patents)
    }
    
    return {
        "innovation_score": score_obj.composite_score if score_obj else 0.0,
        "innovation_score_details": {
            "research_novelty": score_obj.research_novelty_score if score_obj else 0,
            "patent_strength": score_obj.patent_strength_score if score_obj else 0,
            "technology_maturity": score_obj.technology_maturity_score if score_obj else 0,
            "market_potential": score_obj.market_potential_score if score_obj else 0,
            "funding_relevance": score_obj.funding_relevance_score if score_obj else 0,
        },
        "funding_recommendations": funding,
        "research_trends": trends[:5], # top 5
        "publication_analytics": pub_analytics,
        "patent_insights": patent_insights
    }

def get_startup_dashboard(db: Session, user: User):
    profile = user.profile
    if not profile:
        return {"error": "Profile not found"}
        
    # Get Funding Opportunities
    funding = match_funding_opportunities(db, profile, limit=5)
    
    # Get Emerging Tech
    tech_opps = emerging_keywords(db, top_n=5)
    
    # Get Commercialization Insights (calculate if not exists)
    comm_obj = get_recommendations(db, profile.id)
    if not comm_obj:
        comm_obj = generate_recommendations(db, profile.id)
        
    comm_insights = {
        "productization": comm_obj.productization_suggestions if comm_obj else [],
        "licensing": comm_obj.licensing_opportunities if comm_obj else [],
        "startup_creation": comm_obj.startup_creation_recommendations if comm_obj else [],
        "partnerships": comm_obj.industry_partnerships if comm_obj else []
    }
    
    return {
        "funding_opportunities": funding,
        "technology_opportunities": tech_opps,
        "patent_intelligence": {"competitor_patents_tracked": len(profile.linked_patents)},
        "commercialization_insights": comm_insights
    }

def get_innovation_manager_dashboard(db: Session, user: User):
    # Overall platform/portfolio analytics
    total_researchers = db.query(User).filter(User.role == "Researcher").count()
    
    # Average innovation score
    from models.intelligence import InnovationScore
    avg_score_res = db.query(func.avg(InnovationScore.composite_score)).scalar()
    avg_score = round(avg_score_res, 1) if avg_score_res else 0.0
    
    # Tech trends
    trends = research_hotspots(db)
    
    # Mocking portfolio pipeline for now since we don't have a Pipeline model yet
    pipeline = [
        {"stage": "Discovery", "count": 25}, 
        {"stage": "Patent Filed", "count": 10},
        {"stage": "Commercialized", "count": 3}
    ]
    
    # Funding analytics - count of grants
    total_grants = db.query(FundingOpportunity).count()
    
    return {
        "portfolio_analytics": {
            "total_researchers": total_researchers, 
            "avg_innovation_score": avg_score
        },
        "innovation_pipeline": pipeline,
        "technology_trend_monitoring": trends[:5],
        "funding_analytics": {"total_grant_opportunities": total_grants}
    }

def get_admin_dashboard(db: Session, user: User):
    total_users = db.query(User).count()
    total_profiles = db.query(ResearchProfile).count()
    
    # Count roles
    roles = db.query(User.role, func.count(User.id)).group_by(User.role).all()
    roles_dict = {role: count for role, count in roles}
    
    return {
        "user_management_stats": {
            "total_users": total_users,
            "profiles_created": total_profiles,
            "role_distribution": roles_dict
        },
        "platform_analytics": {
            "api_requests_today": 1420, # Mocked metric for now
        },
        "system_reports": [
            {"title": "Monthly Usage", "status": "Ready"},
            {"title": "Funding Success Rate", "status": "Generating"}
        ]
    }
