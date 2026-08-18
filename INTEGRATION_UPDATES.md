# API Integration Updates

## Summary of Changes

This document summarizes the updates made to ensure OpenAlex publications functionality and external funding API integration are working correctly.

## OpenAlex Publications Integration

### Status: ✅ WORKING

The OpenAlex publications integration is fully functional:

- **Backend Service**: `backend/app/services/openalex_service.py`
  - Implements `search_publications()` function that queries OpenAlex API
  - Processes and formats publication data including authors, concepts, and metadata
  - Returns structured results with citation counts, open access info, etc.

- **Backend Router**: `backend/app/routers/publications.py`
  - `/api/publications/search` endpoint for searching publications
  - `/api/publications/import` endpoint for importing publications to local database
  - Properly integrated with authentication and database

- **Frontend Service**: `frontend/src/services/publicationService.js`
  - `searchPublications()` function calls the backend API
  - `importPublication()` function for saving publications

- **Frontend Component**: `frontend/src/pages/Publications/Publications.jsx`
  - Search interface with OpenAlex integration
  - Import functionality for saving publications
  - Display of publication details, authors, and concepts

### Test Results:
- Status: 200 OK
- Successfully retrieves publications (tested with "machine learning" query)
- Found 5,811,473 publications in OpenAlex database
- Sample result: "Scikit-learn: Machine Learning in Python"

## External Funding API Integration

### Status: ✅ WORKING

The external funding API integration now uses government APIs (NSF, NIH, Grants.gov):

### Changes Made:

1. **Backend Service Updates** (`backend/app/services/gov_funding_service.py`):
   - Fixed NSF API URL from `http://` to `https://` to resolve redirect issues
   - Added `follow_redirects=True` to all httpx client calls
   - Implements three funding sources:
     - NSF Awards API
     - NIH RePORTER API  
     - Grants.gov API
   - Combined search function `get_combined_funding_opportunities()`

2. **Backend Router Updates** (`backend/app/routers/funding.py`):
   - Added import for `get_combined_funding_opportunities`
   - Modified `get_all_funding()` endpoint to support external API calls
   - Added `use_external_api` parameter to switch between local DB and external APIs
   - When `use_external_api=True`, calls combined government funding APIs
   - When `use_external_api=False`, uses local database (default)

3. **Frontend Service Updates** (`frontend/src/services/fundingService.js`):
   - Added `useExternalApi` parameter to `getAllFunding()` function
   - Passes the parameter to backend API call

4. **Frontend Component Updates** (`frontend/src/pages/Funding/Funding.jsx`):
   - Added `useExternalApi` state variable
   - Added toggle switch to enable/disable external API usage
   - Visual indicator when external API is active
   - Passes external API preference to search function

### Test Results:
- Status: 200 OK
- Successfully retrieves results from all three sources:
  - NSF results: ✅ True
  - NIH results: ✅ True
  - Grants.gov results: ✅ True
- Total count: 50 combined results
- No errors after fixing HTTPS redirect issue

## Government Funding API Endpoints

The following endpoints are available in `backend/app/routers/gov_funding.py`:

1. **NSF Awards**:
   - `GET /api/gov-funding/nsf/awards` - Search NSF awards
   - `GET /api/gov-funding/nsf/awards/{award_id}` - Get specific award details
   - `GET /api/gov-funding/nsf/awards/{award_id}/outcomes` - Get project outcomes

2. **NIH Projects**:
   - `POST /api/gov-funding/nih/projects/search` - Search NIH projects

3. **Grants.gov**:
   - `POST /api/gov-funding/grants-gov/search` - Search Grants.gov opportunities

4. **Combined Search**:
   - `GET /api/gov-funding/combined/search` - Search all sources simultaneously

## Usage Instructions

### For Publications:
1. Navigate to Publications page
2. Enter search term (e.g., "machine learning")
3. View results from OpenAlex
4. Click "Import" to save publications to local database

### For Funding:
1. Navigate to Funding page
2. Toggle "Use External Government APIs" switch to enable external search
3. Enter search term (e.g., "cancer research")
4. View combined results from NSF, NIH, and Grants.gov
5. Toggle off to use local database only

## Technical Details

### OpenAlex API:
- Base URL: `https://api.openalex.org/works`
- Max results per page: 200
- Returns: Publication metadata, authors, concepts, citation counts, open access info

### Government APIs:
- NSF: `https://api.nsf.gov/services/v1/awards.json`
- NIH: `https://api.reporter.nih.gov/v2/projects/search`
- Grants.gov: `https://api.grants.gov/v1/api/search2`

### Error Handling:
- External API calls include try-catch blocks
- Errors are logged and returned in response
- Combined search continues even if individual APIs fail
- Local database fallback always available

## Files Modified

1. `backend/app/services/gov_funding_service.py` - Fixed HTTPS URLs and redirect handling
2. `backend/app/routers/funding.py` - Added external API integration
3. `frontend/src/services/fundingService.js` - Added external API parameter
4. `frontend/src/pages/Funding/Funding.jsx` - Added UI toggle for external API

## Testing

Integration tests can be run using:
```bash
cd backend
python test_apis_integration.py
```

This tests:
- OpenAlex publications search
- External funding API search
- Local database funding search

All tests currently passing ✅
