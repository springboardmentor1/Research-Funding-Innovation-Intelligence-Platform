import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from .base import BaseCollector
from .storage import StorageCoordinator

logger = logging.getLogger("collector.ror")


class RORCollector(BaseCollector):
    """
    Collector for Research Organization Registry (ROR) API.
    Used for retrieving and normalizing research institutions.
    """

    def __init__(self, rate_limit_delay: float = 0.5):
        # ROR API base URL
        super().__init__(
            name="ror",
            base_url="https://api.ror.org",
            rate_limit_delay=rate_limit_delay
        )
        self.storage = StorageCoordinator()

    def fetch_organizations(self, db: Session, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Searches ROR registry for organizations and upserts them.
        """
        self.logger.info(f"Searching ROR for organization '{query}'...")
        params = {
            "query": query
        }

        try:
            # We use the standard ROR organizations search endpoint
            response = self.request("GET", "organizations", params=params)
            data = response.json()
            items = data.get("items", [])
            
            # Limit results manually
            items = items[:limit]
            
            saved_orgs = []
            for item in items:
                ror_id = item.get("id")  # Full URL e.g. "https://ror.org/013cjyk83"
                
                # Extract name robustly
                name = item.get("name")
                if not name:
                    names_list = item.get("names", [])
                    for n in names_list:
                        if "ror_display" in n.get("types", []):
                            name = n.get("value")
                            break
                    if not name and names_list:
                        name = names_list[0].get("value")
                if not name:
                    name = "Unknown Institution"
                
                # Extract country code
                country = item.get("country", {})
                country_code = country.get("country_code") or item.get("country_code")
                
                # Extract type
                types = item.get("types", [])
                org_type = "Other"
                if types:
                    first_type = types[0]
                    if isinstance(first_type, dict):
                        org_type = first_type.get("value") or "Other"
                    else:
                        org_type = first_type
                
                # Extract links
                links = item.get("links", [])
                homepage_url = None
                if links:
                    first_link = links[0]
                    if isinstance(first_link, dict):
                        homepage_url = first_link.get("value")
                    else:
                        homepage_url = first_link

                inst = self.storage.upsert_institution(
                    db=db,
                    name=name,
                    ror_id=ror_id,
                    country_code=country_code,
                    type_=org_type,
                    homepage_url=homepage_url
                )
                saved_orgs.append(inst)

            self.logger.info(f"Successfully processed and saved {len(saved_orgs)} organizations from ROR.")
            return items
        except Exception as e:
            self.logger.error(f"Error fetching from ROR: {e}")
            return []

    def fetch_by_ror_id(self, db: Session, ror_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a specific organization record by its ROR ID.
        """
        # Strip URL prefix if present to build query endpoint
        clean_id = ror_id.replace("https://ror.org/", "").replace("http://ror.org/", "")
        self.logger.info(f"Fetching ROR details for ID: {clean_id}...")

        try:
            response = self.request("GET", f"organizations/{clean_id}")
            item = response.json()
            
            ror_id_full = item.get("id")
            name = item.get("name")
            country = item.get("country", {})
            country_code = country.get("country_code")
            types = item.get("types", [])
            org_type = types[0] if types else "Other"
            links = item.get("links", [])
            homepage_url = links[0] if links else None

            self.storage.upsert_institution(
                db=db,
                name=name,
                ror_id=ror_id_full,
                country_code=country_code,
                type_=org_type,
                homepage_url=homepage_url
            )
            return item
        except Exception as e:
            self.logger.error(f"Error fetching ROR ID {ror_id}: {e}")
            return None
