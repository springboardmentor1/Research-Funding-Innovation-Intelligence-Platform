# External API Integration Guide

This guide explains how to use the integrated external services in your Research Funding Platform.

## 📋 Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Semantic Scholar API](#semantic-scholar-api)
3. [Crossref API](#crossref-api)
4. [Lens Patent API](#lens-patent-api)
5. [Government Funding APIs](#government-funding-apis)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Usage Examples](#usage-examples)

## 🔧 Setup & Configuration

### 1. Environment Variables

Copy the `.env.example` file to `.env` and add your API keys:

```bash
cp backend/.env.example backend/.env
```

### 2. Required API Keys

| Service | API Key Required | How to Get |
|---------|-----------------|------------|
| **Semantic Scholar** | Optional (recommended) | [Request API Key](https://www.semanticscholar.org/product/api) |
| **Crossref** | Optional (email only) | No key needed, just email |
| **Lens.org** | Required | [Lens API Access](https://www.lens.org/) |
| **NSF API** | Optional | [NSF Developer Portal](https://www.nsf.gov/digital/developer) |
| **NIH RePORTER** | Optional | [NIH API Portal](https://api.reporter.nih.gov/) |
| **Grants.gov** | Optional | [Grants.gov API](https://www.grants.gov/api/common/search2) |

### 3. Minimum Configuration

At minimum, you need to configure the Lens API key for patent search:

```env
LENS_API_KEY=your-lens-api-key-here
```

Other services will work without API keys but with lower rate limits.

## 📚 Semantic Scholar API

### What it provides:
- Academic paper search and retrieval
- Author information and profiles
- Citation data and recommendations
- Publication metadata

### Key Features:
- **Paper Search**: Search millions of academic papers
- **Author Profiles**: Get detailed author information
- **Citation Analysis**: Track citations and references
- **Recommendations**: Get similar papers based on your research

### API Endpoints:

#### Search Papers
```http
GET /api/semantic-scholar/papers/search?query=machine+learning&limit=10
```

#### Get Paper Details
```http
GET /api/semantic-scholar/papers/{paper_id}
```

#### Search Authors
```http
GET /api/semantic-scholar/authors/search?query=Geoffrey+Hinton
```

#### Get Paper Recommendations
```http
GET /api/semantic-scholar/papers/{paper_id}/recommendations
```

### Usage Examples:

```python
# Search for papers
response = await search_papers(
    query="machine learning healthcare",
    limit=20,
    year="2020-2023",
    venue="Nature"
)

# Get paper details
paper = await get_paper_details(
    paper_id="649def34f8be52c8b66255af12e3e34d5c82e52d"
)

# Search for authors
authors = await search_authors(
    query="Andrew Ng",
    limit=10
)
```

## 🔗 Crossref API

### What it provides:
- DOI-based metadata retrieval
- Funder and grant information
- Journal and publisher data
- Citation and reference metadata

### Key Features:
- **DOI Lookup**: Get metadata by DOI
- **Funder Search**: Find funding organizations
- **Journal Information**: Get journal details
- **Member Search**: Find publisher information

### API Endpoints:

#### Search Works
```http
GET /api/crossref/works/search?query=artificial+intelligence&rows=20
```

#### Get Work by DOI
```http
GET /api/crossref/works/{doi}
```

#### Search Funders
```http
GET /api/crossref/funders?query=National+Science+Foundation
```

#### Get Funder Works
```http
GET /api/crossref/funders/{funder_id}/works
```

### Usage Examples:

```python
# Search for works
works = await search_works(
    query="quantum computing",
    rows=50,
    sort="published",
    order="desc"
)

# Get work by DOI
work = await get_work_by_doi("10.1038/s41586-021-03819-2")

# Search funders
funders = await get_funders(query="Bill & Melinda Gates Foundation")

# Get works by funder
funder_works = await get_works_by_funder(funder_id="501100000281")
```

## 🏛️ Lens Patent API

### What it provides:
- Comprehensive patent search
- Patent family information
- Assignee and inventor data
- Legal status and claims

### Key Features:
- **Patent Search**: Search millions of patents globally
- **Assignee Search**: Find patents by company/organization
- **Inventor Search**: Find patents by inventor name
- **Patent Families**: Get related patent family members

### API Endpoints:

#### Search Patents
```http
POST /api/patents/search?query=artificial+intelligence
```

#### Get Patent by ID
```http
POST /api/patents/search (with lens_id in query)
```

#### Search by Assignee
```http
POST /api/lens/patents/assignee?assignee=Google
```

#### Get Patent Family
```http
POST /api/lens/patents/family (with lens_id)
```

### Usage Examples:

```python
# Search patents
patents = await search_patents(
    query="machine learning AND healthcare",
    size=20,
    sort="date_published:desc"
)

# Get patent details
patent = await get_patent_by_id(lens_id="186-488-232-022-055")

# Search by assignee
google_patents = await search_patents_by_assignee(
    assignee="Google LLC",
    size=50
)

# Search by inventor
inventor_patents = await search_patents_by_inventor(
    inventor="John Smith",
    size=20
)
```

## 🏛️ Government Funding APIs

### What it provides:
- NSF (National Science Foundation) awards and projects
- NIH (National Institutes of Health) research projects
- Grants.gov funding opportunities
- Combined search across all government sources

### Key Features:
- **NSF Awards**: Search NSF funded projects and outcomes
- **NIH Projects**: Access NIH RePORTER database
- **Grants.gov**: Find open funding opportunities
- **Combined Search**: Search all government sources at once

### API Endpoints:

#### NSF Awards Search
```http
GET /api/gov-funding/nsf/awards?keyword=artificial+intelligence
```

#### Get NSF Award Details
```http
GET /api/gov-funding/nsf/awards/{award_id}
```

#### NIH Projects Search
```http
POST /api/gov-funding/nih/projects/search
```

#### Grants.gov Search
```http
POST /api/gov-funding/grants-gov/search
```

#### Combined Government Search
```http
GET /api/gov-funding/combined/search?keyword=research+funding
```

### Usage Examples:

```python
# Search NSF awards
nsf_awards = await search_nsf_awards(
    keyword="quantum computing",
    active_awards=True,
    rpp=25
)

# Get NSF award details
award = await get_nsf_award_details(award_id="2044848")

# Search NIH projects
nih_projects = await search_nih_projects(
    criteria={"text_search_terms": "machine learning"},
    limit=50
)

# Search Grants.gov
grants = await search_grants_gov(
    keyword="artificial intelligence",
    funding_category="ST",
    rows=10
)

# Combined search
all_funding = await get_combined_funding_opportunities(
    keyword="climate change research",
    limit=20
)
```

## 📡 API Endpoints Reference

### Publication & Research APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/publications/search` | GET | OpenAlex publication search |
| `/api/semantic-scholar/papers/search` | GET | Semantic Scholar paper search |
| `/api/semantic-scholar/papers/{id}` | GET | Get paper details |
| `/api/semantic-scholar/authors/search` | GET | Search authors |
| `/api/crossref/works/search` | GET | Crossref works search |
| `/api/crossref/works/{doi}` | GET | Get work by DOI |
| `/api/crossref/funders` | GET | Search funders |

### Patent APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patents/search` | GET | Lens patent search |
| `/api/lens/patents/assignee` | POST | Search by assignee |
| `/api/lens/patents/inventor` | POST | Search by inventor |
| `/api/lens/patents/family` | POST | Get patent family |

### Government Funding APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/gov-funding/nsf/awards` | GET | Search NSF awards |
| `/api/gov-funding/nsf/awards/{id}` | GET | Get NSF award details |
| `/api/gov-funding/nih/projects/search` | POST | Search NIH projects |
| `/api/gov-funding/grants-gov/search` | POST | Search Grants.gov |
| `/api/gov-funding/combined/search` | GET | Combined government search |

## 💡 Usage Examples

### Example 1: Research a Researcher's Work

```python
# 1. Search for author's papers
papers = await search_papers(
    query="Yann LeCun",
    limit=20
)

# 2. Get their patent portfolio
patents = await search_patents_by_inventor(
    inventor="Yann LeCun",
    size=20
)

# 3. Find funding opportunities
funding = await get_combined_funding_opportunities(
    keyword="deep learning",
    limit=10
)
```

### Example 2: Funding Opportunity Discovery

```python
# 1. Search for NSF awards in your field
nsf = await search_nsf_awards(
    keyword="machine learning healthcare",
    active_awards=True
)

# 2. Search for related NIH projects
nih = await search_nih_projects(
    criteria={"text_search_terms": "AI healthcare"}
)

# 3. Find open opportunities on Grants.gov
grants = await search_grants_gov(
    keyword="artificial intelligence",
    funding_category="ST"  # Science and Technology
)
```

### Example 3: Patent Landscape Analysis

```python
# 1. Search patents in a technology area
patents = await search_patents(
    query="blockchain AND healthcare",
    size=50,
    sort="date_published:desc"
)

# 2. Get patent family information
for patent in patents['data']:
    family = await get_patent_family(patent['lens_id'])
    # Analyze family members, jurisdictions, etc.

# 3. Search by major assignees
companies = ["Google", "IBM", "Microsoft"]
for company in companies:
    company_patents = await search_patents_by_assignee(
        assignee=company,
        size=20
    )
```

### Example 4: Publication Impact Analysis

```python
# 1. Get paper details with citations
paper = await get_paper_details(
    paper_id="paper_id_here",
    fields="paperId,title,citationCount,references,citations"
)

# 2. Get recommendations for similar papers
recommendations = await get_paper_recommendations(
    paper_id="paper_id_here",
    limit=10
)

# 3. Cross-reference with Crossref
crossref_paper = await get_work_by_doi("10.1038/s41586-021-03819-2")
```

## 🔐 Authentication & Rate Limits

### Rate Limits by Service:

| Service | Without API Key | With API Key |
|---------|----------------|--------------|
| **Semantic Scholar** | 1000 req/sec (shared) | 1+ req/sec (custom) |
| **Crossref** | 5 req/sec, 1 concurrent | 10 req/sec, 3 concurrent |
| **Lens.org** | Not available | Custom limits |
| **NSF API** | Standard limits | Higher limits |
| **NIH RePORTER** | Standard limits | Higher limits |
| **Grants.gov** | Standard limits | Higher limits |

### Best Practices:

1. **Always use API keys** when available for better rate limits
2. **Implement caching** to reduce API calls
3. **Handle rate limiting** gracefully with exponential backoff
4. **Monitor usage** to stay within limits
5. **Use specific queries** rather than broad searches

## 🐛 Troubleshooting

### Common Issues:

1. **Lens API Key Missing**
   - Error: `LENS_API_KEY environment variable is required`
   - Solution: Add your Lens API key to `.env` file

2. **Rate Limit Exceeded**
   - Error: HTTP 429 responses
   - Solution: Implement exponential backoff, get API key for higher limits

3. **Empty Results**
   - Check your query syntax
   - Try broader search terms
   - Verify API service is operational

4. **Authentication Errors**
   - Verify API keys are correct
   - Check if API key is expired
   - Ensure API key has required permissions

## 📚 Additional Resources

- [Semantic Scholar API Docs](https://www.semanticscholar.org/product/api)
- [Crossref API Docs](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)
- [Lens API Docs](https://docs.api.lens.org/)
- [NSF API Docs](https://www.nsf.gov/digital/developer)
- [NIH RePORTER API](https://api.reporter.nih.gov/)
- [Grants.gov API](https://www.grants.gov/api/common/search2)

## 🚀 Next Steps

1. **Configure your API keys** in the `.env` file
2. **Test the endpoints** using the provided examples
3. **Integrate with your frontend** to display the data
4. **Implement caching** for better performance
5. **Add error handling** for production use
6. **Monitor API usage** to stay within limits