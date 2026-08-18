# End-to-End Workflow Guide

## Research Funding & Innovation Intelligence Platform

This document describes the complete end-to-end workflow for the platform demonstration.
Follow this exact sequence for your final presentation or evaluator demo.

---

## Complete Workflow

```
Register -> Login -> Create Profile -> Enter Research Interest
    -> Search Research Papers -> Get Funding Recommendations
    -> View Research Trends -> View Patent Intelligence
    -> View Technology Trends -> View Innovation Score
    -> Get Commercialization Recommendation
    -> Open Executive Dashboard -> Generate Report
    -> Download PDF / Excel
```

---

## Step-by-Step Guide

### Step 1: Register a New User

**Page**: `/register`

1. Navigate to the Registration page
2. Fill in:
   - **Username**: `researcher_demo`
   - **Email**: `demo@university.edu`
   - **Password**: `Demo@123`
3. Click **Register**
4. Expected: Success message, redirect to Login

**API**: `POST /auth/register`

---

### Step 2: Login

**Page**: `/login`

1. Enter the credentials created in Step 1
2. Click **Login**
3. Expected: JWT token stored, redirect to Dashboard

**API**: `POST /auth/login`

---

### Step 3: Create Research Profile

**Page**: `/profile`

1. Navigate to **My Profile** in the sidebar
2. Fill in:
   - **Name**: `Dr. Demo Researcher`
   - **University**: `Indian Institute of Technology`
   - **Department**: `Computer Science`
   - **Research Interests**: `Artificial Intelligence, Machine Learning, Deep Learning`
   - **Keywords**: `AI, ML, NLP, Computer Vision`
   - **Research Area**: `Artificial Intelligence`
3. Click **Save Profile**
4. Expected: Profile created successfully

**API**: `POST /profile/`

---

### Step 4: Search Research Papers

**Page**: `/research`

1. Navigate to **Research Papers** in the sidebar
2. Enter search topic: `Artificial Intelligence`
3. Click **Search**
4. Expected: Papers fetched from OpenAlex API with titles, authors, year, DOI

**API**: `GET /research/search?topic=Artificial Intelligence`

---

### Step 5: View Funding Opportunities

**Page**: `/funding`

1. Navigate to **Funding** in the sidebar
2. Browse all funding opportunities
3. Filter by area: `Artificial Intelligence`
4. Expected: Filtered list of grants with agency, amount, deadline

**API**: `GET /funding?area=Artificial Intelligence`

---

### Step 6: Get Funding Recommendations

**Page**: `/grant-recommendations`

1. Navigate to **Grant Recommendations** in the sidebar
2. System uses your profile's research area for matching
3. Expected: Personalized grant recommendations with match scores

**API**: `GET /recommendations?user_id=1`

---

### Step 7: View Publication Trends

**Page**: `/publication-trends`

1. Navigate to **Publication Trends** in the sidebar
2. View the line chart showing papers per year
3. View top research keywords
4. Expected: Trend visualization with year-over-year growth

**API**: `GET /analytics/publication-trends`

---

### Step 8: View Research Intelligence

**Page**: `/research-intelligence`

1. Navigate to **Research Intelligence** in the sidebar
2. View aggregated research metrics
3. Expected: Combined stats, keyword analysis, area distribution

**API**: `GET /analytics/dashboard`

---

### Step 9: View Funding Analytics

**Page**: `/funding-analytics`

1. Navigate to **Funding Analytics** in the sidebar
2. View:
   - Grants by Research Area (Pie Chart)
   - Funding Amount by Area (Bar Chart)
   - All Funding Opportunities table
3. Expected: Visual analytics with filtering

**API**: `GET /analytics/funding`

---

### Step 10: View Patent Analytics

**Page**: `/patent-analytics`

1. Navigate to **Patent Analytics** in the sidebar
2. View:
   - Patent Trends by Year (Line Chart)
   - Top Technologies (Bar Chart)
   - Top Assignees (Bar Chart)
   - Country Distribution (Pie Chart)
3. Expected: Comprehensive patent landscape

**API**: `GET /analytics/patents`

---

### Step 11: View Technology Intelligence

**Page**: `/technology-intelligence`

1. Navigate to **Technology Intelligence** in the sidebar
2. View:
   - Technology frequency ranking
   - Growth matrix
   - Emerging technologies with trend indicators
3. Expected: Rising/stable/declining trend detection

**API**: `GET /innovation/technology-intelligence`

---

### Step 12: View Innovation Scoring

**Page**: `/innovation-scoring`

1. Navigate to **Innovation Scoring** in the sidebar
2. View:
   - Score distribution chart
   - Top scored patents with breakdown:
     - Research Novelty (30%)
     - Patent Strength (20%)
     - Technology Maturity (15%)
     - Market Potential (20%)
     - Funding Relevance (15%)
   - Commercialization recommendations
3. Expected: Detailed scoring with radar charts

**API**: `GET /innovation/scores`

---

### Step 13: View Innovation Dashboard

**Page**: `/innovation-dashboard`

1. Navigate to **Innovation Dashboard** in the sidebar
2. View aggregated innovation metrics
3. Expected: Combined patent, technology, and scoring overview

**API**: `GET /innovation/dashboard`

---

### Step 14: Open Executive Dashboard

**Page**: `/executive-dashboard`

1. Navigate to **Executive Dashboard** in the sidebar
2. View 6 summary cards:
   - Total Research Papers
   - Funding Opportunities
   - Total Patents
   - Top Research Topic
   - Top Technology
   - Average Innovation Score
3. View charts:
   - Publication Trends (Line Chart)
   - Funding by Research Area (Bar Chart)
   - Patent Trends (Line Chart)
   - Emerging Technologies (Bar Chart)
4. View Innovation Score gauge and Top Patents table
5. View Commercialization distribution (Pie Chart)

**API**: `GET /dashboard/executive`

---

### Step 15: Generate and Download Reports

**Page**: `/reports`

1. Navigate to **Reports & Export** in the sidebar
2. Download each report type:
   - **Funding Report** -> PDF + Excel
   - **Research Trend Report** -> PDF + Excel
   - **Patent Report** -> PDF + Excel
   - **Innovation Report** -> PDF only
   - **Commercialization Report** -> PDF only
3. Open each downloaded file to verify content

**APIs**:
- `GET /reports/funding/pdf` | `/reports/funding/excel`
- `GET /reports/research/pdf` | `/reports/research/excel`
- `GET /reports/patent/pdf` | `/reports/patent/excel`
- `GET /reports/innovation/pdf`
- `GET /reports/commercialization/pdf`

---

## API Status Codes Reference

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (wrong credentials) |
| 404 | Not Found |
| 422 | Unprocessable Entity (missing fields) |
| 500 | Server Error |

---

## Performance Metrics

Record actual measurements during your demo:

| Metric | Expected | Actual |
|--------|----------|--------|
| Health Endpoint | < 100ms | _measure_ |
| Login API | < 500ms | _measure_ |
| Funding Search | < 2s | _measure_ |
| Patent Search | < 2s | _measure_ |
| Publication Trends | < 2s | _measure_ |
| Executive Dashboard | < 10s | _measure_ |
| Innovation Scores | < 5s | _measure_ |
| PDF Generation | < 5s | _measure_ |
| Excel Generation | < 3s | _measure_ |

---

## Swagger API Testing

For comprehensive API testing, use the Swagger UI:

1. Open http://localhost:8000/docs
2. Test each endpoint group:
   - **Authentication**: Register, Login, Logout
   - **Profile**: Create, Read, Update
   - **Research**: Search papers
   - **Funding**: Search/filter funding
   - **Patents**: Search/filter patents
   - **Dashboard**: User dashboard, Executive dashboard
   - **Recommendations**: Get personalized recommendations
   - **Analytics**: All analytics endpoints
   - **Innovation**: Scores, landscape, trends, technology
   - **Reports**: All PDF and Excel exports
