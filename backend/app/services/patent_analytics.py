"""
Patent Landscape Analysis Module (spec section 5):
  - Patent clustering, patent trend analysis, competitor patent analysis, innovation mapping
"""
from collections import defaultdict
from app.models.patent import Patent


def cluster_by_domain(patents: list[Patent]) -> list[dict]:
    buckets: dict[str, list[Patent]] = defaultdict(list)
    for p in patents:
        for domain in (p.technology_domain or ["Unclassified"]):
            buckets[domain].append(p)

    clusters = []
    for domain, plist in buckets.items():
        avg_cites = sum(p.citation_count for p in plist) / len(plist) if plist else 0
        clusters.append({
            "technology_domain": domain,
            "patent_count": len(plist),
            "avg_citation_count": round(avg_cites, 2),
        })
    return sorted(clusters, key=lambda c: c["patent_count"], reverse=True)


def trend_by_year(patents: list[Patent]) -> list[dict]:
    year_counts: dict[int, int] = defaultdict(int)
    for p in patents:
        if p.filing_date:
            year_counts[p.filing_date.year] += 1
    return [{"year": y, "count": c} for y, c in sorted(year_counts.items())]


def competitor_analysis(patents: list[Patent], top_n: int = 10) -> list[dict]:
    buckets: dict[str, list[Patent]] = defaultdict(list)
    for p in patents:
        buckets[p.assignee].append(p)

    competitors = []
    for assignee, plist in buckets.items():
        competitors.append({
            "assignee": assignee,
            "patent_count": len(plist),
            "total_citations": sum(p.citation_count for p in plist),
        })
    competitors.sort(key=lambda c: (c["patent_count"], c["total_citations"]), reverse=True)
    return competitors[:top_n]
