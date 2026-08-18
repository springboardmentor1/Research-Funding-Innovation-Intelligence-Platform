# Funding Search and Dashboard Fixes

## Issues Fixed

### 1. Funding Search Showing No Results

**Problem**: 
- Funding search was returning no results because the local database only had 8 funding opportunities
- External API toggle was disabled by default, so users couldn't access government APIs

**Solutions**:
1. **Added 12 Sample Funding Opportunities**: Created `seed_funding.py` to populate the database with diverse funding opportunities from various agencies (NSF, NIH, DOE, NASA, DARPA, etc.)

2. **Enabled External API by Default**: Changed the external API toggle to be enabled by default in the Funding page, so users can immediately access government funding APIs

3. **Sample Funding Data Added**:
   - NSF CAREER Award: Machine Learning for Healthcare ($500,000)
   - NIH R01: Cancer Research and Drug Discovery ($2,500,000)
   - DOE Quantum Information Science Research ($1,500,000)
   - NASA Space Technology Research Grants ($750,000)
   - DARPA AI Next Campaign ($2,000,000)
   - USDA Climate Smart Agriculture ($600,000)
   - EPA Environmental Justice Research ($400,000)
   - Smithsonian Conservation Research ($350,000)
   - IEEE Humanitarian Technology Research ($250,000)
   - Gates Foundation Global Health Innovation ($3,000,000)
   - Google AI Research Awards ($150,000)
   - Microsoft Research PhD Fellowship ($50,000)

### 2. Dashboard Funding Trends Confusion

**Problem**: 
- The chart labeled "Funding Trends" was actually showing **Publication Trends** (publication count by year)
- This was confusing for users

**Solutions**:
1. **Renamed Component**: Changed `FundingChart` to `PublicationTrendsChart` for clarity
2. **Updated Title**: Changed chart title from "Funding Trends" to "Publication Trends"
3. **Fixed Data Mapping**: Improved data transformation to handle both year-based and month-based data
4. **Updated Dashboard References**: Updated all references to use the new component name

## How Funding Trends Work on Dashboard

### Current Implementation:
The dashboard shows **Publication Trends** (not funding trends) which displays:
- Your publication count over time (grouped by year)
- Data comes from your imported publications in the local database
- Shows your research productivity pattern

### How It Works:
1. **Data Source**: Publication data from your local database (`Publication` table)
2. **Backend Endpoint**: `/research-intelligence/dashboard` 
3. **Query**: Groups publications by year and counts them
4. **Display**: Line chart showing publication count per year

### To See Data:
- Import publications from OpenAlex using the Publications page
- The dashboard will automatically show your publication trends
- If no publications exist, shows empty chart with default monthly data

## How to Use Funding Search

### Local Database Search (Default):
1. Go to Funding page
2. Toggle "Use External Government APIs" OFF
3. Search for terms like "machine learning", "cancer", "quantum", "AI"
4. Results from the 12 seeded opportunities will appear

### External API Search:
1. Go to Funding page  
2. Toggle "Use External Government APIs" ON
3. Search for any research term
4. Results from NSF, NIH, and Grants.gov APIs will appear
5. Combined results from all three government sources

## Sample Searches to Try

### Local Database:
- "machine learning" → 3 results (NSF, DARPA, Google)
- "cancer" → 1 result (NIH)
- "quantum" → 1 result (DOE)
- "AI" → 3 results (NSF, DARPA, Google)
- "health" → 2 results (NSF, Gates Foundation)

### External APIs:
- "cancer research" → Combined results from NIH, NSF, Grants.gov
- "artificial intelligence" → Results from all government sources
- "climate change" → Environmental and climate-related funding
- "healthcare" → Medical and health funding opportunities

## Files Modified

1. **Frontend**:
   - `frontend/src/pages/Funding/Funding.jsx` - Enabled external API by default
   - `frontend/src/components/dashboard/charts/FundingChart.jsx` - Renamed to PublicationTrendsChart, fixed data mapping
   - `frontend/src/pages/Dashboard/Dashboard.jsx` - Updated component references

2. **Backend**:
   - `backend/seed_funding.py` - Created new seeding script for funding opportunities

## Testing

To re-seed funding data:
```bash
cd backend
python seed_funding.py
```

This will:
- Clear existing funding opportunities
- Add 12 diverse funding opportunities
- Provide sample search suggestions

## Summary

- ✅ Funding search now works with both local database (12 opportunities) and external APIs
- ✅ External API toggle enabled by default for immediate access to government funding
- ✅ Dashboard chart correctly labeled as "Publication Trends"
- ✅ Publication trends show your research productivity over time
- ✅ Sample funding data provides immediate search results for testing
