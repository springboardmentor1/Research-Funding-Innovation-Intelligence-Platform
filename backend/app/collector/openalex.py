import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from .base import BaseCollector
from .storage import StorageCoordinator

logger = logging.getLogger("collector.openalex")


class OpenAlexCollector(BaseCollector):
    """
    Collector for OpenAlex API.
    Retrieves publications, authors, institutions, and concepts.
    """

    def __init__(self, rate_limit_delay: float = 0.5):
        super().__init__(
            name="openalex",
            base_url="https://api.openalex.org",
            rate_limit_delay=rate_limit_delay
        )
        self.storage = StorageCoordinator()

    def fetch_concepts(self, db: Session, limit: int = 20) -> List[Dict[str, Any]]:
        """Fetches scientific concepts and saves them."""
        self.logger.info(f"Fetching up to {limit} concepts from OpenAlex...")
        params = {
            "per_page": min(limit, 100),
            "sort": "works_count:desc"  # Get most popular concepts
        }
        
        try:
            response = self.request("GET", "concepts", params=params)
            data = response.json()
            results = data.get("results", [])
            
            saved_concepts = []
            for item in results:
                concept_id = item.get("id")
                name = item.get("display_name")
                level = item.get("level")
                description = item.get("description") or ""

                concept = self.storage.upsert_concept(
                    db=db,
                    openalex_id=concept_id,
                    display_name=name,
                    level=level,
                    description=description
                )
                saved_concepts.append(concept)
            
            self.logger.info(f"Successfully saved {len(saved_concepts)} concepts.")
            return results
        except Exception as e:
            self.logger.error(f"Error fetching concepts: {e}")
            return []

    def fetch_institutions(self, db: Session, search: str = "University", limit: int = 10) -> List[Dict[str, Any]]:
        """Fetches institutions matching search term."""
        self.logger.info(f"Fetching up to {limit} institutions for search '{search}'...")
        params = {
            "search": search,
            "per_page": min(limit, 100)
        }

        try:
            response = self.request("GET", "institutions", params=params)
            data = response.json()
            results = data.get("results", [])

            saved_insts = []
            for item in results:
                openalex_id = item.get("id")
                name = item.get("display_name")
                country_code = item.get("country_code")
                inst_type = item.get("type")
                homepage_url = item.get("homepage_url")
                
                # Check for ROR ID
                ids = item.get("ids", {})
                ror_id = ids.get("ror")

                inst = self.storage.upsert_institution(
                    db=db,
                    name=name,
                    ror_id=ror_id,
                    openalex_id=openalex_id,
                    country_code=country_code,
                    type_=inst_type,
                    homepage_url=homepage_url
                )
                saved_insts.append(inst)

            self.logger.info(f"Successfully saved {len(saved_insts)} institutions.")
            return results
        except Exception as e:
            self.logger.error(f"Error fetching institutions: {e}")
            return []

    def fetch_publications(self, db: Session, search_query: str = "artificial intelligence", limit: int = 20) -> List[Dict[str, Any]]:
        """
        Fetches publications matching search query, cascading to resolve
        concepts, institutions, and author links in the normalized DB.
        """
        self.logger.info(f"Fetching up to {limit} publications for query '{search_query}'...")
        params = {
            "search": search_query,
            "per_page": min(limit, 100),
            "sort": "cited_by_count:desc"
        }

        try:
            response = self.request("GET", "works", params=params)
            data = response.json()
            results = data.get("results", [])

            saved_pubs = 0
            for item in results:
                openalex_id = item.get("id")
                title = item.get("title") or "Untitled Work"
                doi = item.get("doi")
                publication_year = item.get("publication_year")
                
                # Get journal name
                journal = None
                primary_loc = item.get("primary_location") or {}
                source = primary_loc.get("source") or {}
                if source:
                    journal = source.get("display_name")
                
                citation_count = item.get("cited_by_count", 0)

                # 1. Resolve & Upsert the primary concept of the publication
                concept_id_db = None
                concepts_list = item.get("concepts", [])
                if concepts_list:
                    # Find highest scored concept
                    concepts_sorted = sorted(concepts_list, key=lambda x: x.get("score", 0), reverse=True)
                    best_concept = concepts_sorted[0]
                    concept_openalex_id = best_concept.get("id")
                    concept_name = best_concept.get("display_name")
                    concept_level = best_concept.get("level")

                    c_obj = self.storage.upsert_concept(
                        db=db,
                        openalex_id=concept_openalex_id,
                        display_name=concept_name,
                        level=concept_level,
                        description=""
                    )
                    concept_id_db = c_obj.id

                # 2. Resolve Authors & Institutions
                authors_list_db = []
                authorships = item.get("authorships", [])
                for auth_ship in authorships:
                    author_data = auth_ship.get("author", {})
                    author_name = author_data.get("display_name")
                    author_openalex_id = author_data.get("id")
                    author_orcid = author_data.get("orcid")
                    if author_orcid:
                        author_orcid = author_orcid.split("/")[-1]  # Extract ID from URL if present

                    # Resolve primary institution for this author
                    inst_id_db = None
                    institutions_list = auth_ship.get("institutions", [])
                    if institutions_list:
                        primary_inst = institutions_list[0]
                        inst_openalex_id = primary_inst.get("id")
                        inst_name = primary_inst.get("display_name")
                        inst_country = primary_inst.get("country_code")
                        inst_type = primary_inst.get("type")
                        inst_ror = primary_inst.get("ror")

                        inst_obj = self.storage.upsert_institution(
                            db=db,
                            name=inst_name,
                            ror_id=inst_ror,
                            openalex_id=inst_openalex_id,
                            country_code=inst_country,
                            type_=inst_type
                        )
                        inst_id_db = inst_obj.id

                    # Upsert Author
                    author_obj = self.storage.upsert_author(
                        db=db,
                        name=author_name,
                        orcid_id=author_orcid,
                        openalex_id=author_openalex_id,
                        primary_institution_id=inst_id_db
                    )
                    authors_list_db.append(author_obj)

                # Extract abstract if available
                abstract = None
                abstract_inverted = item.get("abstract_inverted_index")
                if abstract_inverted:
                    # Reconstruct abstract from inverted index
                    max_index = max([idx for indices in abstract_inverted.values() for idx in indices], default=-1)
                    if max_index >= 0:
                        abstract_list = [""] * (max_index + 1)
                        for word, positions in abstract_inverted.items():
                            for pos in positions:
                                if 0 <= pos <= max_index:
                                    abstract_list[pos] = word
                        abstract = " ".join(abstract_list)
                
                # 3. Upsert Publication & Bind Authors
                self.storage.upsert_publication(
                    db=db,
                    openalex_id=openalex_id,
                    title=title,
                    doi=doi,
                    publication_year=publication_year,
                    journal=journal,
                    citation_count=citation_count,
                    concept_id=concept_id_db,
                    authors=authors_list_db,
                    abstract=abstract
                )
                saved_pubs += 1

            self.logger.info(f"Successfully processed and saved {saved_pubs} publications.")
            return results
        except Exception as e:
            self.logger.error(f"Error fetching publications: {e}")
            return []
