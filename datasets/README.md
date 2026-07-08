# Datasets Directory

This directory is designed to organize scientific publications, patent files, and grant opportunity datasets for the Research Funding & Innovation Intelligence Platform.

## Data Sourcing Policy

- **Live Integrations**: The production platform primarily utilizes live REST API integrations to query academic publications (via **OpenAlex API**) and patent details (via **The Lens API**).
- **Reserved Scope**: The subdirectories in this folder are strictly reserved for:
  - Offline datasets and cached query results.
  - Data preprocessing scripts and transformations.
  - Unit/integration testing mock fixtures.
  - Future AI recommendation and analytics model training.
- **Lightweight Repository**: To keep this codebase lightweight, fast to clone, and easy to distribute, **no production-scale or large binary datasets are stored in this repository**.

---

## Folder Structure

- **[publications/](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/datasets/publications)**: Scientific literature and articles databases.
- **[patents/](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/datasets/patents)**: Patent documents, classifications, and registries.
- **[funding/](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/datasets/funding)**: Sponsoring agencies and opportunity lists.
