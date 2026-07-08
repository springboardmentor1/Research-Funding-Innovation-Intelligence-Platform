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

```text
datasets/
│
├── raw/
│   ├── publications/
│   │      publications_raw.csv
│   └── patents/
│          patents_raw.csv
│
├── processed/
│   ├── publications/
│   │      publications_processed.csv
│   └── patents/
│          patents_processed.csv
│
├── scripts/
│   ├── fetch_publications.py
│   ├── preprocess_publications.py
│   ├── fetch_patents.py
│   └── preprocess_patents.py
│
└── README.md
```

### Subdirectories Overview

- **[raw/](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/datasets/raw)**: Contains the initial fetched datasets directly exported from public APIs in CSV format.
- **[processed/](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/datasets/processed)**: Contains the preprocessed and cleaned datasets with handled null values, unified typologies, and deduped rows.
- **[scripts/](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/datasets/scripts)**: Data fetching and preprocessing scripts.
