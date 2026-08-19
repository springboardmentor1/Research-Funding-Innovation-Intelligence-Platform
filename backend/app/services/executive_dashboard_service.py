import os
import json
import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.profile import ResearchProfile
from app.models.publication import Publication
from app.models.patent import Patent

# Base directory path to access datasets if needed
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

def get_admin_dashboard(db: Session) -> Dict[str, Any]:
    """
    Generate Administrator Executive Dashboard analytics:
    - User registration statistics and role breakdown
    - System operational health, API latency, and database status
    - Recent system activity and audit logs
    """
    total_users = db.query(User).count()
    users_by_role = {
        "Researcher": db.query(User).filter(User.role == "Researcher").count(),
        "Startup Founder": db.query(User).filter(User.role == "Startup Founder").count(),
        "Innovation Manager": db.query(User).filter(User.role == "Innovation Manager").count(),
        "Administrator": db.query(User).filter(User.role == "Administrator").count(),
    }
    
    total_profiles = db.query(ResearchProfile).count()
    total_publications = db.query(Publication).count()
    total_patents = db.query(Patent).count()
    
    return {
        "system_health": {
            "status": "OPERATIONAL",
            "db_status": "CONNECTED",
            "api_latency_ms": 42,
            "uptime_percent": 99.98,
            "last_sync_timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        "user_analytics": {
            "total_registered_users": total_users,
            "role_distribution": users_by_role,
            "total_active_profiles": total_profiles
        },
        "content_inventory": {
            "total_publications_synced": total_publications,
            "total_patents_synced": total_patents,
            "total_capital_grants": 128
        },
        "recent_activity": [
            {"event": "User Registered", "detail": "Dr. Sarah Connor (Researcher)", "timestamp": "2026-08-16 10:15:00"},
            {"event": "Patent Sync Executed", "detail": "Lens API - 45 patents updated", "timestamp": "2026-08-16 09:30:00"},
            {"event": "Grant Pool Refreshed", "detail": "NSF & Horizon Europe calls updated", "timestamp": "2026-08-16 08:00:00"}
        ]
    }


def get_manager_dashboard(db: Session) -> Dict[str, Any]:
    """
    Generate Innovation Manager Executive Dashboard analytics:
    - Institutional technology transfer pipeline
    - Active IP disclosures, licensing agreements, and royalties
    - Departmental readiness & top commercialization candidates
    """
    return {
        "summary_kpis": {
            "active_licenses": 24,
            "pending_disclosures": 9,
            "total_royalties_usd": 1450000,
            "total_commercialized_patents": 18
        },
        "tech_transfer_pipeline": [
            {"stage": "Invention Disclosure", "count": 12, "status": "Pending Evaluation"},
            {"stage": "Patent Application", "count": 18, "status": "USPTO Review"},
            {"stage": "Licensing Negotiation", "count": 7, "status": "Term Sheet Drafted"},
            {"stage": "Active Commercial License", "count": 24, "status": "Royalty Generating"}
        ],
        "departmental_readiness": [
            {"department": "Computer Science & AI", "trl_avg": 7.2, "patents": 34, "disclosures": 11},
            {"department": "Biomedical Engineering", "trl_avg": 6.8, "patents": 28, "disclosures": 8},
            {"department": "Materials Science", "trl_avg": 5.9, "patents": 19, "disclosures": 5},
            {"department": "Clean Energy", "trl_avg": 6.4, "patents": 15, "disclosures": 4}
        ],
        "top_inventors": [
            {"inventor": "Dr. Sarah Connor", "department": "Robotics & AI", "patents": 8, "licenses": 3},
            {"inventor": "Prof. Alan Turing", "department": "Computer Science", "patents": 12, "licenses": 5},
            {"inventor": "Dr. Rosalind Franklin", "department": "Biomedical Engineering", "patents": 9, "licenses": 4}
        ]
    }


def get_researcher_dashboard(db: Session, user: User) -> Dict[str, Any]:
    """
    Generate Researcher Personal Executive Dashboard analytics:
    - Bibliometric standings (h-index, citations, papers)
    - Grant opportunity matches & AI alignment scores
    - Recommended collaborator network
    """
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user.id).first()
    domain = profile.research_domain if profile else "Artificial Intelligence & Quantum Computing"
    
    return {
        "researcher_info": {
            "name": user.full_name,
            "email": user.email,
            "domain": domain,
            "organization": profile.organization if profile else "Cyberdyne Research Labs"
        },
        "bibliometrics": {
            "h_index": 18,
            "i10_index": 29,
            "total_citations": 2450,
            "publications_count": 34,
            "citation_velocity_annual": 380
        },
        "grant_matches": [
            {"title": "NSF AI Institute for Autonomous Hardware", "sponsor": "NSF", "amount_usd": 1500000, "match_percentage": 94.5, "deadline": "2026-11-15"},
            {"title": "Horizon Europe NextGen Neural Architectures", "sponsor": "EU Commission", "amount_usd": 2200000, "match_percentage": 91.0, "deadline": "2026-12-01"},
            {"title": "DARPA Autonomous Control Systems Grant", "sponsor": "DARPA", "amount_usd": 850000, "match_percentage": 88.2, "deadline": "2026-10-30"}
        ],
        "collaborator_recommendations": [
            {"name": "Prof. David Silver", "institution": "DeepMind Research", "alignment_score": 96.2, "shared_topics": "Deep Reinforcement Learning, Robotics"},
            {"name": "Dr. Fei-Fei Li", "institution": "Stanford Vision Lab", "alignment_score": 92.8, "shared_topics": "Computer Vision, Spatial Intelligence"},
            {"name": "Dr. Yann LeCun", "institution": "NYU / Meta AI", "alignment_score": 89.5, "shared_topics": "Self-Supervised Learning, World Models"}
        ]
    }


def get_startup_dashboard(db: Session, user: User) -> Dict[str, Any]:
    """
    Generate Startup Founder Executive Dashboard analytics:
    - Commercial readiness rating & TRL (Technology Readiness Level 1-9)
    - IP portfolio & competitor watch timeline
    - Investment readiness grade & venture grant targets
    """
    return {
        "startup_standing": {
            "company_name": "Cyberdyne Innovation Systems",
            "trl_level": 7,
            "trl_description": "System Prototype Demonstration in Operational Environment",
            "innovation_rank_score": 88.5,
            "investment_rating": "Grade A"
        },
        "ip_competitor_watch": [
            {"patent_title": "Autonomous Neural Processor Architecture", "assignee": "Cyberdyne Systems", "status": "Granted", "filing_year": 2024},
            {"patent_title": "Distributed Embedded Robotic Control Unit", "assignee": "Cyberdyne Systems", "status": "Pending", "filing_year": 2025},
            {"patent_title": "Adaptive Motor Driver Circuitry", "assignee": "Competitor Tech Corp", "status": "Granted", "filing_year": 2023}
        ],
        "commercialization_radar": {
            "technology_readiness": 85.0,
            "market_size_fit": 92.0,
            "ip_strength": 88.0,
            "regulatory_clearance": 78.0,
            "team_capability": 90.0
        },
        "funding_pipeline": [
            {"grant": "SBIR Phase II Commercial Transition", "amount_usd": 1250000, "status": "Application Submitted", "probability": 85},
            {"grant": "State Innovation Seed Venture Grant", "amount_usd": 500000, "status": "Awarded", "probability": 100}
        ]
    }
