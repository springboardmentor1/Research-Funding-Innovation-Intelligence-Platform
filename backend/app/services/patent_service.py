from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, or_
from datetime import date
from math import ceil
from sqlalchemy import func, extract, case
from app.models.patent import Patent
from app.schemas.patent import PatentCreate, PatentUpdate


def create_patent(
    db: Session,
    patent: PatentCreate,
    user_id: int,
):
    """
    Create a new patent.
    """

    existing_patent = (
        db.query(Patent)
        .filter(Patent.patent_number == patent.patent_number)
        .first()
    )

    if existing_patent:
        raise ValueError("Patent with this patent number already exists.")

    db_patent = Patent(
        **patent.model_dump(),
        user_id=user_id,
    )

    db.add(db_patent)
    db.commit()
    db.refresh(db_patent)

    return db_patent


def get_patents(
    db: Session,
    search: str = None,
    inventor: str = None,
    assignee: str = None,
    technology_area: str = None,
    status: str = None,
    country: str = None,
    filing_date_from=None,
    filing_date_to=None,
    sort_by: str = "filing_date",
    order: str = "desc",
    page: int = 1,
    page_size: int = 10,
):
    query = db.query(Patent)

    # Keyword Search
    if search:
        query = query.filter(
            or_(
                Patent.title.ilike(f"%{search}%"),
                Patent.patent_number.ilike(f"%{search}%"),
            )
        )

    # Filters
    if inventor:
        query = query.filter(
            Patent.inventors.ilike(f"%{inventor}%")
        )

    if assignee:
        query = query.filter(
            Patent.assignee.ilike(f"%{assignee}%")
        )

    if technology_area:
        query = query.filter(
            Patent.technology_area.ilike(f"%{technology_area}%")
        )

    if status:
        query = query.filter(
            Patent.status.ilike(f"%{status}%")
        )

    if country:
        query = query.filter(
            Patent.country.ilike(f"%{country}%")
        )

    if filing_date_from:
        query = query.filter(
            Patent.filing_date >= filing_date_from
        )

    if filing_date_to:
        query = query.filter(
            Patent.filing_date <= filing_date_to
        )

    # Sorting
    sort_columns = {
        "title": Patent.title,
        "filing_date": Patent.filing_date,
        "publication_date": Patent.publication_date,
        "status": Patent.status,
    }

    sort_column = sort_columns.get(sort_by, Patent.filing_date)

    if order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    total = query.count()

    patents = (
        query.offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": patents,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": ceil(total / page_size) if total else 1,
    }


def get_patent_by_id(
    db: Session,
    patent_id: int,
):
    """
    Retrieve a patent by ID.
    """

    return (
        db.query(Patent)
        .filter(Patent.id == patent_id)
        .first()
    )


def update_patent(
    db: Session,
    patent_id: int,
    patent_update: PatentUpdate,
):
    """
    Update an existing patent.
    """

    db_patent = get_patent_by_id(db, patent_id)

    if not db_patent:
        return None

    update_data = patent_update.model_dump(exclude_unset=True)

    if (
        "patent_number" in update_data
        and update_data["patent_number"] != db_patent.patent_number
    ):
        duplicate = (
            db.query(Patent)
            .filter(Patent.patent_number == update_data["patent_number"])
            .first()
        )

        if duplicate:
            raise ValueError(
                "Patent with this patent number already exists."
            )

    for field, value in update_data.items():
        setattr(db_patent, field, value)

    db.commit()
    db.refresh(db_patent)

    return db_patent


def delete_patent(
    db: Session,
    patent_id: int,
):
    """
    Delete a patent.
    """

    db_patent = get_patent_by_id(db, patent_id)

    if not db_patent:
        return None

    db.delete(db_patent)
    db.commit()

    return db_patent

def get_patent_statistics(db: Session):
    total = db.query(Patent).count()

    granted = db.query(Patent).filter(
        Patent.status.ilike("Granted")
    ).count()

    published = db.query(Patent).filter(
        Patent.status.ilike("Published")
    ).count()

    filed = db.query(Patent).filter(
        Patent.status.ilike("Filed")
    ).count()

    expired = db.query(Patent).filter(
        Patent.status.ilike("Expired")
    ).count()

    return {
        "total_patents": total,
        "granted_patents": granted,
        "published_patents": published,
        "filed_patents": filed,
        "expired_patents": expired,
    }

def get_patents_by_technology(db: Session):
    results = (
        db.query(
            Patent.technology_area,
            func.count(Patent.id).label("count"),
        )
        .group_by(Patent.technology_area)
        .order_by(func.count(Patent.id).desc())
        .all()
    )

    return [
        {
            "technology_area": technology_area,
            "count": count,
        }
        for technology_area, count in results
    ]

def get_patents_by_status(db: Session):
    results = (
        db.query(
            Patent.status,
            func.count(Patent.id).label("count"),
        )
        .group_by(Patent.status)
        .order_by(func.count(Patent.id).desc())
        .all()
    )

    return [
        {
            "status": status,
            "count": count,
        }
        for status, count in results
    ]

def get_patents_by_country(db: Session):
    results = (
        db.query(
            Patent.country,
            func.count(Patent.id).label("count"),
        )
        .group_by(Patent.country)
        .order_by(func.count(Patent.id).desc())
        .all()
    )

    return [
        {
            "country": country,
            "count": count,
        }
        for country, count in results
    ]

def get_patent_filing_trend(db: Session):
    results = (
        db.query(
            extract("year", Patent.filing_date).label("year"),
            func.count(Patent.id).label("count"),
        )
        .group_by(extract("year", Patent.filing_date))
        .order_by(extract("year", Patent.filing_date))
        .all()
    )

    return [
        {
            "year": int(year),
            "count": count,
        }
        for year, count in results
    ]

def get_top_inventors(db: Session, limit: int = 10):
    results = (
        db.query(
            Patent.inventors,
            func.count(Patent.id).label("count"),
        )
        .group_by(Patent.inventors)
        .order_by(func.count(Patent.id).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "inventor": inventor,
            "count": count,
        }
        for inventor, count in results
    ]

def get_top_assignees(db: Session, limit: int = 10):
    results = (
        db.query(
            Patent.assignee,
            func.count(Patent.id).label("count"),
        )
        .group_by(Patent.assignee)
        .order_by(func.count(Patent.id).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "assignee": assignee,
            "count": count,
        }
        for assignee, count in results
    ]

def get_recent_patents(db: Session, limit: int = 5):
    return (
        db.query(Patent)
        .order_by(Patent.filing_date.desc())
        .limit(limit)
        .all()
    )

def get_emerging_technologies(db: Session):
    current_year = date.today().year

    technologies = (
        db.query(
            Patent.technology_area,
            func.count(Patent.id).label("patent_count"),
            func.sum(
                case(
                    (Patent.status == "Granted", 1),
                    else_=0,
                )
            ).label("granted_count"),
            func.sum(
                case(
                    (
                        func.extract("year", Patent.filing_date)
                        >= current_year - 2,
                        1,
                    ),
                    else_=0,
                )
            ).label("recent_count"),
        )
        .group_by(Patent.technology_area)
        .all()
    )

    if not technologies:
        return []

    max_patents = max(t.patent_count for t in technologies)

    results = []

    for tech in technologies:

        volume_score = (
            tech.patent_count / max_patents
        ) * 40

        granted_ratio = (
            tech.granted_count / tech.patent_count
            if tech.patent_count
            else 0
        )

        granted_score = granted_ratio * 20

        recent_ratio = (
            tech.recent_count / tech.patent_count
            if tech.patent_count
            else 0
        )

        recent_score = recent_ratio * 30

        publication_score = 10

        growth_score = round(
            volume_score
            + granted_score
            + recent_score
            + publication_score,
            2,
        )

        if growth_score >= 80:
            trend = "Emerging"
            recommendation = "High Research Priority"

        elif growth_score >= 60:
            trend = "Growing"
            recommendation = "Monitor Closely"

        elif growth_score >= 40:
            trend = "Stable"
            recommendation = "Maintain Investment"

        else:
            trend = "Declining"
            recommendation = "Low Priority"

        results.append(
            {
                "technology_area": tech.technology_area,
                "patent_count": tech.patent_count,
                "growth_score": growth_score,
                "trend": trend,
                "recommendation": recommendation,
            }
        )
    return results    

def calculate_innovation_score(
    db: Session,
    patent_id: int,
):
    patent = (
        db.query(Patent)
        .filter(Patent.id == patent_id)
        .first()
    )

    if not patent:
        return None

    score = 0
    reasons = []

    current_year = date.today().year

    # -----------------------------
    # Patent Status (30)
    # -----------------------------
    status_scores = {
        "Granted": 30,
        "Published": 20,
        "Filed": 15,
        "Expired": 5,
    }

    status_score = status_scores.get(patent.status, 0)
    score += status_score

    if status_score:
        reasons.append(f"Patent is {patent.status.lower()}")

    # -----------------------------
    # Recent Filing (20)
    # -----------------------------
    age = current_year - patent.filing_date.year

    if age <= 1:
        score += 20
        reasons.append("Recently filed")

    elif age <= 2:
        score += 15
        reasons.append("Filed within last 2 years")

    elif age <= 3:
        score += 10

    else:
        score += 5

    # -----------------------------
    # Technology Popularity (25)
    # -----------------------------
    tech_count = (
        db.query(func.count(Patent.id))
        .filter(
            Patent.technology_area == patent.technology_area
        )
        .scalar()
    )

    max_count = (
        db.query(func.count(Patent.id))
        .group_by(Patent.technology_area)
        .order_by(func.count(Patent.id).desc())
        .first()
    )

    max_patents = max_count[0] if max_count else 1

    popularity_score = (
        tech_count / max_patents
    ) * 25

    score += popularity_score

    if popularity_score >= 20:
        reasons.append("Popular technology area")

    # -----------------------------
    # International Patent (15)
    # -----------------------------
    international = {
        "USA",
        "Germany",
        "Japan",
        "United Kingdom",
        "France",
    }

    if patent.country in international:
        score += 15
        reasons.append("International patent")

    else:
        score += 8

    # -----------------------------
    # Patent Age Bonus (10)
    # -----------------------------
    if age <= 2:
        score += 10

    elif age <= 5:
        score += 5

    else:
        score += 2

    score = round(min(score, 100), 2)

    if score >= 85:
        level = "Excellent"

    elif score >= 70:
        level = "High"

    elif score >= 50:
        level = "Medium"

    else:
        level = "Low"

    return {
        "patent_id": patent.id,
        "title": patent.title,
        "innovation_score": score,
        "innovation_level": level,
        "reasons": reasons,
    }

    results.sort(
        key=lambda x: x["growth_score"],
        reverse=True,
    )

    return results

def get_all_innovation_scores(db: Session):
    patents = db.query(Patent).all()

    results = []

    for patent in patents:
        score = calculate_innovation_score(
            db=db,
            patent_id=patent.id,
        )

        if score:
            results.append(score)

    results.sort(
        key=lambda x: x["innovation_score"],
        reverse=True,
    )

    return results

def calculate_commercialization_score(
    db: Session,
    patent_id: int,
):
    patent = (
        db.query(Patent)
        .filter(Patent.id == patent_id)
        .first()
    )

    if not patent:
        return None

    innovation = calculate_innovation_score(
        db=db,
        patent_id=patent_id,
    )

    score = 0
    reasons = []

    # --------------------------------
    # 1. Innovation Score (50)
    # --------------------------------
    innovation_points = (
        innovation["innovation_score"] / 100
    ) * 50

    score += innovation_points

    if innovation["innovation_score"] >= 85:
        reasons.append("High innovation score")

    # --------------------------------
    # 2. Patent Status (20)
    # --------------------------------
    if patent.status == "Granted":
        score += 20
        reasons.append("Granted patent")

    elif patent.status == "Published":
        score += 15

    elif patent.status == "Filed":
        score += 10

    else:
        score += 5

    # --------------------------------
    # 3. Technology Demand (15)
    # --------------------------------
    tech_count = (
        db.query(func.count(Patent.id))
        .filter(
            Patent.technology_area == patent.technology_area
        )
        .scalar()
    )

    max_count = (
        db.query(func.count(Patent.id))
        .group_by(Patent.technology_area)
        .order_by(func.count(Patent.id).desc())
        .first()
    )

    max_patents = max_count[0] if max_count else 1

    tech_score = (
        tech_count / max_patents
    ) * 15

    score += tech_score

    if tech_score >= 12:
        reasons.append("High technology demand")

    # --------------------------------
    # 4. Patent Recency (10)
    # --------------------------------
    age = date.today().year - patent.filing_date.year

    if age <= 2:
        score += 10
        reasons.append("Recently filed")

    elif age <= 5:
        score += 5

    else:
        score += 2

    # --------------------------------
    # 5. International Filing (5)
    # --------------------------------
    international = {
        "USA",
        "Germany",
        "Japan",
        "United Kingdom",
        "France",
    }

    if patent.country in international:
        score += 5
        reasons.append("International market potential")

    score = round(min(score, 100), 2)

    if score >= 85:
        level = "High Commercial Potential"
        action = "Seek Industry Partnership"

    elif score >= 70:
        level = "Good Commercial Potential"
        action = "Explore Licensing Opportunities"

    elif score >= 50:
        level = "Moderate Commercial Potential"
        action = "Continue Research & Validation"

    else:
        level = "Low Commercial Potential"
        action = "Needs Further Development"

    return {
        "patent_id": patent.id,
        "title": patent.title,
        "commercialization_score": score,
        "commercialization_level": level,
        "recommended_action": action,
        "reasons": reasons,
    }

def get_all_commercialization_scores(db: Session):
    """
    Returns commercialization scores for all patents,
    ranked from highest to lowest.
    """
    patents = db.query(Patent).all()

    results = []

    for patent in patents:
        commercialization = calculate_commercialization_score(
            db=db,
            patent_id=patent.id,
        )

        if commercialization:
            results.append(commercialization)

    results.sort(
        key=lambda x: x["commercialization_score"],
        reverse=True,
    )

    return results