"""Data-access layer for FundingApplication (application tracking)."""
import uuid
from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.application import FundingApplication


@dataclass
class ApplicationFilters:
    status: str | None = None
    opportunity_id: uuid.UUID | None = None
    applicant_id: uuid.UUID | None = None


class ApplicationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, application_id: uuid.UUID) -> FundingApplication | None:
        stmt = (
            select(FundingApplication)
            .where(FundingApplication.id == application_id)
            .options(
                selectinload(FundingApplication.opportunity),
                selectinload(FundingApplication.applicant),
            )
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_user_and_opportunity(
        self, applicant_id: uuid.UUID, opportunity_id: uuid.UUID
    ) -> FundingApplication | None:
        stmt = select(FundingApplication).where(
            FundingApplication.applicant_id == applicant_id,
            FundingApplication.opportunity_id == opportunity_id,
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def search(
        self, filters: ApplicationFilters, skip: int = 0, limit: int = 20
    ) -> tuple[list[FundingApplication], int]:
        stmt = select(FundingApplication).options(
            selectinload(FundingApplication.opportunity),
            selectinload(FundingApplication.applicant),
        )
        if filters.status:
            stmt = stmt.where(FundingApplication.status == filters.status)
        if filters.opportunity_id:
            stmt = stmt.where(FundingApplication.opportunity_id == filters.opportunity_id)
        if filters.applicant_id:
            stmt = stmt.where(FundingApplication.applicant_id == filters.applicant_id)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()

        stmt = stmt.order_by(FundingApplication.submitted_at.desc()).offset(skip).limit(limit)
        items = list(self.db.execute(stmt).scalars().all())
        return items, total

    def create(self, application: FundingApplication) -> FundingApplication:
        self.db.add(application)
        self.db.commit()
        self.db.refresh(application)
        return application

    def update(self, application: FundingApplication) -> FundingApplication:
        self.db.add(application)
        self.db.commit()
        self.db.refresh(application)
        return application

    def count_by_status(self) -> dict[str, int]:
        stmt = select(FundingApplication.status, func.count()).group_by(FundingApplication.status)
        rows = self.db.execute(stmt).all()
        return {status.value if hasattr(status, "value") else status: count for status, count in rows}
