import asyncio
from app.db.mongodb import connect_to_mongo, close_mongo_connection, get_mongo_db

async def test_mongodb():
    print("Connecting to MongoDB...")
    await connect_to_mongo()

    db = get_mongo_db()
    print(f"Connected to database: {db.name}")

    # Add test data
    test_collection = db["test_items"]

    # Insert test document
    test_data = {
        "name": "Test Document",
        "description": "This is a test document from the FastAPI backend",
        "tags": ["test", "mongodb", "fastapi"],
        "created_at": asyncio.get_event_loop().time()
    }

    insert_result = await test_collection.insert_one(test_data)
    print(f"Inserted document with ID: {insert_result.inserted_id}")

    # Find and print the document
    found = await test_collection.find_one({"_id": insert_result.inserted_id})
    print("Found document:")
    print(found)

    await close_mongo_connection()
    print("\nTest complete! You can view the data using MongoDB Compass or mongosh!")

if __name__ == "__main__":
    asyncio.run(test_mongodb())
