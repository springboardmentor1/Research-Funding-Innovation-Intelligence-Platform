"""
Notification & Alert System (spec section 10):
  - New funding alerts, patent monitoring alerts, emerging technology alerts,
    research trend updates, commercialization opportunities, platform notifications

Computed on-demand from current DB state (no background worker/queue yet -- that's
a natural next step once the platform has real user volume).
"""
from datetime import datetime, timezone, timedelta
from app.models.user import User
from app.models.profile import ResearchProfile
from app.models.funding import FundingOpportunity
from app.models.patent import Patent
from app.services.funding_engine import recommend_funding
from app.services.patent_analytics import cluster_by_domain

RECENT_WINDOW_DAYS = 30


def _is_recent(dt) -> bool:
    if not dt:
        return False
    now = datetime.now(timezone.utc)
    created = dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    return (now - created) <= timedelta(days=RECENT_WINDOW_DAYS)


def generate_alerts(user: User, profile: ResearchProfile, opportunities: list[FundingOpportunity], patents: list[Patent]) -> list[dict]:
    alerts = []

    if profile.research_domains:
        ranked = recommend_funding(user, profile, opportunities, top_n=len(opportunities))
        for r in ranked:
            if r["eligible"] and r["match_score"] >= 70 and _is_recent(r["opportunity"].created_at):
                alerts.append({
                    "type": "new_funding_alert",
                    "title": f"New high-match funding: {r['opportunity'].title}",
                    "detail": f"{r['match_score']}% match on {r['opportunity'].source_category}.",
                    "severity": "high",
                })

        domain_patents = [
            p for p in patents
            if any(d.lower() in [x.lower() for x in profile.research_domains] for d in (p.technology_domain or []))
        ]
        for p in domain_patents:
            if _is_recent(p.created_at):
                alerts.append({
                    "type": "patent_monitoring_alert",
                    "title": f"New patent activity: {p.assignee}",
                    "detail": f"\"{p.title}\" filed in a domain you track.",
                    "severity": "medium",
                })

        clusters = cluster_by_domain(patents)
        for c in clusters:
            if c["technology_domain"].lower() in [d.lower() for d in profile.research_domains] and c["patent_count"] >= 3:
                alerts.append({
                    "type": "emerging_technology_alert",
                    "title": f"Growing patent activity in {c['technology_domain']}",
                    "detail": f"{c['patent_count']} patents tracked, avg {c['avg_citation_count']} citations.",
                    "severity": "low",
                })
    else:
        alerts.append({
            "type": "platform_notification",
            "title": "Complete your research profile",
            "detail": "Add research domains and keywords to start receiving personalized funding and patent alerts.",
            "severity": "medium",
        })

    return alerts
