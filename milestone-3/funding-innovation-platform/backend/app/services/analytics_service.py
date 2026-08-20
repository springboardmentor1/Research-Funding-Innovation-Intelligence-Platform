"""
Admin analytics: aggregate counts powering the Admin Dashboard. Kept as
its own service (rather than bolted onto UserService/FundingOpportunityService)
since it reads across multiple aggregates and has no write responsibilities —
a single-purpose service per the Single Responsibility Principle.
"""
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.application import FundingApplication
from app.models.bookmark import FundingBookmark
from app.models.funding_opportunity import FundingOpportunity
from app.models.user import User

logger = logging.getLogger("app.services.analytics")


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def overview(self) -> dict:
        total_users = self.db.execute(select(func.count()).select_from(User)).scalar_one()
        active_users = self.db.execute(
            select(func.count()).select_from(User).where(User.is_active.is_(True))
        ).scalar_one()

        users_by_role_rows = self.db.execute(select(User.role, func.count()).group_by(User.role)).all()
        users_by_role = {
            role.value if hasattr(role, "value") else role: count for role, count in users_by_role_rows
        }

        total_opportunities = self.db.execute(select(func.count()).select_from(FundingOpportunity)).scalar_one()
        opportunities_by_status_rows = self.db.execute(
            select(FundingOpportunity.status, func.count()).group_by(FundingOpportunity.status)
        ).all()
        opportunities_by_status = {
            status.value if hasattr(status, "value") else status: count
            for status, count in opportunities_by_status_rows
        }

        total_applications = self.db.execute(select(func.count()).select_from(FundingApplication)).scalar_one()
        applications_by_status_rows = self.db.execute(
            select(FundingApplication.status, func.count()).group_by(FundingApplication.status)
        ).all()
        applications_by_status = {
            status.value if hasattr(status, "value") else status: count
            for status, count in applications_by_status_rows
        }

        total_bookmarks = self.db.execute(select(func.count()).select_from(FundingBookmark)).scalar_one()

        return {
            "total_users": total_users,
            "active_users": active_users,
            "users_by_role": users_by_role,
            "total_opportunities": total_opportunities,
            "opportunities_by_status": opportunities_by_status,
            "total_applications": total_applications,
            "applications_by_status": applications_by_status,
            "total_bookmarks": total_bookmarks,
        }

    def applications_trend(self, days: int = 30) -> list[dict]:
        """Daily application submission counts for the last `days` days —
        used to render a trend chart on the Admin Dashboard."""
        since = datetime.now(timezone.utc) - timedelta(days=days)
        day_expr = func.date(FundingApplication.submitted_at)
        stmt = (
            select(day_expr, func.count())
            .where(FundingApplication.submitted_at >= since)
            .group_by(day_expr)
            .order_by(day_expr)
        )
        rows = self.db.execute(stmt).all()
        return [{"date": str(day), "count": count} for day, count in rows]

    def top_research_domains(self, limit: int = 10) -> list[dict]:
        """Most common research domains across all funding opportunities —
        gives admins a quick read on where funding supply is concentrated."""
        domain_expr = func.unnest(FundingOpportunity.research_domains).label("domain")
        stmt = (
            select(domain_expr, func.count())
            .group_by(domain_expr)
            .order_by(func.count().desc())
            .limit(limit)
        )
        rows = self.db.execute(stmt).all()
        return [{"domain": domain, "count": count} for domain, count in rows]
