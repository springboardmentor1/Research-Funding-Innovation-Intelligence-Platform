import asyncio
import httpx
from motor.motor_asyncio import AsyncIOMotorClient

import os
from dotenv import load_dotenv

load_dotenv()

# For Milestone 1, we pull a small sample of publications related to "Machine Learning"
OPENALEX_API_URL = "https://api.openalex.org/works?search=machine%20learning&per-page=50"
MONGO_URL = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")

async def ingest_openalex():
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.rfi_db
    collection = db.publications
    
    print(f"Fetching data from OpenAlex: {OPENALEX_API_URL}")
    async with httpx.AsyncClient() as http_client:
        response = await http_client.get(OPENALEX_API_URL)
        response.raise_for_status()
        data = response.json()
        
        results = data.get("results", [])
        print(f"Fetched {len(results)} works. Ingesting to MongoDB...")
        
        for work in results:
            doc = {
                "id": work.get("id"),
                "title": work.get("title"),
                "publication_date": work.get("publication_date"),
                # Abstract is usually inverted in OpenAlex; we'd parse it here in production
                "abstract": "Abstract placeholder", 
                "authorships": work.get("authorships", []),
                "concepts": work.get("concepts", [])
            }
            # Upsert by OpenAlex ID
            await collection.update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)
            
    print("OpenAlex ingestion complete!")

if __name__ == "__main__":
    asyncio.run(ingest_openalex())
