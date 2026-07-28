from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.auth.oauth2 import get_current_user
from app.models.user import User
from app.models.patent import Patent

router = APIRouter(
    prefix="/patent-analytics",
    tags=["Patent Analytics"]
)


@router.get("/landscape")
def patent_landscape(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Total patents
    total_patents = (
        db.query(Patent)
        .filter(Patent.user_id == current_user.id)
        .count()
    )

    # Technology distribution
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

    # Country distribution
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

    # Status distribution
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