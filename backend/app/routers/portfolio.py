from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectResponse

router = APIRouter(tags=["Innovation Portfolio & Pipelines"])

def seed_default_projects(db: Session):
    """Seed default pipeline projects if the database table is empty."""
    default_projects = [
        {
            "title": "Quantum Key Distribution Core Protocol",
            "description": "Designing high-entropy photon exchange protocols for banking security networks.",
            "team_leader": "Dr. Sarah Jenkins",
            "funding_received": 1250000.00,
            "status": "Active",
            "pipeline_stage": "RESEARCH",
            "innovation_score": 82.5
        },
        {
            "title": "Neuromorphic Vision Edge Chip",
            "description": "Hardware validation for event-driven cognitive object sorting at low power.",
            "team_leader": "David Miller",
            "funding_received": 840000.00,
            "status": "Active",
            "pipeline_stage": "PROTOTYPE",
            "innovation_score": 68.0
        },
        {
            "title": "Automated Anode Solid-State Chemistry",
            "description": "Prototyping thin-film chemical vapour deposition process layouts.",
            "team_leader": "Dr. Michael Chen",
            "funding_received": 2100000.00,
            "status": "Active",
            "pipeline_stage": "VALIDATION",
            "innovation_score": 91.0
        },
        {
            "title": "Generative Translation Transformers",
            "description": "Pre-training language models for low-resource dialect translation models.",
            "team_leader": "Archana Gurusamy",
            "funding_received": 340000.00,
            "status": "Active",
            "pipeline_stage": "IDEA",
            "innovation_score": 45.0
        }
    ]
    for proj_data in default_projects:
        proj = Project(**proj_data)
        db.add(proj)
    db.commit()

@router.get("/projects", response_model=list[ProjectResponse])
def list_portfolio_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all pipeline projects in the organization's portfolio."""
    projects = db.query(Project).all()
    if not projects:
        seed_default_projects(db)
        projects = db.query(Project).all()
    return projects

@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_pipeline_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new project entry in the innovation pipeline."""
    new_project = Project(
        title=project_in.title,
        description=project_in.description,
        team_leader=project_in.team_leader,
        funding_received=project_in.funding_received,
        status=project_in.status,
        pipeline_stage=project_in.pipeline_stage,
        innovation_score=project_in.innovation_score
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.put("/projects/{project_id}/stage", response_model=ProjectResponse)
def update_project_pipeline_stage(
    project_id: int,
    stage: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Modify the current pipeline stage (e.g. RESEARCH -> PROTOTYPE) of a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pipeline project with ID {project_id} not found."
        )
        
    valid_stages = ["IDEA", "RESEARCH", "PROTOTYPE", "VALIDATION", "COMMERCIALIZATION"]
    upper_stage = stage.upper()
    if upper_stage not in valid_stages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid pipeline stage. Must be one of: {valid_stages}"
        )
        
    project.pipeline_stage = upper_stage
    db.commit()
    db.refresh(project)
    return project
