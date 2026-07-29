from sqlalchemy.orm import Session
from sqlalchemy import func
from models.research_data import Publication
from collections import defaultdict

def publication_count_by_domain_year(db: Session):
    """
    Returns an aggregated breakdown of publication counts grouped by domain and year.
    Format: [{"domain": "AI", "year": 2026, "count": 10}, ...]
    """
    results = db.query(
        Publication.domain, 
        Publication.year, 
        func.count(Publication.id).label('count')
    ).group_by(Publication.domain, Publication.year).all()
    
    return [
        {"domain": r.domain, "year": r.year, "count": r.count}
        for r in results if r.domain is not None
    ]

def emerging_keywords(db: Session, top_n: int = 10):
    """
    Calculates the frequency of keywords in the current/last year versus older years 
    to find the largest positive growth (emerging terms).
    """
    # Fetch all publications with keywords
    pubs = db.query(Publication.year, Publication.keywords).filter(Publication.keywords.isnot(None)).all()
    
    if not pubs:
        return []
        
    current_year = max([p.year for p in pubs])
    
    # keyword -> { "current": count, "past": count }
    keyword_stats = defaultdict(lambda: {"current": 0, "past": 0})
    
    for pub in pubs:
        if not pub.keywords:
            continue
        # Deduplicate keywords per publication
        unique_kws = set(pub.keywords)
        for kw in unique_kws:
            if pub.year == current_year:
                keyword_stats[kw]["current"] += 1
            else:
                keyword_stats[kw]["past"] += 1
                
    # Calculate growth score. 
    # Formula: current_count - (past_count / number_of_past_years)
    # Or simply: current_count - past_count for a raw delta
    emerging = []
    for kw, stats in keyword_stats.items():
        # simple delta
        delta = stats["current"] - stats["past"]
        if delta > 0 or stats["current"] > 0:
            emerging.append({
                "keyword": kw,
                "current_count": stats["current"],
                "past_count": stats["past"],
                "growth_score": delta
            })
            
    # Sort by growth score descending
    emerging.sort(key=lambda x: x["growth_score"], reverse=True)
    return emerging[:top_n]

def research_hotspots(db: Session):
    """
    Identifies domains with the steepest recent growth by analyzing 
    year-over-year percentage increases.
    """
    counts = publication_count_by_domain_year(db)
    if not counts:
        return []
        
    current_year = max([c["year"] for c in counts])
    prev_year = current_year - 1
    
    domain_stats = defaultdict(lambda: {"current": 0, "prev": 0})
    
    for c in counts:
        if c["year"] == current_year:
            domain_stats[c["domain"]]["current"] += c["count"]
        elif c["year"] == prev_year:
            domain_stats[c["domain"]]["prev"] += c["count"]
            
    hotspots = []
    for domain, stats in domain_stats.items():
        if stats["prev"] > 0:
            growth_pct = ((stats["current"] - stats["prev"]) / stats["prev"]) * 100
        else:
            growth_pct = 100.0 if stats["current"] > 0 else 0.0
            
        if growth_pct > 0 or stats["current"] > 0:
            hotspots.append({
                "domain": domain,
                "current_year_count": stats["current"],
                "previous_year_count": stats["prev"],
                "growth_percent": round(growth_pct, 2)
            })
            
    hotspots.sort(key=lambda x: x["growth_percent"], reverse=True)
    return hotspots
