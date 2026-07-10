import logging
import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from .base import BaseCollector
from .storage import StorageCoordinator

logger = logging.getLogger("collector.patentsview")


class PatentsViewCollector(BaseCollector):
    """
    Collector for USPTO PatentsView API.
    Used for retrieving and indexing patent landscapes.
    """

    def __init__(self, rate_limit_delay: float = 1.0):
        # PatentsView base URL
        super().__init__(
            name="patentsview",
            base_url="https://api.patentsview.org",
            rate_limit_delay=rate_limit_delay
        )
        self.storage = StorageCoordinator()

    def fetch_patents(
        self, db: Session, keyword: str = "machine learning", limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Queries PatentsView API for patents matching a keyword and saves them.
        """
        self.logger.info(f"Querying PatentsView for keyword '{keyword}'...")
        
        # Build search criteria query parameter
        q_param = {
            "_or": [
                {"_text_any": {"patent_title": keyword}},
                {"_text_any": {"patent_abstract": keyword}}
            ]
        }
        
        # Request fields list - include assignees too!
        f_param = [
            "patent_number",
            "patent_title",
            "patent_date",
            "patent_abstract",
            "patent_kind",
            "assignees.assignee_organization"
        ]
        
        # Options parameter
        o_param = {
            "limit": min(limit, 100)
        }

        params = {
            "q": json.dumps(q_param),
            "f": json.dumps(f_param),
            "o": json.dumps(o_param)
        }

        try:
            response = self.request("GET", "patents/query", params=params)
            data = response.json()
            patents = data.get("patents", [])
            
            saved_patents = []
            for pat in patents:
                # Extract fields from PatentsView API response
                patent_number = pat.get("patent_number")
                title = pat.get("patent_title") or "Untitled Patent"
                patent_date = pat.get("patent_date")
                abstract = pat.get("patent_abstract")
                kind = pat.get("patent_kind")
                
                # Get assignee (first one)
                assignee = None
                assignees_list = pat.get("assignees", [])
                if assignees_list:
                    assignee = assignees_list[0].get("assignee_organization")
                
                # Map PatentsView patent_kind to status
                status = "Granted" if kind and kind in ["B1", "B2"] else "Pending"
                
                patent_obj = self.storage.upsert_patent(
                    db=db,
                    patent_number=patent_number,
                    title=title,
                    filing_date=patent_date,
                    abstract=abstract,
                    assignee=assignee,
                    status=status
                )
                saved_patents.append(patent_obj)

            self.logger.info(f"Successfully processed and saved {len(saved_patents)} patents from USPTO PatentsView.")
            return patents
        except Exception as e:
            self.logger.error(f"Error querying PatentsView: {e}")
            return []
