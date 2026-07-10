import httpx

BASE_URL = "https://api.openalex.org/works"


async def search_publications(query: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            BASE_URL,
            params={
                "search": query,
                "per-page": 10
            }
        )

        response.raise_for_status()

        return response.json()