import os
import json
import datetime
from typing import Dict, Any

# Locate base directory relative to this service file
# c:\Users\Admin\OneDrive\Desktop\ATM\Research-Funding-Innovation-Intelligence-Platform\backend\app\services\dashboard_service.py
# Base directory is 4 levels up
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

PUBLICATION_DATA_PATH = os.path.join(BASE_DIR, "datasets", "analytics", "publication_dashboard_data.json")
PATENT_DATA_PATH = os.path.join(BASE_DIR, "datasets", "analytics", "patent_dashboard_data.json")
FUNDING_DATA_PATH = os.path.join(BASE_DIR, "datasets", "analytics", "funding_dashboard_data.json")

def load_publication_dashboard() -> Dict[str, Any]:
    """Load publication dashboard analytics JSON."""
    if not os.path.exists(PUBLICATION_DATA_PATH):
        raise FileNotFoundError(f"Publication dashboard data not found at {PUBLICATION_DATA_PATH}")
    with open(PUBLICATION_DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def load_patent_dashboard() -> Dict[str, Any]:
    """Load patent dashboard analytics JSON."""
    if not os.path.exists(PATENT_DATA_PATH):
        raise FileNotFoundError(f"Patent dashboard data not found at {PATENT_DATA_PATH}")
    with open(PATENT_DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def load_funding_dashboard() -> Dict[str, Any]:
    """Load funding dashboard analytics JSON."""
    if not os.path.exists(FUNDING_DATA_PATH):
        raise FileNotFoundError(f"Funding dashboard data not found at {FUNDING_DATA_PATH}")
    with open(FUNDING_DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def build_dashboard_summary(
    pub_data: Dict[str, Any] = None,
    patent_data: Dict[str, Any] = None,
    funding_data: Dict[str, Any] = None
) -> Dict[str, Any]:
    """Generate high-level dashboard KPI summary cards."""
    if pub_data is None:
        pub_data = load_publication_dashboard()
    if patent_data is None:
        patent_data = load_patent_dashboard()
    if funding_data is None:
        funding_data = load_funding_dashboard()

    # 1. Total Publications
    total_publications = pub_data.get("summary_metrics", {}).get("total_publications", 0)

    # 2. Total Patents
    total_patents = patent_data.get("summary_metrics", {}).get("total_patents", 0)

    # 3. Total Funding Opportunities
    total_funding_opportunities = funding_data.get("summary_metrics", {}).get("total_funding_opportunities", 0)

    # 4. Total Research Domains (union of domains present across datasets)
    pub_domains = {item["domain"] for item in pub_data.get("publications_by_domain", []) if "domain" in item}
    pat_domains = {item["domain"] for item in patent_data.get("patents_by_technology_domain", []) if "domain" in item}
    fun_domains = {item["domain"] for item in funding_data.get("funding_opportunities_by_domain", []) if "domain" in item}
    total_research_domains = len(pub_domains | pat_domains | fun_domains)

    # 5. Total Countries (union of countries in patent and funding datasets)
    pat_countries = {item["country"] for item in patent_data.get("country_distribution", []) if "country" in item}
    fun_countries = {item["country"] for item in funding_data.get("country_distribution", []) if "country" in item}
    total_countries = len(pat_countries | fun_countries)

    # 6. Total Funding Agencies
    total_funding_agencies = funding_data.get("summary_metrics", {}).get("unique_funding_agencies", 0)
    if not total_funding_agencies:
        total_funding_agencies = len(funding_data.get("top_funding_agencies", []))

    # 7. Last Analytics Update Timestamp
    paths = [PUBLICATION_DATA_PATH, PATENT_DATA_PATH, FUNDING_DATA_PATH]
    mtimes = [os.path.getmtime(p) for p in paths if os.path.exists(p)]
    if mtimes:
        last_update = datetime.datetime.fromtimestamp(max(mtimes)).strftime("%Y-%m-%d %H:%M:%S")
    else:
        last_update = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    return {
        "total_publications": total_publications,
        "total_patents": total_patents,
        "total_funding_opportunities": total_funding_opportunities,
        "total_research_domains": total_research_domains,
        "total_countries": total_countries,
        "total_funding_agencies": total_funding_agencies,
        "last_analytics_update": last_update
    }

def get_dashboard_data() -> Dict[str, Any]:
    """Load all analytical datasets and combine them with the KPI summary."""
    pub_data = load_publication_dashboard()
    patent_data = load_patent_dashboard()
    funding_data = load_funding_dashboard()
    summary = build_dashboard_summary(pub_data, patent_data, funding_data)

    return {
        "summary": summary,
        "publications": pub_data,
        "patents": patent_data,
        "funding": funding_data
    }
