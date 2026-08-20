"""
Technology Intelligence endpoints (Milestone 3). CRUD over the curated
Technology catalog is Administrator/Innovation Manager only; all analysis
endpoints are read-only and available to any authenticated user.
"""
import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.postgres import get_db
from app.models.technology import TechnologyMaturity
from app.models.user import User, UserRole
from app.schemas.common import PaginatedResponse
from app.schemas.technology import (
    CompetitiveMonitoringEntry,
    EmergingTechnologyEntry,
    InnovationOpportunityEntry,
    MaturityBreakdownEntry,
    TechnologyCreate,
    TechnologyResponse,
    TechnologyUpdate,
    TechnologyWithMetrics,
)
from app.services.technology_intelligence_service import TechnologyIntelligenceService

router = APIRouter(
    prefix="/technologies",
    tags=["Technology Intelligence"],
    dependencies=[Depends(get_current_user)],
)

require_manager = require_roles(UserRole.ADMINISTRATOR, UserRole.INNOVATION_MANAGER)


# ---- Analysis endpoints (registered before /{technology_id} to keep intent
# clear, though FastAPI disambiguates correctly by path-segment count either way) ----


@router.get("/analysis/emerging", response_model=list[EmergingTechnologyEntry])
def get_emerging_technologies(limit: int = Query(default=20, ge=1, le=100), db: Session = Depends(get_db)):
    """Technologies (tracked or not-yet-catalogued) with rising recent patent
    activity, ranked by growth rate."""
    service = TechnologyIntelligenceService(db)
    return service.emerging_technologies(limit=limit)


@router.get("/analysis/maturity-breakdown", response_model=list[MaturityBreakdownEntry])
def get_maturity_breakdown(db: Session = Depends(get_db)):
    """Count of catalogued technologies per maturity level."""
    service = TechnologyIntelligenceService(db)
    return service.maturity_breakdown()


@router.get("/analysis/innovation-opportunities", response_model=list[InnovationOpportunityEntry])
def get_innovation_opportunities(limit: int = Query(default=20, ge=1, le=100), db: Session = Depends(get_db)):
    """Technologies with substantial patent activity but limited funding
    opportunity coverage — a signal of underfunded innovation areas."""
    service = TechnologyIntelligenceService(db)
    return service.innovation_opportunities(limit=limit)


@router.get("/analysis/competitive-monitoring", response_model=list[CompetitiveMonitoringEntry])
def get_competitive_monitoring(
    technology_name: str = Query(..., min_length=2),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Assignees ranked by patent portfolio size for a given technology name."""
    service = TechnologyIntelligenceService(db)
    return service.competitive_monitoring(technology_name, limit=limit)


# ---- CRUD ----


@router.get("", response_model=PaginatedResponse[TechnologyResponse])
def search_technologies(
    q: str | None = Query(default=None),
    maturity_level: TechnologyMaturity | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Search the technology catalog by name/domain and maturity level."""
    service = TechnologyIntelligenceService(db)
    maturity_value = maturity_level.value if maturity_level else None
    return service.search(query=q, maturity_level=maturity_value, page=page, page_size=page_size)


@router.post("", response_model=TechnologyResponse, status_code=status.HTTP_201_CREATED)
def create_technology(
    payload: TechnologyCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
):
    """[Administrator / Innovation Manager] Add a technology to the catalog."""
    service = TechnologyIntelligenceService(db)
    return service.create(current_user, payload)


@router.get("/{technology_id}", response_model=TechnologyWithMetrics)
def get_technology(technology_id: uuid.UUID, db: Session = Depends(get_db)):
    """Retrieve a technology along with its computed adoption metrics."""
    service = TechnologyIntelligenceService(db)
    return service.get_with_metrics(technology_id)


@router.put("/{technology_id}", response_model=TechnologyResponse)
def update_technology(
    technology_id: uuid.UUID,
    payload: TechnologyUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
):
    """[Administrator / Innovation Manager] Update a technology's catalog entry."""
    service = TechnologyIntelligenceService(db)
    return service.update(current_user, technology_id, payload)


@router.delete("/{technology_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_technology(
    technology_id: uuid.UUID,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
) -> None:
    """[Administrator / Innovation Manager] Remove a technology from the catalog."""
    service = TechnologyIntelligenceService(db)
    service.delete(current_user, technology_id)
