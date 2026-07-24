"""
Funding recommendation engine.

Two stages, never merged:

  STAGE 1  HARD FILTER (SQL)
           Deadline in the future. Nothing else matters if you cannot apply.
           A grant that closed last month scoring 0.98 similarity is not a
           recommendation, it is a bug.

  STAGE 2  RANKING (hybrid retrieval)
           lexical  - TF-IDF cosine. Catches exact technical terms:
                      "CRISPR", "quantum annealing", "federated learning".
           dense    - sentence-transformer cosine. Catches vocabulary
                      mismatch: a profile saying "deep learning for medical
                      imaging" against a grant saying "computational methods
                      for diagnostic radiology" shares almost no words, and
                      TF-IDF scores it near zero.

           Neither signal dominates the other, so we use both.

WHY NOT A WEIGHTED SUM OF THE TWO SCORES
----------------------------------------
TF-IDF cosine over a sparse vocabulary clusters near 0.0-0.15. Transformer
cosine over normalised embeddings clusters near 0.2-0.8. Adding them with
fixed weights lets the dense score dominate purely because its numbers are
bigger - the weights would be doing nothing you intended.

So we fuse RANKS, not scores, using Reciprocal Rank Fusion:

    RRF(d) = sum over rankers of  1 / (k + rank_r(d))

Rank is scale-free, so the mismatch disappears. k=60 is the constant from
the original TREC work; it damps the influence of the very top ranks so one
ranker cannot unilaterally decide the result.

WHY NOT FAISS
-------------
The tech stack lists it, but with ~1,000 candidate vectors a brute-force
NumPy dot product is FASTER than building an index. FAISS earns its cost
around 100k+ vectors. Knowing when not to reach for a tool matters as much
as knowing how to use it.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import FundingOpportunity, ResearchProfile

EMBED_MODEL = "all-MiniLM-L6-v2"   # 80MB, 384 dims, seconds on CPU
RRF_K = 60


@dataclass
class Scored:
    opportunity: FundingOpportunity
    score: float
    lexical_score: float = 0.0
    dense_score: float = 0.0
    matched_terms: list[str] = field(default_factory=list)


# ------------------------------------------------------------------ pure math
def rrf_fuse(*score_arrays: np.ndarray, k: int = RRF_K) -> np.ndarray:
    """Fuse several score arrays by rank rather than by value.

    Each input is scores for the SAME candidates in the SAME order. We
    convert each to ranks (0 = best), then sum 1/(k+rank).
    """
    fused = np.zeros_like(score_arrays[0], dtype=float)
    for scores in score_arrays:
        # argsort descending gives indices best-first;
        # argsort of THAT gives each element its rank
        order = np.argsort(-scores)
        ranks = np.empty_like(order)
        ranks[order] = np.arange(len(scores))
        fused += 1.0 / (k + ranks)
    return fused


def top_matched_terms(vectorizer: TfidfVectorizer,
                      query_vec, doc_vec, n: int = 5) -> list[str]:
    """Terms contributing most to a lexical match.

    The contribution of a term is query_weight * doc_weight - it must carry
    weight on BOTH sides to matter. This is what makes the recommendation
    explainable: the UI can show why this grant surfaced.
    """
    q = np.asarray(query_vec.todense()).ravel()
    d = np.asarray(doc_vec.todense()).ravel()
    contrib = q * d
    if not contrib.any():
        return []
    idx = np.argsort(-contrib)[:n]
    names = vectorizer.get_feature_names_out()
    return [names[i] for i in idx if contrib[i] > 0]


# ------------------------------------------------------------------ engine
class Recommender:
    """Builds its index once, then answers many queries.

    Encoding ~1,000 grants with a transformer takes a few seconds. Doing
    that per request would make every page load unusable. fit() runs once;
    recommend() is then milliseconds.
    """

    def __init__(self, db: Session, use_dense: bool = True):
        self.db = db
        self.use_dense = use_dense
        self.opportunities: list[FundingOpportunity] = []
        self.vectorizer: TfidfVectorizer | None = None
        self.tfidf_matrix = None
        self.embeddings: np.ndarray | None = None
        self._model = None
        self._fitted = False

    # -------------------------------------------------------------- stage 1
    def _eligible(self) -> list[FundingOpportunity]:
        """The hard filter. SQL, not ML.

        Filtering BEFORE ranking is not an optimisation - it is correctness.
        Rank first and you spend compute scoring grants the user cannot
        apply for, then have to drop them, which can leave you with fewer
        results than requested and no way to backfill.
        """
        stmt = (
            select(FundingOpportunity)
            .where(FundingOpportunity.close_date > date.today())
            .where(FundingOpportunity.description.is_not(None))
        )
        return list(self.db.scalars(stmt))

    # -------------------------------------------------------------- fitting
    def fit(self) -> "Recommender":
        self.opportunities = self._eligible()
        if not self.opportunities:
            self._fitted = True
            return self

        corpus = [o.opportunity_text for o in self.opportunities]

        # min_df=2   drop terms appearing in only one grant (usually noise)
        # max_df=0.8 drop terms in >80% of grants ("research", "program") -
        #            they carry no discriminating power
        # ngram 1-2  keep bigrams so "machine learning" is one feature
        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.8,
            max_features=50_000,
            sublinear_tf=True,   # log-scale term frequency; a term appearing
                                 # 50 times is not 50x more relevant than once
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

        if self.use_dense:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(EMBED_MODEL)
                self.embeddings = self._model.encode(
                    corpus,
                    batch_size=32,
                    convert_to_numpy=True,
                    normalize_embeddings=True,   # makes dot product == cosine
                    show_progress_bar=False,
                )
            except Exception as exc:
                print(f"  dense encoder unavailable ({type(exc).__name__}) "
                      f"- falling back to lexical only")
                self.use_dense = False

        self._fitted = True
        return self

    # -------------------------------------------------------------- stage 2
    def recommend(self, profile: ResearchProfile, top_k: int = 10,
                  method: str = "hybrid") -> list[Scored]:
        """method: 'lexical' | 'dense' | 'hybrid'

        Keeping all three selectable is what lets you MEASURE whether the
        transformer helps, instead of assuming it does.
        """
        if not self._fitted:
            self.fit()
        if not self.opportunities:
            return []

        query = profile.profile_text.strip()
        if not query:
            return []

        query_vec = self.vectorizer.transform([query])
        lexical = cosine_similarity(query_vec, self.tfidf_matrix).ravel()

        dense = np.zeros_like(lexical)
        if self.use_dense and self.embeddings is not None:
            q_emb = self._model.encode(
                [query], convert_to_numpy=True, normalize_embeddings=True
            )
            dense = (self.embeddings @ q_emb.T).ravel()

        if method == "lexical" or not self.use_dense:
            final = lexical
        elif method == "dense":
            final = dense
        else:
            final = rrf_fuse(lexical, dense)

        top_idx = np.argsort(-final)[:top_k]

        results = []
        for i in top_idx:
            if final[i] <= 0:
                continue
            results.append(Scored(
                opportunity=self.opportunities[i],
                score=round(float(final[i]), 6),
                lexical_score=round(float(lexical[i]), 4),
                dense_score=round(float(dense[i]), 4),
                matched_terms=top_matched_terms(
                    self.vectorizer, query_vec, self.tfidf_matrix[i]
                ),
            ))
        return results

    def compare(self, profile: ResearchProfile, top_k: int = 10) -> dict:
        """Run all three methods so you can report a real comparison.

        Overlap between lexical and dense top-k is the interesting number:
        if it were 100%, the transformer would be adding nothing and you
        should drop it.
        """
        out = {}
        for m in ("lexical", "dense", "hybrid"):
            if m == "dense" and not self.use_dense:
                continue
            out[m] = [r.opportunity.external_id
                      for r in self.recommend(profile, top_k, m)]

        if "lexical" in out and "dense" in out:
            lex, den = set(out["lexical"]), set(out["dense"])
            out["overlap_lexical_dense"] = len(lex & den)
            out["only_dense_found"] = sorted(den - lex)
        return out
