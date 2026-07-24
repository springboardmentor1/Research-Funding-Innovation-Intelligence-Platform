"""
Analytics: publication trends and patent landscape.

Every function here is a SQL aggregation, not a pandas operation. That is a
deliberate choice worth being able to defend.

Your EDA scripts loaded 10,000 rows into a DataFrame and grouped in Python.
That is right for exploration - you want the whole dataset in hand. It is
wrong for an API endpoint: it would pull 10,000 rows over the wire and
allocate them on every request, so a dashboard with six charts would move
60,000 rows to render a few dozen numbers.

Aggregating in the database sends the numbers only. Postgres does the
counting where the data already lives.
"""

from sqlalchemy import Integer, cast, desc, func, select
from sqlalchemy.orm import Session

from app.models import Patent, Publication


# ------------------------------------------------------------------ publications
def publications_per_year(db: Session, start: int = 2015, end: int = 2024):
    stmt = (
        select(Publication.publication_year.label("year"),
               func.count().label("count"))
        .where(Publication.publication_year.between(start, end))
        .group_by(Publication.publication_year)
        .order_by(Publication.publication_year)
    )
    return [{"year": r.year, "count": r.count} for r in db.execute(stmt)]


def top_topics(db: Session, limit: int = 15):
    stmt = (
        select(Publication.topic, func.count().label("count"))
        .where(Publication.topic.is_not(None))
        .group_by(Publication.topic)
        .order_by(desc("count"))
        .limit(limit)
    )
    return [{"topic": r.topic, "count": r.count} for r in db.execute(stmt)]


def open_access_share(db: Session, start: int = 2015, end: int = 2024):
    """Percentage of works that are open access, per year.

    AVG over a boolean cast to int gives the proportion directly - no second
    query for the denominator.
    """
    stmt = (
        select(
            Publication.publication_year.label("year"),
            func.count().label("total"),
            func.round(
                func.avg(cast(Publication.is_oa, Integer)) * 100, 1
            ).label("oa_percent"),
        )
        .where(Publication.publication_year.between(start, end))
        .where(Publication.is_oa.is_not(None))
        .group_by(Publication.publication_year)
        .order_by(Publication.publication_year)
    )
    return [
        {"year": r.year, "total": r.total, "oa_percent": float(r.oa_percent or 0)}
        for r in db.execute(stmt)
    ]


def top_countries(db: Session, limit: int = 12):
    """Countries by author affiliation.

    countries is a Postgres array, so unnest() expands one row per element
    before grouping. Doing this in Python would mean fetching every row.
    """
    country = func.unnest(Publication.countries).label("country")
    sub = select(country).where(func.array_length(Publication.countries, 1) > 0).subquery()
    stmt = (
        select(sub.c.country, func.count().label("count"))
        .group_by(sub.c.country)
        .order_by(desc("count"))
        .limit(limit)
    )
    return [{"country": r.country, "count": r.count} for r in db.execute(stmt)]


def citation_distribution(db: Session):
    """Summary statistics rather than 10,000 raw values.

    percentile_cont is an ordered-set aggregate - it needs WITHIN GROUP to
    know what to order by.
    """
    p = func.percentile_cont(0.5).within_group(Publication.cited_by_count.asc())
    p90 = func.percentile_cont(0.9).within_group(Publication.cited_by_count.asc())
    stmt = select(
        func.count().label("n"),
        func.min(Publication.cited_by_count).label("min"),
        func.max(Publication.cited_by_count).label("max"),
        func.round(func.avg(Publication.cited_by_count), 2).label("mean"),
        p.label("median"),
        p90.label("p90"),
    )
    r = db.execute(stmt).one()
    return {"n": r.n, "min": r.min, "max": r.max,
            "mean": float(r.mean or 0), "median": float(r.median or 0),
            "p90": float(r.p90 or 0)}


# ------------------------------------------------------------------ patents
def patent_volume_by_year(db: Session):
    stmt = (
        select(Patent.publication_year.label("year"),
               func.count().label("count"),
               func.round(func.avg(Patent.cited_by_count), 1).label("avg_citations"))
        .where(Patent.publication_year.is_not(None))
        .group_by(Patent.publication_year)
        .order_by(Patent.publication_year)
    )
    return [
        {"year": r.year, "count": r.count, "avg_citations": float(r.avg_citations or 0)}
        for r in db.execute(stmt)
    ]


def top_applicants(db: Session, limit: int = 15):
    applicant = func.unnest(Patent.applicants).label("applicant")
    sub = select(applicant).where(func.array_length(Patent.applicants, 1) > 0).subquery()
    stmt = (
        select(sub.c.applicant, func.count().label("count"))
        .group_by(sub.c.applicant)
        .order_by(desc("count"))
        .limit(limit)
    )
    return [{"applicant": r.applicant, "count": r.count} for r in db.execute(stmt)]


def top_cpc_groups(db: Session, limit: int = 15):
    """CPC groups, not full symbols.

    'G06N3/08' is a specific subgroup; 'G06N3' is the group. Splitting on
    '/' aggregates at a level where the counts are meaningful instead of
    scattered across hundreds of near-identical codes.
    """
    code = func.unnest(Patent.cpc_codes).label("code")
    sub = select(code).where(func.array_length(Patent.cpc_codes, 1) > 0).subquery()
    group = func.split_part(sub.c.code, "/", 1).label("cpc_group")
    stmt = (
        select(group, func.count().label("count"))
        .group_by(group)
        .order_by(desc("count"))
        .limit(limit)
    )
    return [{"cpc_group": r.cpc_group, "count": r.count} for r in db.execute(stmt)]


def jurisdictions(db: Session, limit: int = 10):
    stmt = (
        select(Patent.jurisdiction, func.count().label("count"))
        .where(Patent.jurisdiction.is_not(None))
        .group_by(Patent.jurisdiction)
        .order_by(desc("count"))
        .limit(limit)
    )
    return [{"jurisdiction": r.jurisdiction, "count": r.count} for r in db.execute(stmt)]


def jurisdiction_share_by_year(db: Session, top_n: int = 5):
    """Composition over time - which jurisdictions dominate, and when.

    Two queries: find the top N overall, then track only those by year.
    Tracking all jurisdictions would produce a long tail of noise.
    """
    top = [r["jurisdiction"] for r in jurisdictions(db, top_n)]
    stmt = (
        select(Patent.publication_year.label("year"),
               Patent.jurisdiction,
               func.count().label("count"))
        .where(Patent.jurisdiction.in_(top))
        .where(Patent.publication_year.is_not(None))
        .group_by(Patent.publication_year, Patent.jurisdiction)
        .order_by(Patent.publication_year)
    )
    rows = [{"year": r.year, "jurisdiction": r.jurisdiction, "count": r.count}
            for r in db.execute(stmt)]
    return {"jurisdictions": top, "data": rows}
