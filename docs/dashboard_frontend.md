# Research Intelligence Dashboard Frontend Documentation

This document describes the design, implementation, components, and data flows of the Research Intelligence Dashboard frontend interface (Phase 1).

---

## 1. Component Hierarchy

The Research Intelligence Dashboard is structured as follows:

```text
Dashboard (Main Container Page)
│
├── Header (Title, Sync Timestamp, Refresh Action)
│
├── SummaryGrid (KPI Metric Rows Container)
│   └── KpiCard [x6] (Publications, Patents, Grants, Domains, Sponsors, Countries)
│
├── PublicationCharts (Publications Area, Domains Horizontal Bar, Open Access Pie)
│
├── PatentCharts (Timeline Line, Top Assignees Horizontal Bar, Status Pie, Countries Bar)
│
└── FundingCharts (Stats Cards List, Top Sponsors Horizontal Bar, Expiry Bar, Types Pie)
```

---

## 2. API Integration

### Endpoint
*   **Method**: `GET`
*   **Path**: `/dashboard/analytics`
*   **Protection**: Requires JWT Bearer token in the `Authorization` header.

### Axios Service
The Axios integration is handled in [dashboardService.js](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/frontend/src/services/dashboardService.js):
*   Requests are sent to the base URL configured via environment variables (with a default fallback to `http://localhost:8000`).
*   An interceptor automatically pulls JWT access tokens from local storage (`access_token` / `token`) and appends them to request headers.
*   The service exports a single core function: `getDashboardAnalytics()`.

### Error Handling & Re-authentication
*   **Loading State**: Renders an animated double spin layout with a text indicator.
*   **Network/Server Errors**: Renders a dedicated card notifying the user of API downtime, complete with a manual **Retry Connection** option.
*   **401 Unauthenticated Session Expiration**: If a request encounters a `401 Unauthorized` status, local storage tokens are wiped, a warning message is rendered, and the user is redirected to `/login` after 2 seconds.

---

## 3. Responsive Layout Design

The dashboard layout is designed for multiple viewport screens:
*   **Sidebar/Headers**: Align vertically on mobile viewports and scale to horizontal flex layouts on tablets and desktops (`sm:flex-row`).
*   **Summary Grid**: Shifts columns dynamically depending on viewport:
    *   *Mobile (`<640px`)*: 1 column
    *   *Small/Tablet (`>=640px`)*: 2 columns
    *   *Medium/Large (`>=1024px`)*: 3 columns
    *   *Extra Large (`>=1280px`)*: 6 columns
*   **Charts Grid**:
    *   *Publication Charts Grid*: 1 column on mobile/tablet, 3 columns on large desktops.
    *   *Patent & Funding Charts Grid*: 1 column on mobile/tablet, 2 columns on large desktops.

---

## 4. Visualizations & Chart Descriptions

### Publications Section
*   **Publications Per Year**: An Area Chart showcasing research publication velocity from the year 2000 onwards, with custom linear gradients.
*   **Top Research Domains**: A horizontal Bar Chart showing the top 8 research fields sorted by publication count.
*   **Open Access Distribution**: A Pie Chart displaying the ratio between Open Access publications and Closed Access publications.

### Patents Section
*   **Patent Application Timeline**: A Line Chart tracking the yearly count of intellectual property filings.
*   **Top Assignee Organizations**: A horizontal Bar Chart of the top 5 patent holding institutions.
*   **Patent Status Distribution**: A Pie Chart mapping the percentages of Granted vs. Filed patents.
*   **Geographic Patent Distribution**: A vertical Bar Chart displaying counts across participating countries.

### Funding Section
*   **Valuation Metrics List**: Displays total valuation volume, average opportunity size, maximum grant limits, and minimum limits in a four-card configuration.
*   **Top Funding Agencies**: A horizontal Bar Chart of the top 5 capital sponsors.
*   **Opportunities By Expiration Year**: A vertical Bar Chart of upcoming deadlines.
*   **Funding Type Distribution**: A Pie Chart displaying the breakdown between Grants, Contracts, Awards, Fellowships, and Cooperative Agreements.

---

## 5. Future AI Recommendations Panel Layout

In future milestones, the AI Recommendation Engine will be integrated into the dashboard views.

### Proposed Visual Location
*   **Location**: Immediately below the Summary KPI Cards grid, and above the Publications Analytics section.
*   **Layout**: A 3-column recommendation grid mapping the recommendation targets:
    *   *Column 1: AI Grant Recommendations* (recommending open opportunities matching the researcher's interest profile).
    *   *Column 2: AI Collaborator Recommendations* (identifying research profile matches for co-authoring publications).
    *   *Column 3: AI Literature Discoveries* (surfacing recently synced papers in similar domains).
*   **Interactions**: Includes buttons for each recommendation card to **Accept**, **Reject**, or **Dismiss**, updating records via a future `/recommendations/{id}/status` API endpoint.
