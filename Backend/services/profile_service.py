from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.profile import ResearchProfile
from models.profile_history import ProfileHistory
from schemas.profile_schema import ProfileUpdate


def get_profile_by_user_id(db: Session, user_id: int):
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )
    return profile


def _compute_change_summary(old_profile: ResearchProfile, new_data: ProfileUpdate) -> str:
    """Compare old profile state with new data and produce a human-readable summary."""
    changes = []

    if (old_profile.bio or "") != (new_data.bio or ""):
        changes.append("Updated biography")
    if (old_profile.organization or "") != (new_data.organization or ""):
        changes.append(f"Organization → {new_data.organization or '(cleared)'}")
    if (old_profile.department or "") != (new_data.department or ""):
        changes.append(f"Department → {new_data.department or '(cleared)'}")

    if new_data.career_stage is not None and (old_profile.career_stage or "") != new_data.career_stage:
        changes.append(f"Career stage → {new_data.career_stage}")
    if new_data.institution_type is not None and (old_profile.institution_type or "") != new_data.institution_type:
        changes.append(f"Institution type → {new_data.institution_type}")
    if new_data.region is not None and (old_profile.region or "") != new_data.region:
        changes.append(f"Region → {new_data.region or '(cleared)'}")

    if (old_profile.h_index or 0) != (new_data.h_index or 0):
        changes.append(f"h-index → {new_data.h_index}")
    if (old_profile.total_citations or 0) != (new_data.total_citations or 0):
        changes.append(f"Citations → {new_data.total_citations}")

    old_domains = set(old_profile.research_domains or [])
    new_domains = set(new_data.research_domains or [])
    added_domains = new_domains - old_domains
    removed_domains = old_domains - new_domains
    if added_domains:
        changes.append(f"Added domains: {', '.join(added_domains)}")
    if removed_domains:
        changes.append(f"Removed domains: {', '.join(removed_domains)}")

    old_keywords = set(old_profile.keywords or [])
    new_keywords = set(new_data.keywords or [])
    added_kw = new_keywords - old_keywords
    removed_kw = old_keywords - new_keywords
    if added_kw:
        changes.append(f"Added keywords: {', '.join(added_kw)}")
    if removed_kw:
        changes.append(f"Removed keywords: {', '.join(removed_kw)}")

    old_pubs = set(old_profile.linked_publications or [])
    new_pubs = set(new_data.linked_publications or [])
    added_pubs = new_pubs - old_pubs
    removed_pubs = old_pubs - new_pubs
    if added_pubs:
        changes.append(f"Added {len(added_pubs)} publication(s)")
    if removed_pubs:
        changes.append(f"Removed {len(removed_pubs)} publication(s)")

    old_patents = set(old_profile.linked_patents or [])
    new_patents = set(new_data.linked_patents or [])
    added_pat = new_patents - old_patents
    removed_pat = old_patents - new_patents
    if added_pat:
        changes.append(f"Added {len(added_pat)} patent(s)")
    if removed_pat:
        changes.append(f"Removed {len(removed_pat)} patent(s)")

    return "; ".join(changes) if changes else "Profile saved (no changes detected)"


def _create_history_snapshot(db: Session, user_id: int, profile: ResearchProfile, change_summary: str):
    """Create a historical snapshot of the current profile state."""
    snapshot = ProfileHistory(
        user_id=user_id,
        bio=profile.bio,
        organization=profile.organization,
        department=profile.department,
        career_stage=profile.career_stage,
        institution_type=profile.institution_type,
        region=profile.region,
        h_index=profile.h_index,
        total_citations=profile.total_citations,
        change_summary=change_summary,
    )
    # Use setters for JSON fields
    snapshot.research_domains = profile.research_domains
    snapshot.keywords = profile.keywords
    snapshot.linked_publications = profile.linked_publications
    snapshot.linked_patents = profile.linked_patents

    db.add(snapshot)


def update_profile(db: Session, user_id: int, data: ProfileUpdate):
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )

    # Compute change summary BEFORE applying changes
    change_summary = _compute_change_summary(profile, data)

    # Apply updates
    profile.bio = data.bio
    profile.organization = data.organization
    profile.department = data.department
    profile.h_index = data.h_index
    profile.total_citations = data.total_citations

    # Using sqlalchemy setters
    profile.research_domains = data.research_domains
    profile.keywords = data.keywords
    profile.linked_publications = data.linked_publications
    profile.linked_patents = data.linked_patents

    if data.career_stage is not None:
        profile.career_stage = data.career_stage
    if data.institution_type is not None:
        profile.institution_type = data.institution_type
    if data.region is not None:
        profile.region = data.region

    # Create history snapshot AFTER applying changes (snapshot captures the new state)
    _create_history_snapshot(db, user_id, profile, change_summary)

    db.commit()
    db.refresh(profile)
    return profile


def get_profile_history(db: Session, user_id: int, limit: int = 50):
    """Return the full history of profile saves for a user, newest first."""
    return (
        db.query(ProfileHistory)
        .filter(ProfileHistory.user_id == user_id)
        .order_by(ProfileHistory.saved_at.desc())
        .limit(limit)
        .all()
    )
