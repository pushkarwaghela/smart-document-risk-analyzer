from google import genai
from django.conf import settings
from documents.models import Document, ExtractedText
from .models import RiskAnalysis
import logging
import time

logger = logging.getLogger(__name__)

class GeminiChat:
    """AI-powered chat using Google's Gemini API"""
    
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        
        if not self.api_key:
            logger.error("❌ GEMINI_API_KEY not found in settings")
            raise ValueError("GEMINI_API_KEY not configured")
        
        # Configure Gemini client
        self.client = genai.Client(api_key=self.api_key)
        
        # Use a known working model from the list
        self.model = "models/gemini-2.5-flash"  # Latest stable model
        
        logger.info(f"✅ Using Gemini model: {self.model}")
        self.last_request_time = 0
        self.min_request_interval = 1
    
    def _check_rate_limit(self):
        """Simple rate limiting"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.min_request_interval:
            time.sleep(self.min_request_interval - time_since_last)
        self.last_request_time = time.time()
    
    def format_risks(self, risks):
        """Format risks for context"""
        if not risks:
            return "No risks detected in this document."
        
        formatted = []
        for risk in risks[:5]:
            formatted.append(f"- {risk.get_category_display()} ({risk.risk_level})")
        
        return "\n".join(formatted)
    
    def chat_with_document(self, document_id, user_question):
        """Chat with a specific document"""
        try:
            self._check_rate_limit()
            
            document = Document.objects.get(id=document_id)
            extracted_text = ExtractedText.objects.get(document=document)
            risks = RiskAnalysis.objects.filter(document=document)
            
            # Prepare context
            context = f"""
Document Title: {document.title}
Document Type: {document.get_document_type_display()}

Document Content:
{extracted_text.raw_text[:1500]}

Detected Risks:
{self.format_risks(risks)}
"""
            
            prompt = f"""You are a document analysis assistant. Answer based ONLY on this document:

{context}

Question: {user_question}

Answer concisely:"""
            
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt
            )
            
            return {
                'success': True,
                'answer': response.text,
                'document_id': str(document.id)
            }
            
        except Document.DoesNotExist:
            return {'success': False, 'error': 'Document not found'}
        except Exception as e:
            logger.error(f"Gemini Chat Error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def generate_summary(self, document_id):
        """Generate AI summary of document"""
        try:
            self._check_rate_limit()
            
            document = Document.objects.get(id=document_id)
            extracted_text = ExtractedText.objects.get(document=document)
            
            prompt = f"""Summarize this document in 3-5 bullet points. Focus on the main topic and key points.

Document:
{extracted_text.raw_text[:1500]}

Summary:"""
            
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt
            )
            
            return {
                'success': True,
                'summary': response.text,
                'document_id': str(document.id)
            }
            
        except Exception as e:
            logger.error(f"Gemini Summary Error: {str(e)}")
            return {'success': False, 'error': str(e)}