import numpy as np
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logging.basicConfig(level=logging.INFO)

class SemanticEngine:
    def __init__(self):
        self.use_transformer = False
        try:
            from sentence_transformers import SentenceTransformer
            # Small, fast, high-quality embedding model
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            self.use_transformer = True
            logging.info("Successfully loaded SentenceTransformer model 'all-MiniLM-L6-v2'.")
        except Exception as e:
            logging.warning(f"Could not load SentenceTransformer ({e}). Falling back to TF-IDF vectorizer.")
            self.vectorizer = TfidfVectorizer(stop_words='english')

    def calculate_similarity(self, source_text: str, candidate_texts: list) -> list:
        """
        Calculates similarity scores (0.0 to 1.0) between a source text and a list of candidate texts.
        """
        if not candidate_texts or not source_text:
            return [0.0] * len(candidate_texts)
            
        if self.use_transformer:
            try:
                source_emb = self.model.encode([source_text])
                cand_embs = self.model.encode(candidate_texts)
                sims = cosine_similarity(source_emb, cand_embs)[0]
                return [float(np.clip(s, 0.0, 1.0)) for s in sims]
            except Exception as e:
                logging.error(f"Error during SentenceTransformer inference: {e}")
                
        # TF-IDF Fallback
        try:
            corpus = [source_text] + candidate_texts
            tfidf_matrix = self.vectorizer.fit_transform(corpus)
            sims = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
            return [float(np.clip(s, 0.0, 1.0)) for s in sims]
        except Exception as e:
            logging.error(f"Error during TF-IDF calculation: {e}")
            return [0.5] * len(candidate_texts)

semantic_engine = SemanticEngine()
