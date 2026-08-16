import os
import requests
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
from fastapi import HTTPException, status
from app.models.publication import Publication
from app.models.profile import ResearchProfile
from app.services.profile_service import get_profile_by_user

# OpenAlex base endpoint URL
OPENALEX_WORKS_URL = "https://api.openalex.org/works"

def reconstruct_abstract(inverted_index: Optional[dict]) -> Optional[str]:
    """Rebuilds full abstract text from OpenAlex's inverted index format."""
    if not inverted_index:
        return None
    try:
        # Find the maximum position index to initialize the word list
        max_pos = max([pos for positions in inverted_index.values() for pos in positions]) + 1
        words = [None] * max_pos
        for word, positions in inverted_index.items():
            for pos in positions:
                if pos < max_pos:
                    words[pos] = word
        return " ".join([w for w in words if w is not None])
    except Exception:
        return None

def fetch_and_sync_publications(db: Session, user_id: str, limit: int = 10, page: int = 1, keyword: Optional[str] = None) -> List[Publication]:
    # 1. Fetch user's research profile to get search context
    try:
        profile = get_profile_by_user(db, user_id)
    except HTTPException:
        # Gracefully auto-create default research profile for user if missing
        profile = ResearchProfile(
            user_id=user_id,
            research_domain="Biotechnology & Artificial Intelligence",
            research_subdomain="Autonomous Control Systems",
            keywords="biotechnology, neural networks, robotics",
            organization="Cyberdyne Research Labs",
            designation="Principal Investigator"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # 2. Build search query from keyword and profile fields
    query_parts = []
    if keyword and keyword.strip():
        query_parts.append(keyword.strip())
    else:
        if profile.research_domain:
            query_parts.append(profile.research_domain)
        if profile.research_subdomain:
            query_parts.append(profile.research_subdomain)
        if profile.keywords:
            query_parts.append(profile.keywords)
    
    search_query = " ".join(query_parts)
    if not search_query.strip():
        search_query = "biotechnology"

    # 3. Call OpenAlex API
    params = {
        "search": search_query,
        "per_page": limit,
        "page": page
    }
    
    headers = {"User-Agent": "mailto:platform-admin@example.com"}
    api_key = os.getenv("OPENALEX_API_KEY")
    if api_key:
        params["api_key"] = api_key

    try:
        response = requests.get(OPENALEX_WORKS_URL, params=params, headers=headers, timeout=15)
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"OpenAlex API returned error code {response.status_code}"
            )
        data = response.json()
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to connect to OpenAlex API: {str(e)}"
        )

    # 4. Parse results and sync to database
    synced_publications = []
    works = data.get("results", [])

    for work in works:
        if not work or not isinstance(work, dict):
            continue
        openalex_id = work.get("id")
        if not openalex_id:
            continue

        # Check if already synced for this user
        existing_pub = db.query(Publication).filter(
            Publication.user_id == user_id,
            Publication.openalex_id == openalex_id
        ).first()

        if existing_pub:
            synced_publications.append(existing_pub)
            continue

        # Parse abstract
        abstract = reconstruct_abstract(work.get("abstract_inverted_index"))

        # Parse authors
        authorships = work.get("authorships") or []
        author_names = [(auth.get("author") or {}).get("display_name") for auth in authorships if isinstance(auth, dict) and auth.get("author")]
        authors_str = ", ".join([name for name in author_names if name])

        # Parse keywords / concepts
        concepts = work.get("concepts") or []
        concept_names = [c.get("display_name") for c in concepts if isinstance(c, dict) and c.get("display_name")]
        keywords_str = ", ".join(concept_names[:10])

        # Journal / Source
        primary_location = work.get("primary_location") or {}
        source_obj = primary_location.get("source") or {}
        journal_name = source_obj.get("display_name")

        # Open Access Status
        open_access_obj = work.get("open_access") or {}
        open_access = open_access_obj.get("is_oa", False)

        # Source URL
        source_url = primary_location.get("landing_page_url") or work.get("doi")

        new_pub = Publication(
            openalex_id=openalex_id,
            user_id=user_id,
            title=work.get("title") or work.get("display_name") or "Untitled Work",
            abstract=abstract[:4000] if abstract else None,
            authors=authors_str[:1000] if authors_str else None,
            publication_year=work.get("publication_year"),
            doi=work.get("doi"),
            citation_count=work.get("cited_by_count", 0),
            journal=journal_name[:255] if journal_name else None,
            keywords=keywords_str[:1000] if keywords_str else None,
            open_access=open_access,
            source_url=source_url[:500] if source_url else None
        )
        db.add(new_pub)
        db.commit()
        db.refresh(new_pub)
        synced_publications.append(new_pub)

    return synced_publications

def get_user_publications(
    db: Session,
    user_id: str,
    domain: Optional[str] = None,
    year: Optional[int] = None,
    min_citations: Optional[int] = None,
    keyword: Optional[str] = None,
    auto_sync: bool = False
) -> List[Publication]:
    query = db.query(Publication).filter(Publication.user_id == user_id)

    # Filter by Research Domain by joining on ResearchProfile
    if domain:
        query = query.outerjoin(ResearchProfile, Publication.user_id == ResearchProfile.user_id).filter(
            or_(
                ResearchProfile.research_domain.ilike(f"%{domain}%"),
                Publication.keywords.ilike(f"%{domain}%")
            )
        )

    if year is not None:
        query = query.filter(Publication.publication_year == year)

    if min_citations is not None:
        query = query.filter(Publication.citation_count >= min_citations)

    if keyword:
        # Search in title, abstract, or keywords
        query = query.filter(
            or_(
                Publication.title.ilike(f"%{keyword}%"),
                Publication.abstract.ilike(f"%{keyword}%"),
                Publication.keywords.ilike(f"%{keyword}%")
            )
        )

    results = query.all()

    # If 0 publications match local DB and auto_sync is enabled, auto-fetch from OpenAlex
    if not results and auto_sync and keyword:
        try:
            results = fetch_and_sync_publications(db, user_id, limit=10, keyword=keyword)
        except Exception:
            pass

    return results

def get_publication_by_id(db: Session, publication_id: str, user_id: str) -> Publication:
    pub = db.query(Publication).filter(
        Publication.publication_id == publication_id,
        Publication.user_id == user_id
    ).first()
    if not pub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )
    return pub
