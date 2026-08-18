from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.auth.oauth2 import get_current_user
from app.models.user import User
from app.models.patent import Patent
from app.services.innovation_service import calculate_innovation_score

router = APIRouter(
    prefix="/patent-analytics",
    tags=["Patent Analytics"]
)


@router.get("/landscape")
def patent_landscape(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_patents = (
        db.query(Patent)
        .filter(Patent.user_id == current_user.id)
        .count()
    )

    technology_data = (
        db.query(
            Patent.technology_area,
            func.count(Patent.id)
        )
        .filter(Patent.user_id == current_user.id)
        .group_by(Patent.technology_area)
        .all()
    )

    technology_distribution = {
        tech: count for tech, count in technology_data
    }

    country_data = (
        db.query(
            Patent.country,
            func.count(Patent.id)
        )
        .filter(Patent.user_id == current_user.id)
        .group_by(Patent.country)
        .all()
    )

    country_distribution = {
        country: count for country, count in country_data
    }

    status_data = (
        db.query(
            Patent.status,
            func.count(Patent.id)
        )
        .filter(Patent.user_id == current_user.id)
        .group_by(Patent.status)
        .all()
    )

    status_distribution = {
        status: count for status, count in status_data
    }

    return {
        "total_patents": total_patents,
        "technology_distribution": technology_distribution,
        "country_distribution": country_distribution,
        "status_distribution": status_distribution
    }


@router.get("/technology-intelligence")
def technology_intelligence(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    technology_data = (
        db.query(
            Patent.technology_area,
            func.count(Patent.id).label("patent_count")
        )
        .filter(Patent.user_id == current_user.id)
        .group_by(Patent.technology_area)
        .order_by(func.count(Patent.id).desc())
        .all()
    )

    intelligence = []

    for technology, count in technology_data:

        if count >= 10:
            trend = "High Growth"
        elif count >= 5:
            trend = "Growing"
        elif count >= 2:
            trend = "Emerging"
        else:
            trend = "Early Stage"

        intelligence.append({
            "technology": technology,
            "patent_count": count,
            "trend": trend,
            "insight": f"Your {technology} patents show {trend.lower()} potential with {count} patent(s)"
        })

    return intelligence


@router.get("/innovation-score/{patent_id}")
def innovation_score(
    patent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patent = (
        db.query(Patent)
        .filter(
            Patent.id == patent_id,
            Patent.user_id == current_user.id
        )
        .first()
    )

    if not patent:
        raise HTTPException(
            status_code=404,
            detail="Patent not found"
        )

    score = calculate_innovation_score(patent)

    return {
        "patent_id": patent.id,
        "title": patent.title,
        "innovation_score": score
    }


@router.get("/commercialization/{patent_id}")
def commercialization_recommendation(
    patent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patent = (
        db.query(Patent)
        .filter(
            Patent.id == patent_id,
            Patent.user_id == current_user.id
        )
        .first()
    )

    if not patent:
        raise HTTPException(
            status_code=404,
            detail="Patent not found"
        )

    score = calculate_innovation_score(patent)

    if score >= 85:
        recommendation = "Commercialize Immediately"
    elif score >= 70:
        recommendation = "Seek Industry Partnership"
    elif score >= 50:
        recommendation = "Further Research Needed"
    else:
        recommendation = "Low Commercial Potential"

    return {
        "patent_id": patent.id,
        "title": patent.title,
        "innovation_score": score,
        "recommendation": recommendation
    }


@router.get("/dashboard")
def innovation_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    patents = (
        db.query(Patent)
        .filter(Patent.user_id == current_user.id)
        .all()
    )

    total_patents = len(patents)

    if total_patents == 0:
        return {
            "total_patents": 0,
            "average_innovation_score": 0,
            "commercialization_ready": 0,
            "top_technology": None,
            "technology_distribution": {},
            "country_distribution": {},
            "status_distribution": {}
        }

    total_score = 0
    commercialization_ready = 0

    for patent in patents:

        score = calculate_innovation_score(patent)

        total_score += score

        if score >= 85:
            commercialization_ready += 1


    average_score = round(total_score / total_patents, 2)

    # Technology Distribution
    technology_data = (
        db.query(
            Patent.technology_area,
            func.count(Patent.id)
        )
        .filter(Patent.user_id == current_user.id)
        .group_by(Patent.technology_area)
        .order_by(func.count(Patent.id).desc())
        .all()
    )

    technology_distribution = {
        technology: count
        for technology, count in technology_data
    }

    top_technology = (
        technology_data[0][0]
        if technology_data
        else None
    )

    # Country Distribution
    country_data = (
        db.query(
            Patent.country,
            func.count(Patent.id)
        )
        .filter(Patent.user_id == current_user.id)
        .group_by(Patent.country)
        .all()
    )

    country_distribution = {
        country: count
        for country, count in country_data
    }

    # Status Distribution
    status_data = (
        db.query(
            Patent.status,
            func.count(Patent.id)
        )
        .filter(Patent.user_id == current_user.id)
        .group_by(Patent.status)
        .all()
    )

    status_distribution = {
        status: count
        for status, count in status_data
    }

    return {
        "total_patents": total_patents,
        "average_innovation_score": average_score,
        "commercialization_ready": commercialization_ready,
        "top_technology": top_technology,
        "technology_distribution": technology_distribution,
        "country_distribution": country_distribution,
        "status_distribution": status_distribution
    }