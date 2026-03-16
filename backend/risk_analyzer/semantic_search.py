from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
from documents.models import Document, ExtractedText
import logging
import traceback

logger = logging.getLogger(__name__)

class SemanticSearch:
    """Semantic search for documents using embeddings"""
    
    def __init__(self):
        self.model = None
        self.index = None
        self.documents_cache = []
        self.embeddings_cache = []
        self.is_initialized = False  # ✅ Fixed attribute name
        
        try:
            logger.info("Loading SentenceTransformer model...")
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            self.is_initialized = True
            logger.info("✅ SemanticSearch initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            self.is_initialized = False
    
    def build_index(self, user_id=None):
        if not self.is_initialized:
            return False
            
        try:
            # Get documents
            docs = Document.objects.filter(status='COMPLETED')
            if user_id:
                docs = docs.filter(user_id=user_id)
            
            texts = []
            self.documents_cache = []
            
            for doc in docs:
                try:
                    extracted = ExtractedText.objects.get(document=doc)
                    if extracted.raw_text and len(extracted.raw_text) > 50:
                        texts.append(extracted.raw_text[:1000])
                        self.documents_cache.append({
                            'id': str(doc.id),
                            'title': doc.title,
                            'type': doc.get_document_type_display(),
                            'date': doc.uploaded_at.isoformat()
                        })
                except:
                    continue
            
            if not texts:
                return False
            
            # Generate embeddings
            embeddings = self.model.encode(texts)
            self.embeddings_cache = embeddings
            
            # Build index
            dimension = embeddings.shape[1]
            self.index = faiss.IndexFlatIP(dimension)
            self.index.add(embeddings.astype('float32'))
            
            logger.info(f"✅ Index built with {len(texts)} documents")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error building index: {e}")
            return False
    
    def search(self, query, top_k=5):
        if not self.is_initialized or self.index is None or self.index.ntotal == 0:
            return []
            
        try:
            query_vec = self.model.encode([query])
            scores, indices = self.index.search(query_vec.astype('float32'), min(top_k, self.index.ntotal))
            
            results = []
            for i, idx in enumerate(indices[0]):
                if idx < len(self.documents_cache):
                    results.append({
                        **self.documents_cache[idx],
                        'similarity': round(float(scores[0][i] * 100), 1)
                    })
            return results
        except Exception as e:
            logger.error(f"❌ Search error: {e}")
            return []
    
    def find_similar(self, doc_id, top_k=3):
        if not self.is_initialized or self.index is None:
            return []
            
        try:
            # Find index of document
            doc_idx = None
            for i, doc in enumerate(self.documents_cache):
                if doc['id'] == doc_id:
                    doc_idx = i
                    break
            
            if doc_idx is None:
                return []
            
            doc_vec = self.embeddings_cache[doc_idx].reshape(1, -1)
            scores, indices = self.index.search(doc_vec.astype('float32'), min(top_k + 1, self.index.ntotal))
            
            results = []
            for i, idx in enumerate(indices[0]):
                if idx != doc_idx and idx < len(self.documents_cache):
                    results.append({
                        **self.documents_cache[idx],
                        'similarity': round(float(scores[0][i] * 100), 1)
                    })
                    if len(results) >= top_k:
                        break
            return results
        except Exception as e:
            logger.error(f"❌ Find similar error: {e}")
            return []