from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.patent import (
    PatentCreate,
    PatentUpdate,
    PatentResponse,
)
from app.services import patent_service

router = APIRouter(
    prefix="/patents",
    tags=["Patents"],
)


@router.post(
    "",
    response_model=PatentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Patent",
    description="Create a new patent.",
    response_description="Patent created successfully.",
)
def create_patent(
    patent: PatentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return patent_service.create_patent(
            db=db,
            patent=patent,
            user_id=current_user.id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.get(
    "",
    response_model=List[PatentResponse],
    summary="Get All Patents",
    description="Retrieve all patents.",
    response_description="List of patents.",
)
def get_patents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return patent_service.get_patents(
        db=db,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{patent_id}",
    response_model=PatentResponse,
    summary="Get Patent by ID",
    description="Retrieve a patent by its ID.",
    response_description="Patent details.",
)
def get_patent(
    patent_id: int,
    db: Session = Depends(get_db),
):
    patent = patent_service.get_patent_by_id(
        db,
        patent_id,
    )

    if not patent:
        raise HTTPException(
            status_code=404,
            detail="Patent not found.",
        )

    return patent


@router.put(
    "/{patent_id}",
    response_model=PatentResponse,
    summary="Update Patent",
    description="Update an existing patent.",
    response_description="Updated patent.",
)
def update_patent(
    patent_id: int,
    patent: PatentUpdate,
    db: Session = Depends(get_db),
):
    try:
        updated = patent_service.update_patent(
            db,
            patent_id,
            patent,
        )

        if not updated:
            raise HTTPException(
                status_code=404,
                detail="Patent not found.",
            )

        return updated

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.delete(
    "/{patent_id}",
    summary="Delete Patent",
    description="Delete a patent.",
    response_description="Patent deleted successfully.",
)
def delete_patent(
    patent_id: int,
    db: Session = Depends(get_db),
):
    deleted = patent_service.delete_patent(
        db,
        patent_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Patent not found.",
        )

    return {
        "message": "Patent deleted successfully."
    }