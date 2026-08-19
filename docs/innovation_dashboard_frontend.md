# Innovation Analytics Dashboard Frontend Documentation (Step 5B)

## Overview
The **Innovation Analytics Dashboard Frontend** is an executive-level single-page dashboard built with React 19, Vite, Tailwind CSS v4, Axios, and Recharts. It consumes the `GET /innovation/dashboard` REST API endpoint and renders role-tailored intelligence across Technology Maturity, Patent Landscape, Innovation Scores, Commercialization Pathways, and System Health Metadata.

---

## Component Architecture & Hierarchy

```text
InnovationDashboard.jsx (Container Page & State Manager)
 ├── ExecutiveSummary.jsx (11 KPI Metric Cards Grid)
 ├── DashboardMetadata.jsx (Version, Status Badge, Modules Loaded, Timestamp)
 ├── PatentLandscapeSection.jsx (Recharts Domain & Cluster Visualizations)
 ├── TechnologyIntelligenceSection.jsx (Lifecycle Stages & Momentum Leaderboard)
 ├── InnovationScoringSection.jsx (Classifications & Readiness Distributions)
 └── CommercializationSection.jsx (Pathway Strategies & Investment Priorities)
```

---

## Role-Aware Rendering Rules (RBAC)

The dashboard component inspects the top-level keys returned by the backend (which filters data based on the authenticated user's role) and dynamically renders only authorized sections:

| User Role | Rendered Sections |
| :--- | :--- |
| **Researcher** | `ExecutiveSummary`, `DashboardMetadata`, `TechnologyIntelligenceSection`, `InnovationScoringSection` |
| **Startup Founder** | `ExecutiveSummary`, `DashboardMetadata`, `PatentLandscapeSection`, `CommercializationSection`, `InnovationScoringSection` |
| **Innovation Manager** | Complete Dashboard (All 6 Components) |
| **Administrator** | Complete Dashboard (All 6 Components) |

---

## Dashboard Health Metadata Component

`DashboardMetadata.jsx` renders a status bar below the KPI cards displaying real-time analytics health:
- **Version**: System release version (e.g. `v1.0`).
- **Analytics Status Badge**:
  - `Healthy`: Green badge (`bg-emerald-500/20 text-emerald-400`).
  - `Warning`: Yellow badge (`bg-amber-500/20 text-amber-400`).
  - `Unavailable`: Red badge (`bg-red-500/20 text-red-400`).
- **Modules Loaded**: Active domain modules count (`4 / 4`).
- **Last Generated Timestamp**: Formatted ISO datetime string.

---

## API Service Integration (`innovationDashboardService.js`)

- **Base URL**: Configured dynamically via `import.meta.env.VITE_API_BASE_URL` or defaults to `http://localhost:8000`.
- **JWT Header Interceptor**: Automatically attaches `Authorization: Bearer <access_token>` retrieved from `localStorage`.
- **Session Expiration Handler**: Intercepts `401 Unauthorized` API responses, clears local token storage, and redirects unauthenticated users to `/login`.

---

## Automated Vitest Verification Suite

The frontend test suite (`frontend/src/tests/innovation_dashboard.test.js`) executes 9 test assertions:
1. `[OK] Dashboard Loaded` (State transition from spinner to loaded DOM)
2. `[OK] KPI Cards Rendered` (11 metric cards rendered)
3. `[OK] Dashboard Metadata Rendered` (Version, status badge, modules count)
4. `[OK] Patent Charts Rendered` (Patent landscape charts visible)
5. `[OK] Technology Charts Rendered` (Technology intelligence charts visible)
6. `[OK] Innovation Charts Rendered` (Innovation scoring charts visible)
7. `[OK] Commercialization Charts Rendered` (Commercialization recommendations charts visible)
8. `[OK] Role Rendering Valid` (Researcher role hides unauthorized sections)
9. `[OK] JWT Handling Valid` (401 error handling banner rendered)

---

## Future Extensions
1. **Interactive Filter Toolbar**: Date range sliders, domain multi-select dropdowns, and dynamic keyword search filters.
2. **PDF/CSV Executive Export**: Single-click export of dashboard metrics to PDF reports and CSV summary sheets.
3. **AI Chat Assistant Widget**: Embedded LLM assistant answering questions directly against the loaded dashboard metrics.
