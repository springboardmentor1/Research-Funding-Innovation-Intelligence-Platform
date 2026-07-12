"""
Data ingestion service layer.
Each source implements the IngestionSource protocol.
Concrete implementations go in separate modules (openalex.py, semantic_scholar.py, etc.)
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any
import httpx


@dataclass
class IngestionResult:
    source: str
    records_fetched: int
    records_stored: int
    errors: list[str] = field(default_factory=list)


class IngestionSource(ABC):
    """
    All external data sources implement this interface.
    Concrete classes handle rate limiting, pagination, and field mapping.
    """
    base_url: str

    @abstractmethod
    async def fetch(self, query: str, max_results: int = 100) -> list[dict[str, Any]]:
        """Fetch raw records from external API."""
        ...

    @abstractmethod
    def normalize(self, raw: dict[str, Any]) -> dict[str, Any]:
        """Map source-specific fields to internal schema."""
        ...


class OpenAlexSource(IngestionSource):
    base_url = "https://api.openalex.org"

    async def fetch(self, query: str, max_results: int = 100) -> list[dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{self.base_url}/works",
                params={"search": query, "per-page": min(max_results, 200)},
                timeout=30,
            )
            resp.raise_for_status()
            return resp.json().get("results", [])

    def normalize(self, raw: dict[str, Any]) -> dict[str, Any]:
        return {
            "source": "openalex",
            "external_id": raw.get("id"),
            "title": raw.get("title"),
            "doi": raw.get("doi"),
            "publication_year": raw.get("publication_year"),
            "authors": [a.get("author", {}).get("display_name") for a in raw.get("authorships", [])],
            "concepts": [c.get("display_name") for c in raw.get("concepts", [])],
            "cited_by_count": raw.get("cited_by_count", 0),
        }


class SemanticScholarSource(IngestionSource):
    base_url = "https://api.semanticscholar.org/graph/v1"

    async def fetch(self, query: str, max_results: int = 100) -> list[dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{self.base_url}/paper/search",
                params={"query": query, "limit": min(max_results, 100), "fields": "title,authors,year,citationCount,externalIds"},
                timeout=30,
            )
            resp.raise_for_status()
            return resp.json().get("data", [])

    def normalize(self, raw: dict[str, Any]) -> dict[str, Any]:
        return {
            "source": "semantic_scholar",
            "external_id": raw.get("paperId"),
            "title": raw.get("title"),
            "doi": raw.get("externalIds", {}).get("DOI"),
            "publication_year": raw.get("year"),
            "authors": [a.get("name") for a in raw.get("authors", [])],
            "cited_by_count": raw.get("citationCount", 0),
        }


class USPTOSource(IngestionSource):
    """Placeholder — USPTO PatentsView API requires API key and different auth flow."""
    base_url = "https://api.patentsview.org/patents/query"

    async def fetch(self, query: str, max_results: int = 100) -> list[dict[str, Any]]:
        raise NotImplementedError("USPTO integration requires API key configuration.")

    def normalize(self, raw: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError


async def run_ingestion(source: IngestionSource, query: str, mongo_db) -> IngestionResult:
    """Orchestrates fetch → normalize → store to MongoDB."""
    raw_records = await source.fetch(query)
    normalized = [source.normalize(r) for r in raw_records]
    collection = mongo_db["publications"]

    stored = 0
    errors = []
    for doc in normalized:
        try:
            collection.update_one(
                {"external_id": doc["external_id"], "source": doc["source"]},
                {"$set": doc},
                upsert=True,
            )
            stored += 1
        except Exception as e:
            errors.append(str(e))

    return IngestionResult(
        source=source.__class__.__name__,
        records_fetched=len(raw_records),
        records_stored=stored,
        errors=errors,
    )