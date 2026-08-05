import math
import logging

logger = logging.getLogger(__name__)

# Try importing SentenceTransformers
HAS_ST = False
try:
    from sentence_transformers import SentenceTransformer
    import numpy as np
    # Initialize the model lazily
    _model = None
    HAS_ST = True
    logger.info("SentenceTransformers successfully detected in virtual environment.")
except ImportError:
    logger.info("SentenceTransformers not found or failed to load. Operating in resilient TF-IDF Cosine Similarity Mode.")

# Standard list of english stop words to refine TF-IDF relevance
STOP_WORDS = {
    "the", "is", "and", "of", "to", "in", "a", "for", "on", "with", "at", "by", "as", 
    "an", "this", "that", "it", "are", "from", "be", "was", "or", "an", "the", "their",
    "will", "can", "our", "we", "your", "you", "he", "she", "they", "them"
}

def tokenize(text: str) -> list:
    """Helper to clean, lowercase, and tokenize document texts."""
    if not text:
        return []
    words = text.lower().replace(".", " ").replace(",", " ").replace("-", " ").replace(":", " ").split()
    return [w for w in words if w not in STOP_WORDS and len(w) > 1]

class ResilientTFIDFSimilarity:
    """Pure Python TF-IDF Vectorizer and Cosine Similarity Engine."""
    def __init__(self, corpus: list):
        # corpus is list of strings
        self.doc_tokens = [tokenize(doc) for doc in corpus]
        self.num_docs = len(corpus)
        
        # Calculate document frequency (DF) for each word
        self.df = {}
        for doc in self.doc_tokens:
            unique_words = set(doc)
            for word in unique_words:
                self.df[word] = self.df.get(word, 0) + 1
                
        # Calculate IDF
        self.idf = {}
        for word, count in self.df.items():
            self.idf[word] = math.log(1 + (self.num_docs / (1 + count)))

    def get_tfidf_vector(self, text: str) -> dict:
        """Construct TF-IDF weight dictionary for input text."""
        tokens = tokenize(text)
        if not tokens:
            return {}
            
        tf = {}
        for word in tokens:
            tf[word] = tf.get(word, 0) + 1
            
        vector = {}
        for word, count in tf.items():
            if word in self.idf:
                vector[word] = count * self.idf[word]
        return vector

    def cosine_similarity(self, vec1: dict, vec2: dict) -> float:
        """Compute cosine similarity score between two weight dictionaries."""
        if not vec1 or not vec2:
            return 0.0
            
        # Dot product
        dot_product = 0.0
        for word, val in vec1.items():
            if word in vec2:
                dot_product += val * vec2[word]
                
        # Magnitudes
        mag1 = math.sqrt(sum(val ** 2 for val in vec1.values()))
        mag2 = math.sqrt(sum(val ** 2 for val in vec2.values()))
        
        if mag1 == 0 or mag2 == 0:
            return 0.0
            
        return dot_product / (mag1 * mag2)

def calculate_ml_recommendations(profile_text: str, candidates: list, text_extractor, top_n: int = 10) -> list:
    """
    Computes cosine similarity between user profile text and a list of candidates.
    Matches using SentenceTransformers if available, otherwise falls back to pure TF-IDF.
    """
    if not candidates:
        return []
        
    global HAS_ST, _model
    
    # Try SentenceTransformers first
    if HAS_ST:
        try:
            if _model is None:
                logger.info("Initializing SentenceTransformer model 'all-MiniLM-L6-v2'...")
                _model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Encode user profile
            user_vector = _model.encode(profile_text, convert_to_numpy=True)
            
            # Encode candidate items
            candidate_texts = [text_extractor(c) for c in candidates]
            candidate_vectors = _model.encode(candidate_texts, convert_to_numpy=True)
            
            # Cosine similarity matrix multiplication
            dot = np.dot(candidate_vectors, user_vector)
            norm_c = np.linalg.norm(candidate_vectors, axis=1)
            norm_u = np.linalg.norm(user_vector)
            
            similarities = dot / (norm_c * norm_u + 1e-9)
            
            scored_candidates = []
            for idx, score in enumerate(similarities):
                scored_candidates.append((candidates[idx], float(score)))
                
            scored_candidates.sort(key=lambda x: x[1], reverse=True)
            return [item for item, score in scored_candidates[:top_n]]
            
        except Exception as e:
            logger.error(f"SentenceTransformers evaluation failed, falling back to TF-IDF: {e}")
            
    # Resilient TF-IDF Fallback
    try:
        corpus = [profile_text] + [text_extractor(c) for c in candidates]
        engine = ResilientTFIDFSimilarity(corpus)
        
        profile_vec = engine.get_tfidf_vector(profile_text)
        scored_candidates = []
        
        for idx, cand in enumerate(candidates):
            cand_text = text_extractor(cand)
            cand_vec = engine.get_tfidf_vector(cand_text)
            similarity = engine.cosine_similarity(profile_vec, cand_vec)
            scored_candidates.append((cand, similarity))
            
        scored_candidates.sort(key=lambda x: x[1], reverse=True)
        return [item for item, score in scored_candidates[:top_n]]
        
    except Exception as e:
        logger.error(f"Resilient TF-IDF Matching failed: {e}")
        # Final fallback - return original list up to top_n
        return candidates[:top_n]
