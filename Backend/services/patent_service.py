from sqlalchemy.orm import Session
from models.research_data import Patent
from schemas.research_data_schema import PatentResponse

from sqlalchemy import func
import logging

def search_patents(db: Session, query: str):
    # Keyword search as a fallback, would be FAISS in production
    patents = db.query(Patent).filter(
        (Patent.title.ilike(f"%{query}%")) | 
        (Patent.abstract.ilike(f"%{query}%"))
    ).all()
    return patents

def cluster_patents(db: Session):
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.cluster import KMeans
    except ImportError:
        logging.error("scikit-learn is not installed.")
        return {"status": "error", "message": "Clustering requires scikit-learn to be installed."}

    patents = db.query(Patent).filter(Patent.abstract != None, Patent.abstract != "").all()
    if not patents:
        return {"status": "error", "message": "No patents with abstracts found for clustering."}
    
    # Prepare text data
    texts = [p.abstract for p in patents]
    
    # Vectorize
    vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
    X = vectorizer.fit_transform(texts)
    
    # K-Means Clustering
    num_clusters = min(5, len(patents))
    kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=10)
    kmeans.fit(X)
    
    labels = kmeans.labels_
    
    # Generate human-readable labels for clusters based on top keywords
    order_centroids = kmeans.cluster_centers_.argsort()[:, ::-1]
    terms = vectorizer.get_feature_names_out()
    
    cluster_names = {}
    for i in range(num_clusters):
        top_terms = [terms[ind] for ind in order_centroids[i, :3]]
        cluster_names[i] = " & ".join(top_terms).title()
        
    for i, p in enumerate(patents):
        p.cluster_label = cluster_names[labels[i]]
        
    db.commit()
    
    return {"status": "success", "message": "Clustering completed", "clusters_formed": num_clusters}

def get_trends(db: Session, split_by: str):
    # Extract year from filing_date (assuming format YYYY-MM-DD or similar)
    # Using func.substr for cross-db compatibility (SQLite/Postgres)
    group_col = Patent.technology_domain if split_by == 'domain' else Patent.assignee
    
    results = (
        db.query(
            func.substr(Patent.filing_date, 1, 4).label("year"),
            group_col.label("category"),
            func.count(Patent.id).label("count")
        )
        .filter(Patent.filing_date != None, Patent.filing_date != "")
        .filter(group_col != None, group_col != "")
        .group_by(func.substr(Patent.filing_date, 1, 4), group_col)
        .order_by(func.substr(Patent.filing_date, 1, 4), group_col)
        .all()
    )
    
    trends = [{"year": r.year, "category": r.category, "count": r.count} for r in results if r.year and r.year.isdigit()]
    return {"trends": trends}

def competitor_analysis(db: Session):
    results = (
        db.query(
            Patent.assignee,
            func.count(Patent.id).label("patent_count"),
            func.sum(Patent.citation_count).label("total_citations")
        )
        .filter(Patent.assignee != None, Patent.assignee != "")
        .group_by(Patent.assignee)
        .order_by(func.count(Patent.id).desc())
        .limit(10)
        .all()
    )
    
    competitor_data = [
        {
            "assignee": r.assignee,
            "patent_count": r.patent_count,
            "total_citations": r.total_citations or 0,
            "avg_citations": round((r.total_citations or 0) / r.patent_count, 1) if r.patent_count > 0 else 0
        }
        for r in results
    ]
    return {"competitor_data": competitor_data}

def innovation_mapping(db: Session):
    results = (
        db.query(
            Patent.assignee,
            Patent.cluster_label,
            func.count(Patent.id).label("count")
        )
        .filter(Patent.assignee != None, Patent.assignee != "")
        .filter(Patent.cluster_label != None)
        .group_by(Patent.assignee, Patent.cluster_label)
        .all()
    )
    
    mapping_data = [
        {
            "assignee": r.assignee,
            "cluster_label": r.cluster_label,
            "count": r.count
        }
        for r in results
    ]
    return {"mapping_data": mapping_data}
