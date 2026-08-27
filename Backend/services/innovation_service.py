import os
import json
from sqlalchemy.orm import Session
from models.intelligence import InnovationScore, CommercializationRecommendation
from models.profile import ResearchProfile
from models.funding import GrantTracking
from datetime import datetime, timezone

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None

def calculate_score(db: Session, profile_id: int):
    # Fetch the user's profile
    profile = db.query(ResearchProfile).filter(ResearchProfile.id == profile_id).first()
    
    if not profile:
        profile_data = {"h_index": 0, "total_citations": 0, "linked_publications": [], "linked_patents": [], "keywords": [], "organization": "", "user_id": 0}
    else:
        profile_data = {
            "h_index": profile.h_index or 0,
            "total_citations": profile.total_citations or 0,
            "linked_publications": profile.linked_publications or [],
            "linked_patents": profile.linked_patents or [],
            "keywords": profile.keywords or [],
            "organization": profile.organization or "",
            "user_id": profile.user_id
        }
    
    # 1. Research Novelty (30%)
    research_novelty = 0.0
    num_pubs = len(profile_data["linked_publications"])
    if num_pubs > 0:
        research_novelty += 20
        if num_pubs > 5:
            research_novelty += 20
    research_novelty += min(profile_data["h_index"] * 2, 40)
    if profile_data["total_citations"] > 500:
        research_novelty += 20
    elif profile_data["total_citations"] > 100:
        research_novelty += 10
    research_novelty = min(research_novelty, 100.0)

    # 2. Patent Strength (20%)
    num_patents = len(profile_data["linked_patents"])
    patent_strength = min(num_patents * 20.0, 100.0)

    # 3. Technology Maturity (15%)
    tech_maturity = min(30.0 + (num_patents * 15.0), 100.0)

    # 4. Market Potential (20%)
    market_potential = 40.0
    trending_keywords = {"ai", "machine learning", "deep learning", "quantum", "blockchain", "biotechnology", "saas", "llm", "genai", "artificial intelligence"}
    profile_keywords = [k.lower() for k in profile_data["keywords"]]
    keyword_boost = sum(10 for k in profile_keywords if any(tk in k for tk in trending_keywords))
    market_potential += min(keyword_boost, 40.0)
    if profile_data["organization"]:
        market_potential += 20.0
    market_potential = min(market_potential, 100.0)

    # 5. Funding Relevance (15%)
    funding_relevance = 30.0
    if profile:
        grants = db.query(GrantTracking).filter(GrantTracking.user_id == profile.user_id).all()
        for g in grants:
            if g.status == "interested":
                funding_relevance += 10
            elif g.status == "applied":
                funding_relevance += 20
            elif g.status == "awarded":
                funding_relevance += 40
    funding_relevance = min(funding_relevance, 100.0)
    
    composite = (
        (research_novelty * 0.30) +
        (patent_strength * 0.20) +
        (tech_maturity * 0.15) +
        (market_potential * 0.20) +
        (funding_relevance * 0.15)
    )
    
    score = db.query(InnovationScore).filter(InnovationScore.profile_id == profile_id).first()
    if not score:
        score = InnovationScore(profile_id=profile_id)
        db.add(score)
        
    score.research_novelty_score = research_novelty
    score.patent_strength_score = patent_strength
    score.technology_maturity_score = tech_maturity
    score.market_potential_score = market_potential
    score.funding_relevance_score = funding_relevance
    score.composite_score = composite
    score.calculated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(score)
    return score

def get_score(db: Session, profile_id: int):
    return db.query(InnovationScore).filter(InnovationScore.profile_id == profile_id).first()

def generate_recommendations(db: Session, profile_id: int):
    rec = db.query(CommercializationRecommendation).filter(CommercializationRecommendation.profile_id == profile_id).first()
    if not rec:
        rec = CommercializationRecommendation(profile_id=profile_id)
        db.add(rec)
        
    profile = db.query(ResearchProfile).filter(ResearchProfile.id == profile_id).first()
    api_key = os.getenv("GEMINI_API_KEY")
    
    if genai and api_key and profile:
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        Analyze the following research profile and generate commercialization recommendations:
        Domains: {', '.join(profile.research_domains) if profile.research_domains else 'None'}
        Keywords: {', '.join(profile.keywords) if profile.keywords else 'None'}
        Publications Count: {len(profile.linked_publications) if profile.linked_publications else 0}
        Patents Count: {len(profile.linked_patents) if profile.linked_patents else 0}
        Organization: {profile.organization or 'None'}
        
        Generate exactly 4 categories of recommendations as a JSON object with the following keys. Each key should contain a list of objects with 'title' and 'description' fields.
        Keys:
        - productization_suggestions
        - licensing_opportunities
        - startup_creation_recommendations
        - industry_partnerships
        """
        
        try:
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )
            data = json.loads(response.text)
            rec.productization_suggestions = data.get("productization_suggestions", [])
            rec.licensing_opportunities = data.get("licensing_opportunities", [])
            rec.startup_creation_recommendations = data.get("startup_creation_recommendations", [])
            rec.industry_partnerships = data.get("industry_partnerships", [])
        except Exception as e:
            print(f"LLM generation failed: {e}")
            _apply_fallback_recommendations(rec)
    else:
        _apply_fallback_recommendations(rec)
        
    rec.generated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(rec)
    return rec

def _apply_fallback_recommendations(rec):
    rec.productization_suggestions = [{"title": "Software API", "description": "Package as SaaS"}]
    rec.licensing_opportunities = [{"title": "License to Tech Co", "description": "B2B licensing"}]
    rec.startup_creation_recommendations = [{"title": "Spin-off", "description": "Create a new entity"}]
    rec.industry_partnerships = [{"title": "Joint Venture", "description": "Partner with manufacturing"}]

def get_recommendations(db: Session, profile_id: int):
    return db.query(CommercializationRecommendation).filter(CommercializationRecommendation.profile_id == profile_id).first()
