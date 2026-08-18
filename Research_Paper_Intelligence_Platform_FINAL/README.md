# ResearchIQ — Research Paper Intelligence Platform

ResearchIQ is a Flask-based research intelligence platform for discovering, filtering, analysing and saving research literature.

## Final features

- 300 indexed research-paper records
- 264 records from 2024, including an expanded AAAI 2024 conference-index collection
- Keyword search across title, authors, abstract, domain and venue
- Domain and publication-year filters
- Relevance/impact, newest-first and citation sorting
- 20-result pagination for a clean literature explorer
- Detailed paper pages with source/DOI/PDF metadata when available
- Citation and publication-trend analytics
- Research-domain distribution charts
- Related-paper recommendations using lightweight content similarity
- Secure password hashing with Werkzeug
- User registration, login and session-based access
- Personal saved-paper library with remove functionality
- JSON API endpoints for search and recommendations
- Health-check endpoint for quick deployment testing
- SQLite database automatically created and synchronized from the CSV corpus
- Responsive interface with Chart.js visualizations

## Project structure

```text
Research_Paper_Intelligence_Platform_FINAL/
├── app.py
├── requirements.txt
├── README.md
├── datasets/
│   ├── research_papers.csv
│   ├── researchers.csv
│   ├── venues.csv
│   ├── publication_years.csv
│   └── research_domains.csv
├── instance/
│   └── research_intelligence.db   # created automatically
├── static/
│   ├── css/style.css
│   └── js/app.js
└── templates/
    ├── base.html
    ├── index.html
    ├── login.html
    ├── register.html
    ├── dashboard.html
    ├── papers.html
    ├── paper.html
    ├── bookmarks.html
    └── 404.html
```

## Run locally

PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

Then open:

```text
http://127.0.0.1:5000
```

If PowerShell blocks activation, the application can still be run with the virtual-environment Python:

```powershell
.\.venv\Scripts\python.exe app.py
```

## Dataset

The final CSV contains exactly **300 unique paper records**.

The original corpus is retained, and 260 additional AAAI 2024 conference-index records were added from the public AAAI-2024-Papers index. The AAAI index provides paper titles and identifies the collection as AAAI 2024; the local records preserve that provenance and link back to the corresponding conference index pages.

The expanded corpus is intended for literature-discovery demonstrations. Some added conference-index records contain discovery metadata rather than full abstracts or author lists because those fields are not present in the source index page.

## Architecture

```text
Browser
   ↓
Flask routes (app.py)
   ↓
SQLite database
   ↓
Research-paper corpus
   ↓
Search / filters / analytics / recommendations
   ↓
HTML templates + Chart.js
```

## Project workflow

**Search → Filter → Rank → Read → Save → Analyse → Recommend**

## Security

Passwords are stored as Werkzeug password hashes rather than plain text. The Flask secret key can be supplied through the `RESEARCHIQ_SECRET_KEY` environment variable.

## Important API note

The application does not depend on Semantic Scholar at runtime. This keeps the demo reliable when an external API is rate-limited. A future live-ingestion layer can be connected separately.
