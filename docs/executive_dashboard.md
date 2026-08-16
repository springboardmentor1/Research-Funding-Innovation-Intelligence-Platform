# Executive Dashboards Documentation (Milestone 4 — Step 1)

## Overview
The Executive Dashboard module provides specialized, role-tailored intelligence endpoints designed for key platform personas:
- **Administrator**: Operational health, user role distributions, system latencies, content inventories.
- **Innovation Manager**: University/Institutional Tech Transfer Office (TTO) metrics, disclosure queue, royalty tracking, invention pipeline stages.
- **Researcher**: Personal research standings, h-index & citation velocity, top AI-matched grant calls, and recommended collaborator networks.
- **Startup Founder**: Commercial readiness radar, Technology Readiness Level (TRL 1-9), patent portfolio timeline, competitor watch, venture grant applications.

---

## Security & RBAC Policies
All executive dashboard endpoints require JWT Bearer token authentication in HTTP Authorization headers (`Authorization: Bearer <JWT_TOKEN>`).

| Endpoint | Allowed Roles | Summary |
| :--- | :--- | :--- |
| `GET /executive/admin` | `Administrator` | Platform operational health, server latency, registered user counts |
| `GET /executive/manager` | `Innovation Manager`, `Administrator` | TTO pipeline, active licensing, royalty revenues, disclosure queue |
| `GET /executive/researcher` | `Researcher`, `Administrator` | Bibliometric standings, grant match % scores, recommended collaborators |
| `GET /executive/startup` | `Startup Founder`, `Administrator` | TRL gauge, commercialization radar, patent competitor watch |

---

## Response Payload Schemas

### 1. Administrator Dashboard (`GET /executive/admin`)
```json
{
  "system_health": {
    "status": "OPERATIONAL",
    "db_status": "CONNECTED",
    "api_latency_ms": 42,
    "uptime_percent": 99.98,
    "last_sync_timestamp": "2026-08-16 10:15:00"
  },
  "user_analytics": {
    "total_registered_users": 240,
    "role_distribution": {
      "Researcher": 140,
      "Startup Founder": 55,
      "Innovation Manager": 35,
      "Administrator": 10
    },
    "total_active_profiles": 195
  },
  "content_inventory": {
    "total_publications_synced": 520,
    "total_patents_synced": 310,
    "total_capital_grants": 128
  }
}
```

### 2. Innovation Manager Dashboard (`GET /executive/manager`)
```json
{
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
  ]
}
```

### 3. Researcher Dashboard (`GET /executive/researcher`)
```json
{
  "bibliometrics": {
    "h_index": 18,
    "i10_index": 29,
    "total_citations": 2450,
    "publications_count": 34,
    "citation_velocity_annual": 380
  },
  "grant_matches": [
    {
      "title": "NSF AI Institute for Autonomous Hardware",
      "sponsor": "NSF",
      "amount_usd": 1500000,
      "match_percentage": 94.5,
      "deadline": "2026-11-15"
    }
  ]
}
```

### 4. Startup Founder Dashboard (`GET /executive/startup`)
```json
{
  "startup_standing": {
    "company_name": "Cyberdyne Innovation Systems",
    "trl_level": 7,
    "innovation_rank_score": 88.5,
    "investment_rating": "Grade A"
  },
  "commercialization_radar": {
    "technology_readiness": 85.0,
    "market_size_fit": 92.0,
    "ip_strength": 88.0,
    "regulatory_clearance": 78.0,
    "team_capability": 90.0
  }
}
```

---

## Verification
Run backend verification script:
```bash
python backend/verify_executive_dashboard.py
```
