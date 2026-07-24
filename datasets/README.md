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
│   ├── patents/
│   │      patents_raw.csv
│   └── funding/
│          funding_raw.csv
│
├── processed/
│   ├── publications/
│   │      publications_processed.csv
│   ├── patents/
│   │      patents_processed.csv
│   └── funding/
│          funding_processed.csv
│
├── scripts/
│   ├── fetch_publications.py
│   ├── preprocess_publications.py
│   ├── fetch_patents.py
│   ├── preprocess_patents.py
│   ├── fetch_funding.py
│   └── preprocess_funding.py
│
└── README.md
```

### Subdirectories Overview

- **[raw/](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/datasets/raw)**: Contains the initial fetched datasets directly exported from public APIs or generated as a fallback in CSV format.
- **[processed/](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/datasets/processed)**: Contains the preprocessed, cleaned, and validated datasets with handled null values, normalized schemas, and deduped rows.
- **[scripts/](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/datasets/scripts)**: Data fetching, generation, preprocessing, and validation scripts.

---

## Dataset Pipelines

### 1. Scientific Publications Pipeline
`OpenAlex API → Raw Dataset (CSV) → Preprocessing → Processed Dataset (CSV)`
Fetches academic literature and processes citations, years, authorships, and abstracts.

### 2. Patents Pipeline
`Patent API (The Lens) → Raw Dataset (CSV) → Preprocessing → Processed Dataset (CSV)`
Queries patent databases (with fallback import and mock capability) and processes dates, classifications, assignees, inventors, and status codes.

### 3. Funding Opportunities Pipeline
`Live API / Fallback Generation → Raw Dataset (CSV) → Preprocessing & Validation → Processed Dataset (CSV)`
Implemented a flexible funding data ingestion pipeline supporting live API retrieval, external dataset import, local dataset reuse, and synthetic dataset generation as a development fallback. It normalizes schemas, standardizes funding amounts and dates, and validates data integrity constraints.

---

## Intended Uses of Offline Datasets

The processed publication, patent, and funding datasets will support:
- **Funding Recommendation Engine**: Match opportunities to researcher profiles based on domains, keywords, and eligibility.
- **Grant Matching**: Identify suitable grants based on experience levels and geographic location.
- **Research Intelligence**: Track and analyze funding distributions across multiple scientific and technological domains.
- **AI Recommendation Models**: Train and evaluate ranking and retrieval algorithms for personalized recommendation cards.
- **Funding Analytics**: Visualize funding trends, sponsor involvement, and grant value distributions.
- **AI/ML model training**: Fine-tuning classifiers, named entity recognizers, and topic models.
- **Recommendation engine development**: Building cross-domain recommendation engines matching funding to innovations.
- **Research trend analysis**: Discovering emerging concepts and mapping technological evolution.
- **Patent analytics**: Performing landscape analysis and identifying white spaces.
- **Innovation intelligence modules**: Visualizing funding-to-patent correlations and institutional outputs.
- **Technology commercialization analysis**: Assessing technology readiness levels (TRL) and institutional collaboration hubs.
