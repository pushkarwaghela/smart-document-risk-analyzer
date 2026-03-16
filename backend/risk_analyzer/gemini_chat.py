from google import genai
from django.conf import settings
from documents.models import Document, ExtractedText
from .models import RiskAnalysis
import logging
import time
import random

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
        
        # Use the models we confirmed are available
        self.model = self._find_working_model()
        
        if not self.model:
            error_msg = "❌ No working Gemini model found. Please check your API key and permissions."
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        logger.info(f"✅ Using Gemini model: {self.model}")
        self.last_request_time = 0
        self.min_request_interval = 2
        self.max_retries = 3
        self.base_delay = 2
    
    def _find_working_model(self):
        """Use the confirmed working models from our list"""
        # These are the models we confirmed are available
        preferred_models = [
            'models/gemini-2.5-flash',      # Fast, latest
            'models/gemini-2.5-pro',        # Pro version
            'models/gemini-2.0-flash',      # Reliable fallback
            'models/gemini-2.0-flash-001',  # Stable version
            'models/gemini-flash-latest',    # Latest flash
            'models/gemini-pro-latest',      # Latest pro
        ]
        
        # Return the first one (preferred)
        return preferred_models[0]
    
    def _check_rate_limit(self):
        """Simple rate limiting"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.min_request_interval:
            time.sleep(self.min_request_interval - time_since_last)
        self.last_request_time = time.time()
    
    def _call_with_retry(self, func, *args, **kwargs):
        """Call a function with exponential backoff retry"""
        for attempt in range(self.max_retries):
            try:
                self._check_rate_limit()
                return func(*args, **kwargs)
            except Exception as e:
                error_str = str(e)
                if '429' in error_str or 'RESOURCE_EXHAUSTED' in error_str:
                    wait_time = (self.base_delay ** attempt) + random.random()
                    logger.warning(f"⚠️ Rate limit hit, waiting {wait_time:.1f}s (attempt {attempt+1}/{self.max_retries})")
                    time.sleep(wait_time)
                    
                    # Try a different model on subsequent attempts
                    if attempt > 0:
                        alternative_models = [
                            'models/gemini-2.5-flash',
                            'models/gemini-2.0-flash',
                            'models/gemini-2.0-flash-001',
                            'models/gemini-flash-latest',
                        ]
                        for alt_model in alternative_models:
                            if alt_model != self.model:
                                logger.info(f"🔄 Switching to alternative model: {alt_model}")
                                self.model = alt_model
                                break
                else:
                    # Non-rate-limit error, re-raise
                    raise
        raise Exception(f"Failed after {self.max_retries} retries")
    
    def format_risks(self, risks):
        """Format risks for context"""
        if not risks:
            return "No risks detected in this document."
        
        formatted = []
        for risk in risks[:5]:
            formatted.append(f"- {risk.get_category_display()} ({risk.risk_level})")
        
        return "\n".join(formatted)
    
    def _build_prompt(self, document, extracted_text, risks, user_question=None):
        """Build prompt for Gemini"""
        base = f"""
Document Title: {document.title}
Document Type: {document.get_document_type_display()}
Upload Date: {document.uploaded_at.strftime('%Y-%m-%d')}

Document Content:
{extracted_text.raw_text[:1500]}

Detected Risks:
{self.format_risks(risks)}

Instructions: Answer based ONLY on the document content above. Be concise and accurate.
"""
        
        if user_question:
            return f"""{base}

Question: {user_question}

Answer:"""
        else:
            return f"""{base}

Summarize this document in 3-5 bullet points. Focus on the main topic and key points.

Summary (3-5 bullet points):"""
    
    def chat_with_document(self, document_id, user_question):
        """Chat with a specific document with retry logic"""
        try:
            document = Document.objects.get(id=document_id)
            extracted_text = ExtractedText.objects.get(document=document)
            risks = RiskAnalysis.objects.filter(document=document)
            
            prompt = self._build_prompt(document, extracted_text, risks, user_question)
            
            def make_request():
                return self.client.models.generate_content(
                    model=self.model,
                    contents=prompt
                )
            
            response = self._call_with_retry(make_request)
            
            return {
                'success': True,
                'answer': response.text,
                'document_id': str(document.id),
                'model': self.model
            }
            
        except Document.DoesNotExist:
            return {'success': False, 'error': 'Document not found'}
        except ExtractedText.DoesNotExist:
            return {'success': False, 'error': 'Document text not extracted yet'}
        except Exception as e:
            logger.error(f"❌ Gemini Chat Error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def generate_summary(self, document_id):
        """Generate AI summary of document with retry logic"""
        try:
            document = Document.objects.get(id=document_id)
            extracted_text = ExtractedText.objects.get(document=document)
            risks = RiskAnalysis.objects.filter(document=document)
            
            prompt = self._build_prompt(document, extracted_text, risks)
            
            def make_request():
                return self.client.models.generate_content(
                    model=self.model,
                    contents=prompt
                )
            
            response = self._call_with_retry(make_request)
            
            return {
                'success': True,
                'summary': response.text,
                'document_id': str(document.id),
                'model': self.model
            }
            
        except Exception as e:
            logger.error(f"❌ Gemini Summary Error: {str(e)}")
            return {'success': False, 'error': str(e)}