import openai
from django.conf import settings
from documents.models import Document, ExtractedText
from .models import RiskAnalysis
import logging
import time
import random

logger = logging.getLogger(__name__)

class AIDocumentChat:
    """AI-powered chat with documents using latest OpenAI API"""
    
    def __init__(self):
        self.api_key = getattr(settings, 'OPENAI_API_KEY', None)
        self.client = None
        self.model = "gpt-3.5-turbo"
        self.last_request_time = 0
        self.min_request_interval = 2
        self.use_fallback = False
        
        # Initialize client only if API key exists
        if self.api_key and self.api_key != 'your-api-key-here':
            try:
                self.client = openai.OpenAI(api_key=self.api_key)
                logger.info("✅ OpenAI client initialized")
            except Exception as e:
                logger.error(f"❌ Failed to initialize OpenAI client: {e}")
                self.use_fallback = True
        else:
            logger.warning("⚠️ No OpenAI API key found. Using fallback mode.")
            self.use_fallback = True
    
    def _check_rate_limit(self):
        """Implement simple rate limiting"""
        if self.use_fallback:
            return
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.min_request_interval:
            time_to_wait = self.min_request_interval - time_since_last
            time.sleep(time_to_wait)
        self.last_request_time = time.time()
    
    def _get_fallback_summary(self, document):
        """Generate a simple fallback summary without OpenAI"""
        risks = RiskAnalysis.objects.filter(document=document)
        risk_count = risks.count()
        
        if risk_count == 0:
            return "No risks detected in this document."
        
        # Group risks by category
        categories = {}
        for risk in risks:
            cat = risk.get_category_display()
            categories[cat] = categories.get(cat, 0) + 1
        
        summary = f"📊 Document Analysis Summary:\n"
        summary += f"• Total Risks Found: {risk_count}\n"
        summary += f"• Risk Categories:\n"
        for cat, count in categories.items():
            summary += f"  - {cat}: {count}\n"
        
        # Add top critical risks
        critical = risks.filter(risk_level='CRITICAL')[:2]
        if critical:
            summary += f"\n⚠️ Top Critical Risks:\n"
            for risk in critical:
                summary += f"  • {risk.clause_text[:100]}...\n"
        
        return summary
    
    def _get_fallback_answer(self, question, document):
        """Generate a simple fallback answer without OpenAI"""
        question_lower = question.lower()
        
        if 'risk' in question_lower:
            risks = RiskAnalysis.objects.filter(document=document)
            if risks.exists():
                categories = risks.values_list('category', flat=True).distinct()
                return f"I found {risks.count()} risks in this document across {len(categories)} categories: {', '.join(categories)}. Check the risk list above for details."
            else:
                return "No risks were detected in this document."
        
        elif 'summary' in question_lower or 'about' in question_lower:
            return f"This document is titled '{document.title}'. It was uploaded on {document.uploaded_at.strftime('%B %d, %Y')}. Use the AI Summary button for a detailed analysis."
        
        elif 'hello' in question_lower or 'hi' in question_lower:
            return "Hello! I'm your document assistant. You can ask me about risks, summary, or specific content in this document."
        
        else:
            return f"I'm in fallback mode (OpenAI API not configured). For detailed answers, please set up your OpenAI API key. Basic info: This document has {RiskAnalysis.objects.filter(document=document).count()} detected risks."
    
    def chat_with_document(self, document_id, user_question):
        """Chat with a specific document using AI or fallback"""
        try:
            document = Document.objects.get(id=document_id)
            
            # Use fallback if OpenAI is not available
            if self.use_fallback:
                return {
                    'success': True,
                    'answer': self._get_fallback_answer(user_question, document),
                    'document_id': str(document.id),
                    'mode': 'fallback'
                }
            
            # Apply rate limiting
            self._check_rate_limit()
            
            # Get document text and risks
            extracted_text = ExtractedText.objects.get(document=document)
            risks = RiskAnalysis.objects.filter(document=document)
            
            # Prepare context
            context = f"""
            Document Title: {document.title}
            Document Type: {document.get_document_type_display()}
            
            Document Content:
            {extracted_text.raw_text[:2000]}
            
            Detected Risks:
            {self.format_risks(risks)}
            """
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful document analysis assistant. Answer questions based ONLY on the document content provided. Be concise."},
                    {"role": "user", "content": f"Context: {context}\n\nQuestion: {user_question}"}
                ],
                temperature=0.7,
                max_tokens=250,
                timeout=30
            )
            
            return {
                'success': True,
                'answer': response.choices[0].message.content,
                'document_id': str(document.id),
                'mode': 'openai'
            }
            
        except Document.DoesNotExist:
            return {'success': False, 'error': 'Document not found'}
        except ExtractedText.DoesNotExist:
            return {'success': False, 'error': 'Document text not extracted yet'}
        except openai.RateLimitError:
            return {'success': False, 'error': 'OpenAI rate limit reached. Using fallback mode.', 'use_fallback': True}
        except Exception as e:
            logger.error(f"AI Chat Error: {str(e)}")
            # Switch to fallback mode for next requests
            self.use_fallback = True
            return {
                'success': True,
                'answer': self._get_fallback_answer(user_question, document),
                'document_id': str(document.id),
                'mode': 'fallback',
                'warning': 'OpenAI unavailable, using basic mode'
            }
    
    def format_risks(self, risks):
        """Format risks for context"""
        if not risks:
            return "No risks detected."
        
        formatted = []
        for risk in risks[:5]:
            formatted.append(f"- {risk.get_category_display()} ({risk.risk_level}): {risk.clause_text[:100]}...")
        
        return "\n".join(formatted)
    
    def generate_summary(self, document_id):
        """Generate AI summary of document with fallback"""
        try:
            document = Document.objects.get(id=document_id)
            
            # Use fallback if OpenAI is not available
            if self.use_fallback:
                return {
                    'success': True,
                    'summary': self._get_fallback_summary(document),
                    'document_id': str(document.id),
                    'mode': 'fallback'
                }
            
            # Apply rate limiting
            self._check_rate_limit()
            
            extracted_text = ExtractedText.objects.get(document=document)
            text_to_summarize = extracted_text.raw_text[:1500]
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Summarize this document in 3-4 bullet points. Be concise."},
                    {"role": "user", "content": text_to_summarize}
                ],
                temperature=0.5,
                max_tokens=200,
                timeout=20
            )
            
            return {
                'success': True,
                'summary': response.choices[0].message.content,
                'document_id': str(document.id),
                'mode': 'openai'
            }
            
        except openai.RateLimitError:
            return {
                'success': True,
                'summary': self._get_fallback_summary(document),
                'document_id': str(document.id),
                'mode': 'fallback',
                'warning': 'Rate limit reached, using basic summary'
            }
        except Exception as e:
            logger.error(f"AI Summary Error: {str(e)}")
            return {
                'success': True,
                'summary': self._get_fallback_summary(document),
                'document_id': str(document.id),
                'mode': 'fallback'
            }