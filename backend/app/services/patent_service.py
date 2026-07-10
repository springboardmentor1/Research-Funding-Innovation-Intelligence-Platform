from typing import Dict


async def search_patents(query: str) -> Dict:
    return {
        "source": "Google Patents / The Lens",
        "status": "Integration Ready",
        "query": query,
        "message": "Patent intelligence module will be implemented in Milestone 3."
    }