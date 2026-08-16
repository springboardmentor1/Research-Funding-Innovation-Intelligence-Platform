"""
Innovation Scoring Engine (corpus-relative calibration).

Implements the weighted model from section 7 of the project document:

    Innovation Score = Research Novelty      30%
                     + Patent Strength       20%
                     + Technology Maturity   15%
                     + Market Potential      20%
                     + Funding Relevance     15%

WHY THIS VERSION EXISTS - A CALIBRATION FAILURE AND ITS FIX
-----------------------------------------------------------
The first implementation scaled each component against a hardcoded ceiling
(50 median citations, 200 applicants, 50 funding opportunities). Against a
general research corpus those are reasonable. Against THIS corpus they are
not, and the result was that four of five components pegged at exactly 100
for an AI-focused profile - a score with no discriminating power.

The cause is the sampling design, not the arithmetic. Patents were collected
from CPC G06N (machine learning) only; publications were filtered to
machine-learning keywords. An AI profile therefore matches ~28% of the
corpus. Absolute thresholds saturate immediately.

FIX: every component is now measured RELATIVE TO THE CORPUS. A component
answers "how does this profile compare to everything we hold?" rather than
"does this profile clear an arbitrary bar?" Shares and ratios cannot
saturate the way absolute counts do.

A SECOND, WORSE PROBLEM - A METRIC THAT MEASURED NOTHING
--------------------------------------------------------
Technology Maturity was patents divided by publications. The corpus holds
10,000 patents and 9,943 publications because those are the quantities that
were fetched. Every subset therefore lands near 1.0. That metric measured an
ingestion decision, not a property of any technology.

It is now the share of matching patents whose legal status is active or
granted, rather than still pending as an application. Granting is a real,
field-dependent signal: an established technology has a higher proportion of
issued patents, while an emerging one is dominated by pending applications.
It is not an artifact of how much data was downloaded.

EVERY COMPONENT IS A PROXY, AND SAYS SO
---------------------------------------
"Market potential" cannot be measured from patent metadata. What CAN be
measured is the share of patenting organisations active in the area - a
defensible proxy for commercial interest and nothing more. Each component
returns its evidence so the number can be interrogated rather than trusted.
"""

from __future__ import annotations

from datetime import date

from sqlalchemy import Integer, cast, func, or_, select
from sqlalchemy.orm import Session

from app.models import FundingOpportunity, Patent, Publication, ResearchProfile

RECENT_YEARS = 3
CURRENT_YEAR = 2024      # last complete year - publication lag makes 2025+ partial

# Legal-status values that indicate a granted / in-force patent rather than a
# pending application. Lens uses a small controlled vocabulary here.
GRANTED_STATUSES = ("ACTIVE", "PATENTED")


def _terms(profile: ResearchProfile) -> list[str]:
    raw = (profile.research_domains or []) + \
          (profile.keywords or []) + \
          (profile.technology_areas or [])
    return sorted({t.strip().lower() for t in raw if t and t.strip()})


def _text_match(column, terms: list[str]):
    """OR of ILIKE conditions - true if the column contains ANY term."""
    if not terms:
        return None
    return or_(*[column.ilike(f"%{t}%") for t in terms])


def _pct(part: float, whole: float) -> float:
    """Share as 0-100. Returns 0 rather than dividing by zero."""
    if not whole:
        return 0.0
    return round(min(part / whole, 1.0) * 100, 2)


# ------------------------------------------------------------------ corpus
def corpus_stats(db: Session) -> dict:
    """Corpus-wide denominators, computed once per scoring call.

    These are what make the components relative. Without them every
    threshold is a guess, and a guess calibrated for the wrong corpus is
    exactly how the previous version saturated.
    """
    total_pubs = db.scalar(select(func.count()).select_from(Publication)) or 0
    total_pats = db.scalar(select(func.count()).select_from(Patent)) or 0

    applicant = func.unnest(Patent.applicants).label("a")
    sub = select(applicant).subquery()
    total_applicants = db.scalar(
        select(func.count(func.distinct(sub.c.a)))
    ) or 0

    median = func.percentile_cont(0.5).within_group(Patent.cited_by_count.asc())
    corpus_median_citations = float(db.scalar(select(median)) or 0)

    total_open = db.scalar(
        select(func.count()).select_from(FundingOpportunity)
        .where(FundingOpportunity.close_date > date.today())
    ) or 0

    return {
        "publications": total_pubs,
        "patents": total_pats,
        "distinct_applicants": total_applicants,
        "median_patent_citations": corpus_median_citations,
        "open_opportunities": total_open,
    }


# ------------------------------------------------------------------ components
def research_novelty(db: Session, terms: list[str], _c: dict) -> dict:
    """Share of matching publications from the last RECENT_YEARS.

    Already a share, so it never saturated and is unchanged. A field whose
    literature is mostly recent is active and emerging; one whose literature
    is a decade old is established - lower novelty, not lower value.
    """
    cond = _text_match(Publication.topic, terms)
    if cond is None:
        return {"value": 0.0, "evidence": {"reason": "no profile terms"}}

    cutoff = CURRENT_YEAR - RECENT_YEARS + 1
    r = db.execute(
        select(func.count().label("total"),
               func.sum(cast(Publication.publication_year >= cutoff, Integer))
               .label("recent"))
        .where(cond)
    ).one()

    total, recent = r.total or 0, r.recent or 0
    if total == 0:
        return {"value": 0.0,
                "evidence": {"matching_publications": 0,
                             "note": "no publications matched profile terms"}}

    return {
        "value": _pct(recent, total),
        "evidence": {
            "matching_publications": total,
            "published_since": cutoff,
            "recent_publications": recent,
            "measure": "share of matching publications that are recent",
        },
    }


def patent_strength(db: Session, terms: list[str], c: dict) -> dict:
    """Median citations of matching patents, relative to the corpus median.

    MEDIAN, not mean: patent citations are extremely long-tailed. One patent
    with 1,496 citations would drag a mean upward and describe that outlier
    rather than the field.

    Parity with the corpus scores 50. Three times the corpus median scores
    100. Being average is not zero - it is average.
    """
    cond = _text_match(Patent.title, terms)
    if cond is None:
        return {"value": 0.0, "evidence": {"reason": "no profile terms"}}

    median = func.percentile_cont(0.5).within_group(Patent.cited_by_count.asc())
    r = db.execute(
        select(func.count().label("n"),
               median.label("med"),
               func.max(Patent.cited_by_count).label("mx"))
        .where(cond)
    ).one()

    n = r.n or 0
    if n == 0:
        return {"value": 0.0, "evidence": {"matching_patents": 0}}

    med = float(r.med or 0)
    baseline = c["median_patent_citations"] or 1.0
    ratio = med / baseline
    # ratio of 3.0 (triple the corpus median) maps to 100
    value = round(min(ratio / 3.0, 1.0) * 100, 2)

    return {
        "value": value,
        "evidence": {
            "matching_patents": n,
            "median_citations": med,
            "corpus_median_citations": baseline,
            "ratio_to_corpus": round(ratio, 2),
            "max_citations": r.mx,
            "measure": "median citations vs corpus median; parity = 50",
        },
    }


def technology_maturity(db: Session, terms: list[str], _c: dict) -> dict:
    """Share of matching patents that are granted rather than pending.

    REPLACES the previous patents-per-publication ratio, which measured how
    much data was ingested rather than any property of a technology.

    An established technology has a high proportion of issued, in-force
    patents. An emerging one is dominated by pending applications that have
    not yet cleared examination.
    """
    cond = _text_match(Patent.title, terms)
    if cond is None:
        return {"value": 0.0, "evidence": {"reason": "no profile terms"}}

    total = db.scalar(select(func.count()).select_from(Patent).where(cond)) or 0
    if total == 0:
        return {"value": 0.0, "evidence": {"matching_patents": 0}}

    granted = db.scalar(
        select(func.count()).select_from(Patent)
        .where(cond)
        .where(func.upper(func.coalesce(Patent.legal_status, ""))
               .in_(GRANTED_STATUSES))
    ) or 0

    return {
        "value": _pct(granted, total),
        "evidence": {
            "matching_patents": total,
            "granted_or_active": granted,
            "pending_or_other": total - granted,
            "measure": "share of matching patents that are granted/active",
            "statuses_counted": list(GRANTED_STATUSES),
        },
    }


def market_potential(db: Session, terms: list[str], c: dict) -> dict:
    """Share of all patenting organisations that are active in this area.

    PROXY, stated plainly: this measures commercial INTEREST, not market
    size or revenue. A high share means a large fraction of the organisations
    patenting anywhere in the corpus consider this area worth protecting.

    It also under-counts, because the same company appears under several
    name variants ('AMAZON TECH INC' vs 'AMAZON TECHNOLOGIES INC'). Entity
    resolution would raise it. Treat as a lower bound.
    """
    cond = _text_match(Patent.title, terms)
    if cond is None:
        return {"value": 0.0, "evidence": {"reason": "no profile terms"}}

    applicant = func.unnest(Patent.applicants).label("a")
    sub = select(applicant).where(cond).subquery()
    matching = db.scalar(select(func.count(func.distinct(sub.c.a)))) or 0

    return {
        "value": _pct(matching, c["distinct_applicants"]),
        "evidence": {
            "matching_applicants": matching,
            "corpus_applicants": c["distinct_applicants"],
            "measure": "share of all patenting organisations active in this area",
            "caveat": "applicant names are not entity-resolved; lower bound",
        },
    }


def funding_relevance(db: Session, terms: list[str], c: dict) -> dict:
    """Share of currently open opportunities that match the profile.

    The only forward-looking component - it answers "can this be funded
    now?" rather than "what has happened historically?"
    """
    if not terms:
        return {"value": 0.0, "evidence": {"reason": "no profile terms"}}

    cond = or_(
        _text_match(FundingOpportunity.title, terms),
        _text_match(FundingOpportunity.description, terms),
    )
    r = db.execute(
        select(func.count().label("n"),
               func.sum(FundingOpportunity.award_ceiling).label("ceiling"))
        .where(cond)
        .where(FundingOpportunity.close_date > date.today())
    ).one()

    n = r.n or 0
    return {
        "value": _pct(n, c["open_opportunities"]),
        "evidence": {
            "matching_open_opportunities": n,
            "total_open_opportunities": c["open_opportunities"],
            "combined_award_ceiling": float(r.ceiling or 0),
            "measure": "share of open opportunities matching this profile",
        },
    }


# ------------------------------------------------------------------ engine
WEIGHTS = {
    "research_novelty": 0.30,
    "patent_strength": 0.20,
    "technology_maturity": 0.15,
    "market_potential": 0.20,
    "funding_relevance": 0.15,
}


def compute_score(db: Session, profile: ResearchProfile) -> dict:
    terms = _terms(profile)
    stats = corpus_stats(db)

    components = {
        "research_novelty": research_novelty(db, terms, stats),
        "patent_strength": patent_strength(db, terms, stats),
        "technology_maturity": technology_maturity(db, terms, stats),
        "market_potential": market_potential(db, terms, stats),
        "funding_relevance": funding_relevance(db, terms, stats),
    }

    contributions = {
        name: round(data["value"] * WEIGHTS[name], 2)
        for name, data in components.items()
    }
    total = round(sum(contributions.values()), 2)

    return {
        "profile_id": profile.id,
        "terms_used": terms,
        "corpus": stats,
        "components": {
            name: {
                "value": data["value"],
                "weight": WEIGHTS[name],
                "contribution": contributions[name],
                "evidence": data["evidence"],
            }
            for name, data in components.items()
        },
        "total_score": total,
        "interpretation": _interpret(total),
        "calibration": "corpus-relative; every component is a share or ratio "
                       "measured against the full corpus, so scores do not "
                       "saturate on a domain-specific dataset",
    }


def _interpret(total: float) -> str:
    if total >= 70:
        return ("High innovation potential - the profile's area is active, "
                "commercially contested, and well funded relative to the corpus")
    if total >= 45:
        return ("Moderate innovation potential - above corpus average in at "
                "least one dimension")
    if total >= 20:
        return "Emerging - measurable but below corpus average across most dimensions"
    return ("Low measured signal - the profile may be too narrow, too novel, "
            "or outside the corpus's coverage")
