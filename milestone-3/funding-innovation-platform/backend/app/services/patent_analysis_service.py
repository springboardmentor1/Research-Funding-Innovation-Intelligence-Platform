"""
Business logic for Patent Landscape Analysis (Milestone 3). Read-only
analytics over the existing `patents` table — no mutation endpoints here,
since patent records are still created via the Research Profile Management
module (Milestone 1).
"""
import logging
from collections import defaultdict

from sqlalchemy.orm import Session

from app.repositories.patent_analysis_repository import PatentAnalysisRepository, PatentSearchFilters
from app.schemas.common import PaginatedResponse
from app.schemas.patent_analysis import (
    CompetitorAnalysisEntry,
    InnovationMapEntry,
    PatentClusterGroup,
    PatentSearchParams,
    PatentSearchResult,
    PatentTrendPoint,
)

logger = logging.getLogger("app.services.patent_analysis")

MAX_SAMPLE_TITLES_PER_CLUSTER = 3


class PatentAnalysisService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PatentAnalysisRepository(db)

    def search(self, params: PatentSearchParams, page: int, page_size: int) -> PaginatedResponse:
        filters = PatentSearchFilters(
            query=params.q,
            assignee=params.assignee,
            technology_domain=params.technology_domain,
            classification=params.classification,
            filed_after=params.filed_after,
            filed_before=params.filed_before,
            sort_by=params.sort_by,
            sort_dir=params.sort_dir,
        )
        skip = (page - 1) * page_size
        rows, total = self.repo.search(filters, skip=skip, limit=page_size)

        items = [
            PatentSearchResult(
                id=patent.id,
                title=patent.title,
                patent_number=patent.patent_number,
                assignee=patent.assignee,
                filing_date=patent.filing_date,
                classification=patent.classification,
                technology_domain=patent.technology_domain,
                citation_count=patent.citation_count,
                owner_organization=organization,
            )
            for patent, organization in rows
        ]
        return PaginatedResponse.build(items=items, total=total, page=page, page_size=page_size)

    def trend(self) -> list[PatentTrendPoint]:
        return [
            PatentTrendPoint(year=year, patent_count=count, total_citations=citations)
            for year, count, citations in self.repo.trend_over_time()
        ]

    def clusters(self, limit: int = 20) -> list[PatentClusterGroup]:
        """Groups all patents by (classification, technology_domain). This
        is a transparent, rule-based stand-in for ML clustering — grouping
        on the two categorical fields most indicative of technical
        similarity, ranked by cluster size."""
        patents = self.repo.all_for_clustering()

        groups: dict[tuple[str | None, str | None], list] = defaultdict(list)
        for patent in patents:
            key = (patent.classification, patent.technology_domain)
            groups[key].append(patent)

        clusters = []
        for (classification, technology_domain), group_patents in groups.items():
            sorted_patents = sorted(group_patents, key=lambda p: p.citation_count, reverse=True)
            clusters.append(
                PatentClusterGroup(
                    classification=classification,
                    technology_domain=technology_domain,
                    patent_count=len(group_patents),
                    total_citations=sum(p.citation_count for p in group_patents),
                    sample_titles=[p.title for p in sorted_patents[:MAX_SAMPLE_TITLES_PER_CLUSTER]],
                )
            )

        clusters.sort(key=lambda c: c.patent_count, reverse=True)
        return clusters[:limit]

    def competitors(self, limit: int = 20) -> list[CompetitorAnalysisEntry]:
        aggregates = self.repo.competitor_aggregates()
        return [
            CompetitorAnalysisEntry(
                assignee=assignee,
                patent_count=count,
                total_citations=citations,
                technology_domains=domains,
                latest_filing_date=latest_date,
            )
            for assignee, count, citations, domains, latest_date in aggregates[:limit]
        ]

    def innovation_map(self) -> list[InnovationMapEntry]:
        return [
            InnovationMapEntry(technology_domain=domain, classification=classification, patent_count=count)
            for domain, classification, count in self.repo.innovation_map_aggregates()
        ]
