import logging
import numpy as np
from typing import List, Optional
from sqlalchemy.orm import Session
from models.funding import FundingOpportunity
from models.profile import ResearchProfile
from schemas.funding import FundingMatchResponse

logger = logging.getLogger(__name__)

_EMBEDDING_MODEL = None


def get_embedding_model():
    """Lazily load and cache the sentence-transformers embedding model."""
    global _EMBEDDING_MODEL
    if _EMBEDDING_MODEL is None:
        logger.info(
            "Loading sentence-transformers model 'all-MiniLM-L6-v2' (singleton)..."
        )
        try:
            from sentence_transformers import SentenceTransformer

            _EMBEDDING_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("Successfully loaded 'all-MiniLM-L6-v2'.")
        except ImportError:
            logger.error(
                "sentence-transformers is not installed. Please install via requirements.txt."
            )
            raise
    return _EMBEDDING_MODEL


def get_profile_representation(profile: Optional[ResearchProfile]) -> str:
    """Concatenate research domains, keywords, and bio from researcher profile."""
    if not profile:
        return ""
    domains = (
        profile.research_domains if isinstance(profile.research_domains, list) else []
    )
    keywords = profile.keywords if isinstance(profile.keywords, list) else []
    bio = profile.bio or ""
    parts = [" ".join(domains), " ".join(keywords), bio]
    return " ".join([p.strip() for p in parts if p.strip()]).strip()


def get_opportunity_representation(opp: FundingOpportunity) -> str:
    """Concatenate domain tags, title, and description from funding opportunity."""
    tags = opp.domain_tags if isinstance(opp.domain_tags, list) else []
    parts = [" ".join(tags), opp.title or "", opp.description or ""]
    return " ".join([p.strip() for p in parts if p.strip()]).strip()


def evaluate_eligibility(opp: FundingOpportunity, profile: Optional[ResearchProfile]) -> dict:
    """Evaluate hard filters and return a dict of boolean results."""
    from datetime import datetime, timezone
    passes = {}
    
    # 1. Deadline Check
    if opp.deadline_date:
        passes["deadline"] = opp.deadline_date > datetime.now(timezone.utc).replace(tzinfo=None)
    else:
        passes["deadline"] = True
        
    if not profile:
        # If no profile, we can't check profile-specific fields, so they fail if the opp requires them
        passes["career_stage"] = not bool(opp.min_career_stage)
        passes["institution_type"] = not bool(opp.institution_type)
        passes["region"] = not bool(opp.region)
        return passes

    # 2. Career Stage Check
    if opp.min_career_stage and opp.min_career_stage.lower() != "any":
        passes["career_stage"] = (profile.career_stage and profile.career_stage.lower() == opp.min_career_stage.lower())
    else:
        passes["career_stage"] = True

    # 3. Institution Type Check
    if opp.institution_type and opp.institution_type.lower() != "any":
        passes["institution_type"] = (profile.institution_type and profile.institution_type.lower() == opp.institution_type.lower())
    else:
        passes["institution_type"] = True

    # 4. Region Check
    if opp.region and opp.region.lower() != "any":
        passes["region"] = (profile.region and profile.region.lower() == opp.region.lower())
    else:
        passes["region"] = True

    return passes


def match_funding_opportunities(
    db: Session,
    profile: Optional[ResearchProfile],
    limit: int = 20,
    skip: int = 0,
    min_score: Optional[float] = None,
) -> List[FundingMatchResponse]:
    """
    Two-stage pipeline:
    1. Hard filter based on eligibility.
    2. Soft rank using semantic score.
    """
    all_opportunities = db.query(FundingOpportunity).all()
    if not all_opportunities:
        return []

    # Stage 1: Hard Filter
    eligible_opps = []
    eligibility_results = {}
    for opp in all_opportunities:
        passes = evaluate_eligibility(opp, profile)
        if all(passes.values()):
            eligible_opps.append(opp)
            eligibility_results[opp.id] = passes
            
    if not eligible_opps:
        return []

    profile_text = get_profile_representation(profile)

    # Stage 2: Soft Rank
    # If profile has no text representation, return top opportunities with baseline score 0.0
    if not profile_text:
        logger.info(
            "Profile text representation is empty. Returning opportunities with baseline score 0.0."
        )
        results = []
        for opp in eligible_opps[skip:skip+limit]:
            results.append(
                FundingMatchResponse(
                    id=opp.id,
                    title=opp.title,
                    source=opp.source,
                    description=opp.description,
                    eligibility_criteria=opp.eligibility_criteria or "",
                    domain_tags=opp.domain_tags,
                    deadline=opp.deadline,
                    amount=opp.amount,
                    min_career_stage=opp.min_career_stage,
                    institution_type=opp.institution_type,
                    region=opp.region,
                    min_amount=opp.min_amount,
                    max_amount=opp.max_amount,
                    deadline_date=opp.deadline_date,
                    created_at=opp.created_at,
                    match_score=0.0,
                    eligibility_passes=eligibility_results[opp.id]
                )
            )
        return results

    model = get_embedding_model()
    opp_texts = [get_opportunity_representation(opp) for opp in eligible_opps]

    all_texts = [profile_text] + opp_texts
    embeddings = model.encode(all_texts, normalize_embeddings=True)

    profile_emb = embeddings[0]
    opp_embs = embeddings[1:]

    scores = np.dot(opp_embs, profile_emb)

    scored_opps = []
    for opp, score in zip(eligible_opps, scores):
        sim_score = float(score)
        if min_score is not None and sim_score < min_score:
            continue
        scored_opps.append((opp, sim_score))

    scored_opps.sort(key=lambda x: x[1], reverse=True)

    results = []
    for opp, score in scored_opps[skip:skip+limit]:
        results.append(
            FundingMatchResponse(
                id=opp.id,
                title=opp.title,
                source=opp.source,
                description=opp.description,
                eligibility_criteria=opp.eligibility_criteria or "",
                domain_tags=opp.domain_tags,
                deadline=opp.deadline,
                amount=opp.amount,
                min_career_stage=opp.min_career_stage,
                institution_type=opp.institution_type,
                region=opp.region,
                min_amount=opp.min_amount,
                max_amount=opp.max_amount,
                deadline_date=opp.deadline_date,
                created_at=opp.created_at,
                match_score=round(score, 4),
                eligibility_passes=eligibility_results[opp.id]
            )
        )
    return results
