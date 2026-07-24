# Technology Stack — Decisions and Rationale

**Project:** Research Funding & Innovation Intelligence Platform
**Milestone:** 1

This document records the technologies selected for the project and, where
relevant, the alternatives that were evaluated and rejected. Selection was
driven by three constraints: the platform must serve a data-heavy analytical
workload, must be deployable via containers, and must be maintainable by a
single developer.

---

## 1. Backend — Python 3.12 + FastAPI

**Selected.** FastAPI provides asynchronous request handling, automatic OpenAPI
documentation, and Pydantic-based request/response validation. Since the
platform's recommendation, trend-analysis, and scoring modules are written in
Python, keeping the API layer in the same language avoids a cross-language
service boundary.

Python 3.12 was pinned rather than 3.13 to guarantee compatibility with the
scientific stack.

## 2. Frontend — React 19 + Vite

**Selected.** The frontend is a single-page application that consumes the
FastAPI backend over HTTP. Vite provides fast development builds and a minimal
production bundle.

**Next.js was evaluated and rejected.** Next.js is valuable where server-side
rendering, file-based routing, and SEO matter. This platform is an
authenticated internal dashboard: pages are rendered only after login, are not
indexed by search engines, and derive all content from API calls. Next.js's
rendering machinery would add build complexity with no corresponding benefit.

## 3. Databases — PostgreSQL 18 and MongoDB

**PostgreSQL (primary).** Stores normalised relational entities — users, roles,
research profiles, funding opportunities, and innovation scores. These have a
stable schema and require referential integrity, transactions, and constraints.

**MongoDB (secondary).** Serves as a landing zone for raw external API payloads.
OpenAlex and patent records are deeply nested and their schemas change without
notice. Storing responses unmodified before transformation preserves the source
record and decouples data ingestion from relational schema migrations. Data is
transformed out of MongoDB and into PostgreSQL by scheduled jobs.

## 4. Data Analysis — pandas, NumPy, matplotlib, seaborn

**Selected** for exploratory data analysis and for the trend-analysis modules.

Dependencies are split into two files to keep the deployed image small:

| File | Contents | Installed in production |
|---|---|---|
| `backend/requirements.txt` | FastAPI, Uvicorn, SQLAlchemy, psycopg, PyMongo, Pydantic | Yes |
| `requirements-dev.txt` | The above, plus Jupyter, pandas, NumPy, matplotlib, seaborn | No |

Versions are pinned exactly. An unpinned dependency resolves to whatever
release exists at build time, which makes builds non-reproducible and produces
failures unrelated to the application code.

## 5. Version Control — Git / GitHub

Work is committed to a dedicated feature branch. Virtual environments,
`node_modules`, compiled bytecode, `.env`, and raw datasets are excluded from
version control. Exclusion rules were verified with `git check-ignore` rather
than assumed.

A committed `.env.example` documents every required environment variable
without exposing secrets.

---

## 6. Data Sources

### 6.1 Scholarly Publications — OpenAlex

**Selected.** OpenAlex exposes a public REST API with no authentication, cursor
pagination for deep result sets, and a polite-pool convention that raises rate
limits for identified clients. Each record carries citation counts, topics,
institutions, and funder metadata in a single response.

**CrossRef was evaluated and rejected.** CrossRef exposes DOI registration
metadata — publisher, dates, licences — but has weak citation and topic
coverage. OpenAlex already ingests CrossRef as an upstream source, so querying
both would duplicate work without adding fields.

**Semantic Scholar was evaluated and deferred.** Its rate limits without an API
key are restrictive, and key issuance requires an application with an
uncertain turnaround.

### 6.2 Patents — The Lens

**Selected.** The Lens provides bulk CSV export of patent bibliographic records
including title, abstract, applicants, inventors, filing and publication dates,
jurisdiction, CPC classification, forward citation counts, and family size.

**USPTO Open Data Portal was evaluated and rejected.** As of June 2026, ODP API
access requires a USPTO.gov account verified through ID.me. ID.me verification
requires a United States government-issued identity document and a Social
Security number. The service is therefore structurally unavailable to
developers outside the United States.

**PatentsView was evaluated and rejected.** PatentsView is being migrated into
the USPTO Open Data Portal, with service interruptions expected during the
transition and new API key issuance suspended. It inherits the ODP access
restriction described above.

**Google Patents via BigQuery was evaluated and deferred.** The BigQuery
sandbox requires no payment method and provides 1 TB of query processing per
month. However, BigQuery bills on bytes scanned per column, and the patents
table is very large. It is the correct tool for full-corpus analysis and is
recorded as the scaling path once query costs can be bounded.

---

## 7. Patent Sampling Methodology

Anonymous Lens exports are capped at 1,000 records per export. A single query
spanning 2015–2024 would therefore return 1,000 records concentrated in the
most recent years, and any resulting trend chart would be an artefact of the
export limit rather than a property of the data.

To avoid this, patents were extracted as a **stratified sample**: one query per
publication year, CPC class `G06N*` (computing arrangements based on specific
computational models — machine learning and neural networks), sorted by forward
citation count descending, capped at 1,000 records. The resulting corpus is
approximately 10,000 records.

**Consequence.** Sample counts are censored at 1,000 in every year. Year-over-
year *composition* — applicants, CPC subclasses, jurisdictions, citation
distribution — is directly comparable because the sampling rule is identical in
every stratum. Absolute filing volumes are not.

**Mitigation.** The unfiltered result count returned by each query was recorded
separately. These counts are uncensored and provide the true annual filing
volume:

| Year | Patent records | Simple families |
|---|---|---|
| 2015 | 7,515 | 4,346 |
| 2016 | 10,301 | 6,354 |
| 2017 | 17,906 | 12,160 |
| 2018 | 30,003 | 20,600 |
| 2019 | 54,723 | 38,318 |
| 2020 | 100,654 | 72,703 |
| 2021 | 148,572 | 109,928 |
| 2022 | 183,139 | 138,909 |
| 2023 | 192,738 | 149,092 |
| 2024 | 264,462 | 210,264 |

**Analysis window ends at 2024.** Patent applications publish approximately 18
months after filing, and indexing lags further. Including 2025–2026 would show
a sharp decline that reflects publication lag, not a decline in innovation.

---

## 8. Known Limitations

**Applicant name normalisation.** The same organisation appears under multiple
strings — `AMAZON TECH INC` in the Applicants field and `AMAZON TECHNOLOGIES
INC` in Owners. Applicant counts are therefore lower bounds. Entity resolution
is required before applicant-level conclusions are drawn.

**Multi-valued fields.** Applicants, inventors, and CPC classifications are
stored as `;;`-delimited strings within a single cell, and may contain repeated
values. These are split and de-duplicated before counting.

**Sample bias.** Sorting by citation count selects the most influential patents
in each year, not a random draw. Findings describe high-impact patenting
activity, not the full population.
