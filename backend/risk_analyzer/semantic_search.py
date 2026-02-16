from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
from documents.models import Document, ExtractedText
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)

class SemanticSearch:
    """Semantic search for documents using embeddings"""
    
    def __init__(self):
        # Load model for embeddings
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.index = None
        self.documents_cache = []
        self.embeddings_cache = []
        
    def build_index(self, user_id=None):
        """Build FAISS index for user's documents"""
        try:
            # Get documents
            documents = Document.objects.all()
            if user_id:
                documents = documents.filter(user_id=user_id)
            
            documents = documents.filter(status='COMPLETED')
            
            if not documents:
                return False
            
            # Get text for each document
            texts = []
            self.documents_cache = []
            
            for doc in documents:
                try:
                    extracted = ExtractedText.objects.get(document=doc)
                    texts.append(extracted.raw_text[:1000])  # Limit length
                    self.documents_cache.append({
                        'id': str(doc.id),
                        'title': doc.title,
                        'type': doc.get_document_type_display(),
                        'date': doc.uploaded_at.isoformat()
                    })
                except ExtractedText.DoesNotExist:
                    continue
            
            if not texts:
                return False
            
            # Generate embeddings
            embeddings = self.model.encode(texts)
            self.embeddings_cache = embeddings
            
            # Build FAISS index
            dimension = embeddings.shape[1]
            self.index = faiss.IndexFlatIP(dimension)  # Inner product for cosine similarity
            self.index.add(embeddings.astype('float32'))
            
            logger.info(f"✅ Built semantic index with {len(texts)} documents")
            return True
            
        except Exception as e:
            logger.error(f"Error building index: {str(e)}")
            return False
    
    def search(self, query, top_k=5):
        """Search for semantically similar documents"""
        try:
            if self.index is None or self.index.ntotal == 0:
                return []
            
            # Generate query embedding
            query_embedding = self.model.encode([query])
            
            # Search
            scores, indices = self.index.search(
                query_embedding.astype('float32'), 
                min(top_k, self.index.ntotal)
            )
            
            # Format results
            results = []
            for i, idx in enumerate(indices[0]):
                if idx < len(self.documents_cache):
                    results.append({
                        **self.documents_cache[idx],
                        'similarity': float(scores[0][i] * 100),
                        'relevance': 'high' if scores[0][i] > 0.7 else 'medium' if scores[0][i] > 0.5 else 'low'
                    })
            
            return sorted(results, key=lambda x: x['similarity'], reverse=True)
            
        except Exception as e:
            logger.error(f"Search error: {str(e)}")
            return []
    
    def find_similar(self, document_id, top_k=3):
        """Find documents similar to a given document"""
        try:
            # Find document index
            doc_idx = None
            for i, doc in enumerate(self.documents_cache):
                if doc['id'] == document_id:
                    doc_idx = i
                    break
            
            if doc_idx is None:
                return []
            
            # Get document embedding
            doc_embedding = self.embeddings_cache[doc_idx].reshape(1, -1)
            
            # Search
            scores, indices = self.index.search(
                doc_embedding.astype('float32'),
                min(top_k + 1, self.index.ntotal)  # +1 to exclude the document itself
            )
            
            # Format results (skip first result which is the document itself)
            results = []
            for i, idx in enumerate(indices[0]):
                if idx != doc_idx and idx < len(self.documents_cache):
                    results.append({
                        **self.documents_cache[idx],
                        'similarity': float(scores[0][i] * 100),
                        'relevance': 'high' if scores[0][i] > 0.7 else 'medium' if scores[0][i] > 0.5 else 'low'
                    })
                    if len(results) >= top_k:
                        break
            
            return results
            
        except Exception as e:
            logger.error(f"Find similar error: {str(e)}")
            return []