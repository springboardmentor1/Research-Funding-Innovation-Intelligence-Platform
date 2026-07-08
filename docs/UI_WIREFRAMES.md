# UI Wireframes & Workflow

This document outlines the low-fidelity structural design and workflow for the core user interfaces in Milestone 1. The focus is on navigation and data entry, not visual polish.

## 1. Authentication & Onboarding

### 1.1 Login / Register View
- **Layout:** Centered card on a clean background.
- **Components:**
  - Logo / Platform Name.
  - Tab toggle: "Sign In" / "Create Account".
  - **Sign In Tab:**
    - Email Input.
    - Password Input.
    - "Sign In" Button.
    - Divider: "or continue with".
    - "Sign In with Google" Button (OAuth2).
  - **Create Account Tab:**
    - Full Name Input.
    - Email Input.
    - Password Input.
    - Role Selector Dropdown (Researcher, Startup Founder, Innovation Manager).
    - "Create Account" Button.

## 2. Role-Based Dashboard Shell

### 2.1 Global Layout
- **Top Navigation Bar:**
  - Left: Platform Logo/Home Link.
  - Right: User Profile Dropdown (Edit Profile, Sign Out).
- **Sidebar Navigation:** Context-aware based on the user's role.
- **Main Content Area:** Renders the active view.

### 2.2 Role-Specific Sidebars (Milestone 1 stubs)
- **Researcher:**
  - My Profile (Active)
  - *My Publications (Coming Soon)*
  - *Funding Matches (Coming Soon)*
- **Startup Founder:**
  - Company Profile (Active)
  - *Technology Landscape (Coming Soon)*
- **Innovation Manager:**
  - Organization Overview (Active)
  - *Researcher Roster (Coming Soon)*
- **Administrator:**
  - User Management (Active)
  - *System Settings (Coming Soon)*

## 3. Research Profile Editor (Core View for Milestone 1)

**Path:** `/profile/edit` (Accessed via Top Nav -> Edit Profile or Sidebar -> My Profile)

- **Layout:** Standard two-column or wide single-column form.
- **Sections:**
  - **Basic Information:**
    - Full Name (Read-only, inherited from User record).
    - Organization/University Affiliation (Text input).
  - **Research Focus:**
    - Primary Research Domains (Multi-select dropdown or tag input, e.g., "Machine Learning", "Bioinformatics").
    - Technology Areas (Tag input).
    - Specific Keywords (Tag input, allowing users to enter custom terms).
  - **Linked Assets (Read-Only List for now):**
    - Publications Linked (Count or simple list, populated from MongoDB search).
    - Patents Linked (Count or simple list).
  - **Actions:**
    - "Save Profile" Button (Submits `PUT /api/profiles/me`).
    - "Cancel" Button.

## 4. Basic Data Search View (Utility)

**Path:** `/search` (Temporary view to demonstrate data ingestion)

- **Layout:** Standard search interface.
- **Components:**
  - Search Input Box.
  - Filters: "Publications" vs "Patents" (Radio buttons).
  - "Search" Button.
  - **Results List:**
    - Card-based layout displaying Title, Date, and Abstract snippet.
    - Data pulled from MongoDB collections via backend API.
