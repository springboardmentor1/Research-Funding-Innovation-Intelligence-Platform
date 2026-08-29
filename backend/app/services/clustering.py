"""
Patent clustering (Module 5: patent clustering).

Groups patents into discovered themes using unsupervised learning, rather than
relying only on the pre-assigned CPC codes. Why this is worth doing on top of
CPC: CPC is a fixed human taxonomy assigned at filing. Clustering finds themes
that emerge from the ACTUAL LANGUAGE of the patents, which can cut across CPC
boundaries and surface groupings the taxonomy does not name.

THE PIPELINE
    1. TF-IDF vectorise the patent text (title + abstract)
    2. KMeans partition the vectors into k clusters
    3. Read each cluster's top terms from its centroid -> a human-readable
       label for a group nobody labelled in advance

WHY KMEANS, NOT SOMETHING FANCIER
    KMeans is fast, deterministic with a fixed seed, and its centroids are
    directly interpretable as "the average patent in this cluster", which is
    exactly what lets us name each cluster from its top terms. For an
    explainable dashboard feature that is the right trade-off. DBSCAN or
    hierarchical clustering would add complexity without a clear payoff here.

CACHING
    Vectorising and clustering ~10k patents takes a few seconds, and the result
    is identical between requests. So it is computed once per (k, sample_size)
    and cached, like the recommender.
"""

from __future__ import annotations

import numpy as np
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Patent

_cache: dict[tuple, dict] = {}


def cluster_patents(db: Session, k: int = 8, sample: int = 2000) -> dict:
    """Cluster a sample of patents into k themes.

    We sample the most-cited patents rather than clustering all 10k: the most
    influential patents define the meaningful themes, and a smaller matrix
    keeps the response fast. sample is capped so a huge request cannot stall
    the server.
    """
    key = (k, sample)
    if key in _cache:
        return _cache[key]

    rows = db.execute(
        select(Patent.id, Patent.title, Patent.abstract,
               Patent.cited_by_count, Patent.publication_year)
        .where(Patent.title.is_not(None))
        .order_by(Patent.cited_by_count.desc())
        .limit(sample)
    ).all()

    if len(rows) < k:
        return {"error": f"not enough patents ({len(rows)}) to form {k} clusters"}

    # title + abstract gives the vectoriser far more signal than title alone
    corpus = [f"{r.title or ''} {r.abstract or ''}".strip() for r in rows]

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        min_df=3,
        max_df=0.7,
        max_features=5000,
    )
    X = vectorizer.fit_transform(corpus)

    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X)

    terms = vectorizer.get_feature_names_out()
    centroids = km.cluster_centers_

    clusters = []
    for c in range(k):
        member_idx = np.where(labels == c)[0]
        # cluster theme = its centroid's highest-weighted terms
        top_terms = [terms[i] for i in centroids[c].argsort()[::-1][:6]]

        # a few representative patents: highest-cited members of the cluster
        members = sorted(
            (rows[i] for i in member_idx),
            key=lambda r: r.cited_by_count, reverse=True,
        )
        examples = [
            {"title": m.title, "cited_by_count": m.cited_by_count,
             "year": m.publication_year}
            for m in members[:3]
        ]
        years = [m.publication_year for m in members if m.publication_year]

        clusters.append({
            "cluster_id": c,
            "label": ", ".join(top_terms[:3]),
            "top_terms": top_terms,
            "size": len(member_idx),
            "avg_year": round(sum(years) / len(years), 1) if years else None,
            "examples": examples,
        })

    clusters.sort(key=lambda c: c["size"], reverse=True)

    result = {
        "k": k,
        "patents_clustered": len(rows),
        "method": "TF-IDF (title + abstract) + KMeans; cluster labels are the "
                  "top centroid terms",
        "clusters": clusters,
    }
    _cache[key] = result
    return result
