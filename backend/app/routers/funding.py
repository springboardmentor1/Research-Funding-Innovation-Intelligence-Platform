from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging

from app.auth.oauth2 import get_current_user
from app.database.database import get_db

logger = logging.getLogger(__name__)

from app.models.funding import FundingOpportunity
from app.models.research_profile import ResearchProfile
from app.models.user import User
from app.models.user_funding import UserFunding
from app.schemas.user_funding import SavedFundingResponse

from app.schemas.funding import (
    FundingCreate,
    FundingUpdate,
    FundingResponse,
    FundingRecommendationResponse,
)

from app.services.recommendation_service import calculate_match_score
from app.services.gov_funding_service import get_combined_funding_opportunities

from datetime import datetime

from app.schemas.user_funding import (
    SavedFundingResponse,
    AppliedFundingResponse
)



router = APIRouter(
    prefix="/funding",
    tags=["Funding"]
)


@router.post("/", response_model=FundingResponse)
def create_funding(
    funding: FundingCreate,
    db: Session = Depends(get_db)
):
    new_funding = FundingOpportunity(
        title=funding.title,
        agency=funding.agency,
        description=funding.description,
        research_area=funding.research_area,
        keywords=funding.keywords,
        eligibility=funding.eligibility,
        amount=funding.amount,
        deadline=funding.deadline,
        country=funding.country,
        application_url=funding.application_url
    )

    db.add(new_funding)
    db.commit()
    db.refresh(new_funding)

    return new_funding


@router.get("/")
def get_all_funding(
    search: str = None,
    use_external_api: bool = False,
    db: Session = Depends(get_db)
):
    """
    Get funding opportunities from external APIs (NSF, NIH, Grants.gov) or local database.
    Prioritizes local database for minimal loading time, with external API as optional enhancement.
    """
    # Always start with local database for immediate response
    query = db.query(FundingOpportunity)
    
    if search:
        search_term = f"%{search}%"
        logger.info(f"Searching local database for funding with term: '{search}'")
        query = query.filter(
            (FundingOpportunity.title.ilike(search_term)) |
            (FundingOpportunity.agency.ilike(search_term)) |
            (FundingOpportunity.research_area.ilike(search_term)) |
            (FundingOpportunity.description.ilike(search_term)) |
            (FundingOpportunity.eligibility.ilike(search_term)) |
            (FundingOpportunity.keywords.ilike(search_term))
        )
    
    db_results = query.all()
    logger.info(f"Found {len(db_results)} funding opportunities in local database")
    
    # If external API is requested and search term is provided, try to enhance results
    if use_external_api and search:
        logger.info(f"Attempting to enhance results with external API for term: '{search}'")
        import asyncio
        try:
            raw_results = asyncio.run(get_combined_funding_opportunities(keyword=search, limit=20))
            logger.info(f"External API raw results received")
            
            # Log any errors from external APIs
            if raw_results.get("errors"):
                logger.warning(f"External API errors: {raw_results['errors']}")
            
            # Transform external API results to match local database format
            transformed_results = []
            
            # Process NSF results
            if raw_results.get("nsf") and "response" in raw_results["nsf"] and "award" in raw_results["nsf"]["response"]:
                logger.info(f"Processing {len(raw_results['nsf']['response']['award'])} NSF results")
                for award in raw_results["nsf"]["response"]["award"]:
                    transformed_results.append({
                        "id": f"nsf-{award.get('id', '')}",
                        "title": award.get("title", ""),
                        "agency": "NSF",
                        "description": award.get("abstractText", ""),
                        "research_area": award.get("researchArea", "General"),
                        "keywords": award.get("text", ""),
                        "eligibility": award.get("awardeeAddress", ""),
                        "amount": float(award.get("fundsObligated", 0)) if award.get("fundsObligated") else None,
                        "deadline": None,
                        "country": "US",
                        "application_url": f"https://www.nsf.gov/awardsearch/showAward?AWD_NUMBER={award.get('id', '')}"
                    })
            
            # Process NIH results
            if raw_results.get("nih") and "results" in raw_results["nih"]:
                logger.info(f"Processing {len(raw_results['nih']['results'])} NIH results")
                for project in raw_results["nih"]["results"]:
                    transformed_results.append({
                        "id": f"nih-{project.get('project_id', '')}",
                        "title": project.get("project_title", ""),
                        "agency": "NIH",
                        "description": project.get("abstract_text", ""),
                        "research_area": project.get("project_terms", "General") if isinstance(project.get("project_terms"), str) else "General",
                        "keywords": project.get("project_terms", ""),
                        "eligibility": project.get("org_name", ""),
                        "amount": float(project.get("total_cost", 0)) if project.get("total_cost") else None,
                        "deadline": None,
                        "country": "US",
                        "application_url": f"https://reporter.nih.gov/project-details/{project.get('project_id', '')}"
                    })
            
            # Process Grants.gov results
            if raw_results.get("grants_gov") and "data" in raw_results["grants_gov"] and "oppHits" in raw_results["grants_gov"]["data"]:
                logger.info(f"Processing {len(raw_results['grants_gov']['data']['oppHits'])} Grants.gov results")
                for opp in raw_results["grants_gov"]["data"]["oppHits"]:
                    transformed_results.append({
                        "id": f"grants-{opp.get('oppNumber', '')}",
                        "title": opp.get("opportunityTitle", ""),
                        "agency": opp.get("agencyCode", "Grants.gov"),
                        "description": opp.get("description", ""),
                        "research_area": opp.get("fundingActivityCategory", "General"),
                        "keywords": opp.get("cfdAnumber", ""),
                        "eligibility": opp.get("eligibilityCategory", ""),
                        "amount": None,
                        "deadline": opp.get("closeDate", None),
                        "country": "US",
                        "application_url": opp.get("opportunityUrl", "")
                    })
            
            logger.info(f"Transformed {len(transformed_results)} external API results")
            
            # If external API returned results, combine with database results
            if transformed_results:
                logger.info(f"Combining {len(db_results)} database results with {len(transformed_results)} external API results")
                # Convert database results to dict format for consistency
                db_results_dict = [
                    {
                        "id": funding.id,
                        "title": funding.title,
                        "agency": funding.agency,
                        "description": funding.description,
                        "research_area": funding.research_area,
                        "keywords": funding.keywords,
                        "eligibility": funding.eligibility,
                        "amount": funding.amount,
                        "deadline": funding.deadline,
                        "country": funding.country,
                        "application_url": funding.application_url
                    }
                    for funding in db_results
                ]
                # Return combined results
                return db_results_dict + transformed_results
            else:
                logger.warning("No results from external APIs, returning database results only")
                return db_results
                
        except Exception as e:
            logger.error(f"Error calling external APIs: {str(e)}")
            # Always fall back to database results on any error
            logger.info("Returning database results due to external API error")
            return db_results
    
    # Return database results by default (fastest path)
    return db_results


@router.get(
    "/saved",
    response_model=list[SavedFundingResponse]
)
def get_saved_funding(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    saved_records = (
        db.query(UserFunding)
        .filter(
            UserFunding.user_id == current_user.id,
            UserFunding.status == "Saved"
        )
        .all()
    )

    response = []

    for record in saved_records:

        funding = (
            db.query(FundingOpportunity)
            .filter(FundingOpportunity.id == record.funding_id)
            .first()
        )

        if funding:
            response.append(
                SavedFundingResponse(
                    funding_id=funding.id,
                    title=funding.title,
                    agency=funding.agency,
                    research_area=funding.research_area,
                    status=record.status
                )
            )

    return response



@router.get(
    "/applied",
    response_model=list[AppliedFundingResponse]
)
def get_applied_funding(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    applied_records = (
        db.query(UserFunding)
        .filter(
            UserFunding.user_id == current_user.id,
            UserFunding.status == "Applied"
        )
        .all()
    )

    response = []

    for record in applied_records:

        funding = (
            db.query(FundingOpportunity)
            .filter(FundingOpportunity.id == record.funding_id)
            .first()
        )

        if funding:
            response.append(
                AppliedFundingResponse(
                    funding_id=funding.id,
                    title=funding.title,
                    agency=funding.agency,
                    research_area=funding.research_area,
                    applied_at=record.applied_at
                )
            )

    return response


@router.post("/{funding_id}/apply")
def apply_funding(
    funding_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    saved = (
        db.query(UserFunding)
        .filter(
            UserFunding.user_id == current_user.id,
            UserFunding.funding_id == funding_id
        )
        .first()
    )

    if not saved:
        raise HTTPException(
            status_code=404,
            detail="Please save the funding opportunity before applying."
        )

    if saved.status == "Applied":
        raise HTTPException(
            status_code=400,
            detail="Funding already applied."
        )

    saved.status = "Applied"
    saved.applied_at = datetime.utcnow()

    db.commit()
    db.refresh(saved)

    return {
        "message": "Funding application submitted successfully.",
        "data": saved
    }




@router.get("/{funding_id}", response_model=FundingResponse)
def get_funding_by_id(
    funding_id: int,
    db: Session = Depends(get_db)
):
    funding = (
        db.query(FundingOpportunity)
        .filter(FundingOpportunity.id == funding_id)
        .first()
    )

    if not funding:
        raise HTTPException(
            status_code=404,
            detail="Funding opportunity not found"
        )

    return funding

@router.put("/{funding_id}", response_model=FundingResponse)
def update_funding(
    funding_id: int,
    funding_data: FundingUpdate,
    db: Session = Depends(get_db)
):
    funding = (
        db.query(FundingOpportunity)
        .filter(FundingOpportunity.id == funding_id)
        .first()
    )

    if not funding:
        raise HTTPException(
            status_code=404,
            detail="Funding opportunity not found"
        )

    update_data = funding_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(funding, key, value)

    db.commit()
    db.refresh(funding)

    return funding

@router.delete("/{funding_id}")
def delete_funding(
    funding_id: int,
    db: Session = Depends(get_db)
):
    funding = (
        db.query(FundingOpportunity)
        .filter(FundingOpportunity.id == funding_id)
        .first()
    )

    if not funding:
        raise HTTPException(
            status_code=404,
            detail="Funding opportunity not found"
        )

    db.delete(funding)
    db.commit()

    return {
        "message": "Funding opportunity deleted successfully"
    }

@router.get(
    "/recommendations/{user_id}",
    response_model=list[FundingRecommendationResponse]
)
def get_recommendations(
    user_id: int,
    db: Session = Depends(get_db)
):

    profile = (
        db.query(ResearchProfile)
        .filter(ResearchProfile.user_id == user_id)
        .first()
    )

    if not profile:
        # Return empty list for users without a research profile
        return []

    funding_list = db.query(FundingOpportunity).all()

    recommendations = []

    for funding in funding_list:

        result = calculate_match_score(profile, funding)

        recommendations.append(
            FundingRecommendationResponse(
                funding_id=funding.id,
                title=funding.title,
                agency=funding.agency,
                research_area=funding.research_area,
                match_score=result["score"],
                matched_keywords=result["matched_keywords"]
            )
        )

    recommendations.sort(
        key=lambda x: x.match_score,
        reverse=True
    )

    return recommendations

@router.post("/{funding_id}/save")
def save_funding(
    funding_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    funding = (
        db.query(FundingOpportunity)
        .filter(FundingOpportunity.id == funding_id)
        .first()
    )

    if not funding:
        raise HTTPException(
            status_code=404,
            detail="Funding opportunity not found"
        )

    existing = (
        db.query(UserFunding)
        .filter(
            UserFunding.user_id == current_user.id,
            UserFunding.funding_id == funding_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Funding already saved"
        )

    saved = UserFunding(
        user_id=current_user.id,
        funding_id=funding_id,
        status="Saved"
    )

    db.add(saved)
    db.commit()
    db.refresh(saved)

    return {
        "message": "Funding saved successfully",
        "data": saved
    }






