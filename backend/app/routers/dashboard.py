from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database.database import get_db
from app.auth.oauth2 import get_current_user
from app.models.research_profile import ResearchProfile
from app.models.user import User
from app.models.user_funding import UserFunding
from app.models.patent import Patent
from app.models.publication import Publication

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    profile = db.query(ResearchProfile).filter(
        ResearchProfile.user_id == current_user.id
    ).first()

    # Get user's patents and publications for dynamic insights
    patents = db.query(Patent).filter(Patent.user_id == current_user.id).all()
    publications = db.query(Publication).filter(Publication.user_id == current_user.id).all()

    # Get recent activities with more detailed data
    recent_activities = []
    
    # Recent funding saves
    recent_saves = (
        db.query(UserFunding)
        .filter(
            UserFunding.user_id == current_user.id,
            UserFunding.status == "Saved"
        )
        .order_by(UserFunding.saved_at.desc())
        .limit(3)
        .all()
    )
    
    for save in recent_saves:
        time_ago = "Recently"
        if save.saved_at:
            days_ago = (datetime.now() - save.saved_at.replace(tzinfo=None)).days
            if days_ago == 0:
                time_ago = "Today"
            elif days_ago == 1:
                time_ago = "Yesterday"
            elif days_ago < 7:
                time_ago = f"{days_ago} days ago"
            else:
                time_ago = f"{days_ago} days ago"
        
        recent_activities.append({
            "title": f"Saved funding opportunity #{save.funding_id}",
            "time": time_ago
        })
    
    # Recent patent additions
    recent_patents = sorted(patents, key=lambda p: p.filing_date or datetime.min, reverse=True)[:2]
    for patent in recent_patents:
        if patent.filing_date:
            days_ago = (datetime.now().date() - patent.filing_date).days
            time_ago = f"{days_ago} days ago" if days_ago > 0 else "Today"
            recent_activities.append({
                "title": f"Added patent: {patent.title[:40]}{'...' if len(patent.title) > 40 else ''}",
                "time": time_ago
            })
    
    # Recent publication additions
    recent_publications = sorted(publications, key=lambda p: p.publication_year or 0, reverse=True)[:2]
    for pub in recent_publications:
        recent_activities.append({
            "title": f"Published: {pub.title[:40]}{'...' if len(pub.title) > 40 else ''}",
            "time": f"{pub.publication_year or 'Recent'}"
        })
    
    # Sort activities by time (most recent first) and limit to 5
    recent_activities = recent_activities[:5]
    
    # Generate dynamic insights based on actual data
    insights = []
    
    # Patent insights
    if patents:
        patent_count = len(patents)
        pending_count = sum(1 for p in patents if p.status == "Pending")
        granted_count = sum(1 for p in patents if p.status == "Granted")
        
        insights.append(f"You have {patent_count} patent(s) in your portfolio")
        if pending_count > 0:
            insights.append(f"{pending_count} patent(s) pending approval")
        if granted_count > 0:
            insights.append(f"{granted_count} patent(s) granted - great work!")
        
        # Technology area insights
        tech_areas = set(p.technology_area for p in patents if p.technology_area)
        if tech_areas:
            insights.append(f"Focus areas: {', '.join(list(tech_areas)[:2])}")
    else:
        insights.append("Consider patenting your innovations to protect your IP")
    
    # Publication insights
    if publications:
        pub_count = len(publications)
        total_citations = sum(p.citation_count or 0 for p in publications)
        avg_citations = total_citations / pub_count if pub_count > 0 else 0
        
        insights.append(f"You have {pub_count} publication(s) in your portfolio")
        if total_citations > 0:
            insights.append(f"Your work has been cited {total_citations} times")
        if avg_citations > 5:
            insights.append(f"Strong citation impact: {avg_citations:.1f} avg citations per paper")
        
        # Research area insights
        research_areas = set(p.research_area for p in publications if p.research_area)
        if research_areas:
            insights.append(f"Research domains: {', '.join(list(research_areas)[:2])}")
    else:
        insights.append("Add your publications to showcase your research impact")
    
    # Profile-based insights
    if profile:
        if profile.research_domain:
            insights.append(f"Primary research domain: {profile.research_domain}")
        insights.append("Your profile is complete - you'll get better recommendations")
    else:
        insights.append("Complete your research profile to get personalized insights")
    
    # Funding insights
    if recent_saves:
        insights.append(f"You've saved {len(recent_saves)} funding opportunities")
    else:
        insights.append("Save funding opportunities to track applications")
    
    # Add default activities if none exist
    if not recent_activities:
        recent_activities = [
            {"title": "Welcome to the platform", "time": "Just now"},
            {"title": "Start by completing your profile", "time": "Guide"},
            {"title": "Explore funding opportunities", "time": "Dashboard"},
        ]

    return {
        "user": current_user.full_name,
        "role": current_user.role.role_name if current_user.role else "Researcher",
        "organization": current_user.organization.organization_name if current_user.organization else "Organization",
        "profile": profile,
        "has_profile": profile is not None,
        "insights": insights,
        "activities": recent_activities
    }