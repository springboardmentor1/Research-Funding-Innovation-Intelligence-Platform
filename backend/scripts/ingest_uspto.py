import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

# For Milestone 1, we create some mock data representing USPTO patents
# In a real scenario, this would hit the USPTO PatentsView API
MONGO_URL = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")

MOCK_PATENTS = [
    {
        "patent_id": "US10000000B2",
        "title": "Coherent LADAR using intra-pixel quadrature detection",
        "abstract": "A coherent LADAR system...",
        "assignees": [{"assignee_name": "Raytheon Company"}],
        "inventors": [{"inventor_name": "Joseph C. Marron"}],
        "date": "2018-06-19"
    },
    {
        "patent_id": "US11111111B2",
        "title": "Machine learning based automated driving system",
        "abstract": "A system and method for autonomous driving using neural networks...",
        "assignees": [{"assignee_name": "Tech Auto LLC"}],
        "inventors": [{"inventor_name": "Jane Doe"}],
        "date": "2021-09-07"
    }
]

async def ingest_uspto():
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.rfi_db
    collection = db.patents
    
    print(f"Ingesting {len(MOCK_PATENTS)} mock patents into MongoDB...")
    
    for patent in MOCK_PATENTS:
        # Upsert by Patent ID
        await collection.update_one({"patent_id": patent["patent_id"]}, {"$set": patent}, upsert=True)
            
    print("USPTO ingestion complete!")

if __name__ == "__main__":
    asyncio.run(ingest_uspto())
