# Project Scope: Research Funding & Innovation Intelligence Platform (Milestone 1)

## Overview
This platform is an AI-powered system designed to connect researchers, startup founders, and innovation managers with funding opportunities, patent trends, and commercialization recommendations.

This document outlines the scope of **Milestone 1**, which focuses on the foundational architecture, user management, and core research profile workflows. 

## Core Innovation Intelligence Workflow
The platform operates on a multi-stage workflow:
1. **Researcher Onboarding:** A user registers and builds a rich **Research Profile** (keywords, past publications, patents, tech domains).
2. **Data Ingestion (Background):** The system continuously ingests data from sources like OpenAlex (publications) and USPTO (patents).
3. **Profile Matching (Milestone 2+):** The AI engine links a user's profile to relevant trends and recommends funding opportunities.
4. **Trend/Patent Insight (Milestone 2+):** Users view analytics on the commercial viability and clustering of their research topics.
5. **Commercialization Recommendation (Milestone 3+):** Innovation managers receive actionable intelligence on technologies ripe for startup spin-offs.

## User Roles & Capabilities
The system implements Role-Based Access Control (RBAC) with four distinct roles:

1. **Researcher:**
   - Creates and manages their Research Profile.
   - Links their profile to publications and patents.
   - *(Future)* Views matched funding opportunities and trend insights for their domains.

2. **Startup Founder:**
   - Similar core profile to Researcher, but focused on technology commercialization.
   - *(Future)* Searches for co-founders (researchers) or analyzes competitive patent landscapes.

3. **Innovation Manager (TTO/University):**
   - Manages multiple researchers within their organization.
   - *(Future)* Views aggregated metrics on innovation output and funding success.
   - *(Future)* Receives commercialization recommendations for the organization's portfolio.

4. **Administrator:**
   - System-wide access.
   - Manages users, roles, and system configurations.
   - Monitors data ingestion jobs (OpenAlex, USPTO).

## Explicitly Out of Scope for Milestone 1
The following features are **NOT** included in the initial milestone and are reserved for later phases (Milestones 2 & 3):
- **Funding Recommendation Engine:** No AI-based matching of profiles to grants.
- **Patent & Trend Analysis:** No clustering of topics, sentiment analysis, or trend graphs.
- **Innovation Scoring Engine:** No calculation of commercial viability scores.
- **Advanced Search & Ranking:** Search is limited to basic retrieval, without relevance ranking or semantic search.
- **Complex UI Polish:** The UI will focus on structural wireframes and basic forms, not final visual design.
