from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session

from app.services.openalex_service import search_publications
from app.database.database import get_db
from app.auth.oauth2 import get_current_user
from app.models.user import User
from app.models.publication import Publication

router = APIRouter(
    prefix="/api/publications",
    tags=["Publications"]
)


@router.get("/search")
async def publication_search(
    query: str = Query(..., description="Search query for publications"),
    per_page: int = Query(10, description="Number of results to return (max 200)")
):
    """Search for publications using OpenAlex API"""
    return await search_publications(query=query, per_page=per_page)


@router.post("/import")
async def import_publication(
    publication_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Import a publication from OpenAlex into the user's local database.
    """
    # Check if similar publication already exists for this user
    existing_publication = (
        db.query(Publication)
        .filter(
            Publication.user_id == current_user.id,
            Publication.title == publication_data.get("title", "")
        )
        .first()
    )

    if existing_publication:
        return {
            "message": "Publication already exists in your records",
            "data": existing_publication
        }

    # Create new publication from OpenAlex data
    new_publication = Publication(
        user_id=current_user.id,
        title=publication_data.get("title", ""),
        journal=publication_data.get("primary_location", {}).get("source", {}).get("display_name", "") or 
                publication_data.get("best_location", {}).get("source", {}).get("display_name", ""),
        publication_year=publication_data.get("publication_year"),
        citation_count=publication_data.get("cited_by_count", 0),
        research_area=publication_data.get("concepts", [{}])[0].get("display_name", "") if publication_data.get("concepts") else ""
    )

    db.add(new_publication)
    db.commit()
    db.refresh(new_publication)

    return {
        "message": "Publication imported successfully",
        "data": new_publication
    }