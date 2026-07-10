import logging
import httpx
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from .base import BaseCollector
from .storage import StorageCoordinator

logger = logging.getLogger("collector.grants")


class GrantsGovCollector(BaseCollector):
    """
    Collector for Grants.gov API.
    Fetches and registers federal funding opportunities.
    """

    def __init__(self, rate_limit_delay: float = 1.0):
        # Grants.gov endpoint
        super().__init__(
            name="grants",
            base_url="https://www.grants.gov",
            rate_limit_delay=rate_limit_delay
        )
        self.storage = StorageCoordinator()

    def fetch_opportunities(
        self, db: Session, keyword: str = "artificial intelligence", limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Queries Grants.gov search API for funding opportunities and saves them.
        """
        self.logger.info(f"Querying Grants.gov for keyword '{keyword}'...")
        
        # Grants.gov uses a REST endpoint for its web search tool
        endpoint = "grantsws/rest/opportunities/search"
        payload = {
            "startRecordNum": 0,
            "keyword": keyword,
            "oppStatuses": "Posted|Forecasted"
        }
        
        try:
            # Grants.gov search requires a POST request
            response = self.request("POST", endpoint, json_data=payload)
            data = response.json()
            hits = data.get("oppHits", [])
            
            # Limit results
            hits = hits[:limit]
            
            saved_grants = []
            for hit in hits:
                opp_id = hit.get("number") or hit.get("oppId")
                title = hit.get("oppTitle") or "Untitled Funding Opportunity"
                agency = hit.get("agencyName")
                
                # Close Date (sometimes MM/DD/YYYY or similar)
                close_date = hit.get("closeDate")
                
                # Opportunity category / funding types
                category = hit.get("fundingInstrumentTypes") or hit.get("categoryExplanation")
                if isinstance(category, list):
                    category = ", ".join(category)
                
                # Synopsis/Description
                description = hit.get("synopsisHeading") or hit.get("cfdaList", [{}])[0].get("programTitle")
                
                # Parse min/max funding amounts
                max_amount = self._parse_amount(hit.get("awardCeiling"))
                min_amount = self._parse_amount(hit.get("awardFloor"))

                grant = self.storage.upsert_grant(
                    db=db,
                    opportunity_id=opp_id,
                    title=title,
                    funding_agency=agency,
                    category=category,
                    close_date=close_date,
                    description=description,
                    max_amount=max_amount,
                    min_amount=min_amount
                )
                saved_grants.append(grant)

            self.logger.info(f"Successfully processed and saved {len(saved_grants)} funding opportunities from Grants.gov.")
            return hits
        except Exception as e:
            self.logger.error(f"Error querying Grants.gov: {e}")
            return []
