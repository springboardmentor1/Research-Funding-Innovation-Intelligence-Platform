from app.database.database import SessionLocal
from app.models import Publication, User
from datetime import datetime
from sqlalchemy import func

def update_publications():
    """
    Safely updates publication data without deleting existing data.
    Adds new publications with year ranges up to 2026 while preserving all existing data.
    """
    db = SessionLocal()
    
    try:
        # Check if publications already exist
        existing_publications = db.query(Publication).count()
        print(f"Found {existing_publications} existing publications")
        
        # Get existing users to assign publications to
        users = db.query(User).all()
        if not users:
            print("No users found in database. Please create users first.")
            return
        
        print(f"Found {len(users)} users to assign publications to")
        
        # New publication data with years up to 2026
        new_publications = [
            {
                "user_id": users[0].id if len(users) > 0 else 1,
                "title": "Deep Learning for Medical Image Analysis",
                "journal": "Nature Medicine",
                "publication_year": 2024,
                "citation_count": 45,
                "research_area": "Medical Imaging"
            },
            {
                "user_id": users[1].id if len(users) > 1 else 1,
                "title": "Natural Language Processing for Clinical Text",
                "journal": "JAMIA",
                "publication_year": 2024,
                "citation_count": 32,
                "research_area": "NLP"
            },
            {
                "user_id": users[0].id if len(users) > 0 else 1,
                "title": "Graph Neural Networks for Drug Discovery",
                "journal": "Science",
                "publication_year": 2024,
                "citation_count": 67,
                "research_area": "Drug Discovery"
            },
            {
                "user_id": users[0].id if len(users) > 0 else 1,
                "title": "Transformer Models for Protein Structure Prediction",
                "journal": "Nature Biotechnology",
                "publication_year": 2025,
                "citation_count": 89,
                "research_area": "Bioinformatics"
            },
            {
                "user_id": users[1].id if len(users) > 1 else 1,
                "title": "Multi-modal AI in Healthcare",
                "journal": "Lancet Digital Health",
                "publication_year": 2025,
                "citation_count": 54,
                "research_area": "Healthcare AI"
            },
            {
                "user_id": users[0].id if len(users) > 0 else 1,
                "title": "Federated Learning for Privacy-Preserving Medical Research",
                "journal": "IEEE Transactions on Medical Imaging",
                "publication_year": 2025,
                "citation_count": 41,
                "research_area": "Privacy-Preserving AI"
            },
            {
                "user_id": users[1].id if len(users) > 1 else 1,
                "title": "Large Language Models for Clinical Decision Support",
                "journal": "NEJM AI",
                "publication_year": 2026,
                "citation_count": 23,
                "research_area": "Clinical AI"
            },
            {
                "user_id": users[0].id if len(users) > 0 else 1,
                "title": "AI-Driven Drug Repurposing for Rare Diseases",
                "journal": "Cell Reports Medicine",
                "publication_year": 2026,
                "citation_count": 18,
                "research_area": "Drug Discovery"
            },
            {
                "user_id": users[1].id if len(users) > 1 else 1,
                "title": "Explainable AI in Medical Imaging",
                "journal": "Radiology: AI",
                "publication_year": 2026,
                "citation_count": 15,
                "research_area": "Explainable AI"
            }
        ]
        
        # Check for duplicate publications (same title, year, and user)
        added_count = 0
        skipped_count = 0
        
        for pub_data in new_publications:
            # Check if this publication already exists
            existing = db.query(Publication).filter(
                Publication.title == pub_data["title"],
                Publication.publication_year == pub_data["publication_year"],
                Publication.user_id == pub_data["user_id"]
            ).first()
            
            if existing:
                print(f"Skipping duplicate: {pub_data['title']} ({pub_data['publication_year']})")
                skipped_count += 1
            else:
                publication = Publication(**pub_data)
                db.add(publication)
                added_count += 1
                print(f"Adding: {pub_data['title']} ({pub_data['publication_year']})")
        
        db.commit()
        
        # Display updated statistics
        total_publications = db.query(Publication).count()
        
        print("\n" + "="*50)
        print("PUBLICATION UPDATE COMPLETED SUCCESSFULLY!")
        print("="*50)
        print(f"Added: {added_count} new publications")
        print(f"Skipped: {skipped_count} duplicates")
        print(f"Total publications in database: {total_publications}")
        print("\nYear breakdown:")
        
        # Show publication count by year
        year_counts = db.query(
            Publication.publication_year,
            func.count(Publication.id)
        ).group_by(Publication.publication_year).order_by(Publication.publication_year).all()
        
        for year, count in year_counts:
            print(f"  {year}: {count} publications")
        
        print("\nAll existing data preserved (users, profiles, funding, etc.)")
        print("Only publication data was updated")
        
    except Exception as e:
        print(f"Error updating publications: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_publications()
