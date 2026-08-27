import os
import sys
from dotenv import load_dotenv

# Ensure we can import from the Backend directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from database.db import SessionLocal
from models.profile import ResearchProfile
from models.user import User
from services.innovation_service import generate_recommendations
import json

def test_llm_recommendations():
    print(f"API KEY DETECTED: {'YES' if os.getenv('GEMINI_API_KEY') else 'NO'}")
    
    db = SessionLocal()
    try:
        # Get or create a dummy user and profile
        user = db.query(User).first()
        if not user:
            print("No users found. Creating a dummy user...")
            user = User(email="test_llm@example.com", password_hash="hash", name="LLM Test User")
            db.add(user)
            db.commit()
            db.refresh(user)
            
        profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user.id).first()
        if not profile:
            print("No profile found. Creating a dummy profile...")
            profile = ResearchProfile(
                user_id=user.id, 
                bio="AI Researcher", 
                research_domains=["Artificial Intelligence", "Machine Learning"],
                keywords=["neural networks", "transformer", "llm"],
                linked_publications=["pub1", "pub2"],
                linked_patents=["pat1"]
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)

        print(f"Testing recommendations for Profile ID: {profile.id}")
        rec = generate_recommendations(db, profile.id)
        
        print("\n--- LLM GENERATED RECOMMENDATIONS ---")
        print("\nProductization Suggestions:")
        print(json.dumps(rec.productization_suggestions, indent=2))
        
        print("\nLicensing Opportunities:")
        print(json.dumps(rec.licensing_opportunities, indent=2))
        
        print("\nStartup Creation:")
        print(json.dumps(rec.startup_creation_recommendations, indent=2))
        
        print("\nIndustry Partnerships:")
        print(json.dumps(rec.industry_partnerships, indent=2))
        
    except Exception as e:
        print(f"Error during testing: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_llm_recommendations()
