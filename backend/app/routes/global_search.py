"""
Global publication and patent search endpoints.

Reads from the platform-wide `global_publications` and `global_patents` tables
populated by the ingestion system. Any authenticated user can search.

Routes:
  GET /global/publications/keyword-search — live OpenAlex search by keyword (high-quality papers)
  GET /global/publications          — paginated search of global publications
  GET /global/publications/{id}     — single publication by internal ID
  GET /global/patents               — paginated search of global patents
  GET /global/patents/{id}          — single patent by internal ID
"""
import logging
import os
import requests
from typing import Optional, List
from datetime import date

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.connection import get_db
from app.services.auth_service import get_current_user
from app.models.user import User
from app.models.global_publication import GlobalPublication
from app.models.global_patent import GlobalPatent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/global", tags=["Global Search"])

OPENALEX_BASE_URL = os.getenv("OPENALEX_BASE_URL", "https://api.openalex.org")
OPENALEX_API_KEY = os.getenv("OPENALEX_API_KEY", "")


# ---------------------------------------------------------------------------
# Pydantic response schemas
# ---------------------------------------------------------------------------

class PublicationOut(BaseModel):
    id: str
    external_id: str
    source: str
    doi: Optional[str]
    title: str
    abstract: Optional[str]
    authors: Optional[list]
    journal: Optional[str]
    publication_date: Optional[str]
    publication_year: Optional[int]
    citation_count: int
    open_access: Optional[str]
    url: Optional[str]
    topics: Optional[list]
    created_at: Optional[str]
    updated_at: Optional[str]

    class Config:
        from_attributes = True


class PatentOut(BaseModel):
    id: str
    external_id: str
    source: str
    patent_number: Optional[str]
    title: str
    abstract: Optional[str]
    inventors: Optional[list]
    assignee: Optional[str]
    filing_date: Optional[str]
    publication_date: Optional[str]
    url: Optional[str]
    classification: Optional[str]
    status: Optional[str]
    jurisdiction: Optional[str]
    created_at: Optional[str]
    updated_at: Optional[str]

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Live keyword-search response schema (richer than PublicationOut)
# ---------------------------------------------------------------------------

class KeywordPaperOut(BaseModel):
    id: str                        # OpenAlex work ID (or DB id)
    title: str
    doi: Optional[str]             # bare DOI  e.g. 10.1234/abc
    doi_url: Optional[str]         # full https://doi.org/…
    source_url: Optional[str]      # publisher landing page
    link: str                      # best clickable link for the paper
    authors: List[str]
    journal: Optional[str]
    publication_year: Optional[int]
    citation_count: int
    open_access: Optional[str]     # "gold", "green", "closed", …
    abstract: Optional[str]
    keywords: List[str]            # matched topics / concepts
    source: str                    # "openalex" | "local_db"


# ---------------------------------------------------------------------------
# Live keyword-search endpoint — fetches from OpenAlex directly
# ---------------------------------------------------------------------------

def _reconstruct_abstract(inverted_index):
    """Rebuild abstract text from OpenAlex inverted index."""
    if not inverted_index or not isinstance(inverted_index, dict):
        return None
    try:
        max_pos = max(pos for positions in inverted_index.values() for pos in positions) + 1
        words = [None] * max_pos
        for word, positions in inverted_index.items():
            for pos in positions:
                if 0 <= pos < max_pos:
                    words[pos] = word
        return " ".join(w for w in words if w)
    except Exception:
        return None


def _openalex_to_keyword_paper(work: dict) -> Optional[KeywordPaperOut]:
    """Normalise a raw OpenAlex work dict into KeywordPaperOut."""
    try:
        external_id = work.get("id", "")
        title = (work.get("title") or work.get("display_name") or "").strip()
        if not title:
            return None

        # Authors
        authors = [
            a.get("author", {}).get("display_name")
            for a in (work.get("authorships") or [])
            if a.get("author", {}).get("display_name")
        ]

        # Journal
        primary_loc = work.get("primary_location") or {}
        source_info = primary_loc.get("source") or {}
        journal = source_info.get("display_name") or None

        # DOI
        raw_doi = work.get("doi") or ""
        bare_doi = raw_doi.replace("https://doi.org/", "").replace("http://doi.org/", "").strip()
        doi_url = f"https://doi.org/{bare_doi}" if bare_doi else None

        # Best link: landing page > doi_url > semantic scholar search
        landing = primary_loc.get("landing_page_url") or None
        best_link = (
            landing
            or doi_url
            or f"https://www.semanticscholar.org/search?q={requests.utils.quote(title)}&sort=Relevance"
        )

        # Open access
        oa_info = work.get("open_access") or {}
        oa_status = oa_info.get("oa_status") or ("open" if oa_info.get("is_oa") else "closed")

        # Topics / concepts — these are the matched keywords
        topics_raw = work.get("topics") or work.get("concepts") or []
        keywords = [
            t.get("display_name")
            for t in topics_raw
            if t.get("display_name")
        ][:10]

        # Abstract
        abstract = _reconstruct_abstract(work.get("abstract_inverted_index"))

        return KeywordPaperOut(
            id=external_id,
            title=title,
            doi=bare_doi or None,
            doi_url=doi_url,
            source_url=landing,
            link=best_link,
            authors=authors,
            journal=journal,
            publication_year=work.get("publication_year"),
            citation_count=work.get("cited_by_count") or 0,
            open_access=oa_status[:10] if oa_status else None,
            abstract=abstract,
            keywords=keywords,
            source="openalex",
        )
    except Exception as exc:
        logger.warning("[keyword-search] normalise failed: %s", exc)
        return None


@router.get("/publications/keyword-search", response_model=List[KeywordPaperOut])
def keyword_search_publications(
    keyword: str = Query(..., min_length=1, description="Research keyword or topic to search for"),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Live keyword search that returns high-quality research papers from OpenAlex
    sorted by citation count (most-cited first).

    Each result includes:
    - Paper title and a direct clickable link (DOI / publisher page)
    - Authors, journal, year, citation count
    - Open-access status
    - Matched keywords/topics
    - Short abstract snippet

    Falls back to local DB when OpenAlex is unavailable.
    """
    headers = {"User-Agent": "mailto:platform-admin@research-platform.com"}
    params = {
        "search": keyword,
        "sort": "cited_by_count:desc",
        "per_page": limit,
        "select": (
            "id,title,display_name,doi,abstract_inverted_index,"
            "authorships,primary_location,publication_date,publication_year,"
            "cited_by_count,open_access,concepts,topics,type"
        ),
    }
    if OPENALEX_API_KEY:
        params["api_key"] = OPENALEX_API_KEY

    try:
        resp = requests.get(
            f"{OPENALEX_BASE_URL}/works",
            params=params,
            headers=headers,
            timeout=15,
        )
        if resp.status_code == 200:
            data = resp.json()
            results = data.get("results") or []
            papers = []
            for work in results:
                paper = _openalex_to_keyword_paper(work)
                if paper:
                    papers.append(paper)
            if papers:
                logger.info(
                    "[keyword-search] OpenAlex returned %d papers for '%s'",
                    len(papers), keyword,
                )
                return papers
        else:
            logger.warning(
                "[keyword-search] OpenAlex returned %d for keyword='%s'",
                resp.status_code, keyword,
            )
    except requests.RequestException as exc:
        logger.error("[keyword-search] OpenAlex request failed: %s", exc)

    # ----------------------------------------------------------------
    # Fallback: search local global_publications DB
    # ----------------------------------------------------------------
    logger.info("[keyword-search] Falling back to local DB for keyword='%s'", keyword)
    db_pubs = (
        db.query(GlobalPublication)
        .filter(
            or_(
                GlobalPublication.title.ilike(f"%{keyword}%"),
                GlobalPublication.abstract.ilike(f"%{keyword}%"),
                GlobalPublication.journal.ilike(f"%{keyword}%"),
            )
        )
        .order_by(GlobalPublication.citation_count.desc())
        .limit(limit)
        .all()
    )

    fallback = []
    for p in db_pubs:
        bare = (p.doi or "").replace("https://doi.org/", "").replace("http://doi.org/", "").strip()
        doi_url = f"https://doi.org/{bare}" if bare else None
        best = doi_url or p.url or f"https://www.semanticscholar.org/search?q={requests.utils.quote(p.title)}&sort=Relevance"
        fallback.append(KeywordPaperOut(
            id=p.id,
            title=p.title,
            doi=bare or None,
            doi_url=doi_url,
            source_url=p.url,
            link=best,
            authors=p.authors if isinstance(p.authors, list) else [],
            journal=p.journal,
            publication_year=p.publication_year,
            citation_count=p.citation_count or 0,
            open_access=p.open_access,
            abstract=p.abstract,
            keywords=p.topics if isinstance(p.topics, list) else [],
            source="local_db",
        ))
    return fallback


# ---------------------------------------------------------------------------
# Publication endpoints
# ---------------------------------------------------------------------------

@router.get("/publications", response_model=List[PublicationOut])
def search_global_publications(
    keyword: Optional[str] = Query(None, description="Search in title, abstract, or journal"),
    source: Optional[str] = Query(None, description="Filter by source (e.g. openalex)"),
    year_from: Optional[int] = Query(None, description="Min publication year"),
    year_to: Optional[int] = Query(None, description="Max publication year"),
    author: Optional[str] = Query(None, description="Filter by author name (partial match)"),
    journal: Optional[str] = Query(None, description="Filter by journal name (partial match)"),
    min_citations: Optional[int] = Query(None, ge=0),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search the platform-wide global publications index.
    Supports full-text keyword search across title, abstract and journal,
    plus author, year range, source, and citation filters.
    """
    q = db.query(GlobalPublication)

    if keyword:
        q = q.filter(
            or_(
                GlobalPublication.title.ilike(f"%{keyword}%"),
                GlobalPublication.abstract.ilike(f"%{keyword}%"),
                GlobalPublication.journal.ilike(f"%{keyword}%"),
            )
        )
    if source:
        q = q.filter(GlobalPublication.source == source)
    if year_from is not None:
        q = q.filter(GlobalPublication.publication_year >= year_from)
    if year_to is not None:
        q = q.filter(GlobalPublication.publication_year <= year_to)
    if journal:
        q = q.filter(GlobalPublication.journal.ilike(f"%{journal}%"))
    if min_citations is not None:
        q = q.filter(GlobalPublication.citation_count >= min_citations)

    # Author search — cast JSON array to text for ILIKE matching
    if author:
        from sqlalchemy import Text, cast
        q = q.filter(cast(GlobalPublication.authors, Text).ilike(f"%{author}%"))

    pubs = (
        q.order_by(GlobalPublication.citation_count.desc())
         .offset((page - 1) * limit)
         .limit(limit)
         .all()
    )
    return [PublicationOut(**p.to_dict()) for p in pubs]


@router.get("/publications/{pub_id}", response_model=PublicationOut)
def get_global_publication(
    pub_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a single global publication by its internal ID."""
    pub = db.query(GlobalPublication).filter(GlobalPublication.id == pub_id).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    return PublicationOut(**pub.to_dict())


# ---------------------------------------------------------------------------
# Patent endpoints
# ---------------------------------------------------------------------------

@router.get("/patents", response_model=List[PatentOut])
def search_global_patents(
    keyword: Optional[str] = Query(None, description="Search in title, abstract, or classification"),
    source: Optional[str] = Query(None, description="Filter by source (e.g. lens)"),
    status: Optional[str] = Query(None, description="Filter by status (GRANTED, FILED, etc.)"),
    jurisdiction: Optional[str] = Query(None, description="Filter by jurisdiction (e.g. US, EP)"),
    assignee: Optional[str] = Query(None, description="Filter by assignee name (partial match)"),
    inventor: Optional[str] = Query(None, description="Filter by inventor name (partial match)"),
    year_from: Optional[int] = Query(None, description="Min filing year"),
    year_to: Optional[int] = Query(None, description="Max filing year"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search the platform-wide global patent index.
    Supports keyword search, status, jurisdiction, assignee, inventor, and year range filters.
    """
    q = db.query(GlobalPatent)

    if keyword:
        q = q.filter(
            or_(
                GlobalPatent.title.ilike(f"%{keyword}%"),
                GlobalPatent.abstract.ilike(f"%{keyword}%"),
                GlobalPatent.classification.ilike(f"%{keyword}%"),
            )
        )
    if source:
        q = q.filter(GlobalPatent.source == source)
    if status:
        q = q.filter(GlobalPatent.status.ilike(status))
    if jurisdiction:
        q = q.filter(GlobalPatent.jurisdiction.ilike(f"%{jurisdiction}%"))
    if assignee:
        q = q.filter(GlobalPatent.assignee.ilike(f"%{assignee}%"))
    if year_from is not None:
        from sqlalchemy import extract
        q = q.filter(extract("year", GlobalPatent.filing_date) >= year_from)
    if year_to is not None:
        from sqlalchemy import extract
        q = q.filter(extract("year", GlobalPatent.filing_date) <= year_to)
    if inventor:
        from sqlalchemy import Text, cast
        q = q.filter(cast(GlobalPatent.inventors, Text).ilike(f"%{inventor}%"))

    patents = (
        q.order_by(GlobalPatent.filing_date.desc().nullslast())
         .offset((page - 1) * limit)
         .limit(limit)
         .all()
    )
    return [PatentOut(**p.to_dict()) for p in patents]


@router.get("/patents/{patent_id}", response_model=PatentOut)
def get_global_patent(
    patent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a single global patent by its internal ID."""
    pat = db.query(GlobalPatent).filter(GlobalPatent.id == patent_id).first()
    if not pat:
        raise HTTPException(status_code=404, detail="Patent not found")
    return PatentOut(**pat.to_dict())
