from typing import Dict, List, Any, Optional
import os
import re
import cv2
import numpy as np
import pytesseract
from PIL import Image
import spacy
from pdf2image import convert_from_path
from django.conf import settings
from documents.models import Document, ExtractedText
from .models import RiskAnalysis
import logging
import hashlib
from django.core.cache import cache
import traceback  # ✅ ADD THIS!

logger = logging.getLogger(__name__)  # ✅ This should already be there

class ImagePreprocessor:
    """Advanced image preprocessing for better OCR accuracy"""
    
    @staticmethod
    def preprocess_image(image_path: str) -> Optional[np.ndarray]:
        """Apply multiple preprocessing techniques to improve OCR accuracy"""
        try:
            # Read image
            img = cv2.imread(image_path)
            if img is None:
                # Try with PIL if OpenCV fails
                pil_img = Image.open(image_path)
                img = np.array(pil_img)
            
            # Convert to grayscale
            if len(img.shape) == 3:
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            else:
                gray = img
            
            # Apply adaptive thresholding for better text detection
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Denoise
            denoised = cv2.fastNlMeansDenoising(thresh)
            
            # Apply dilation to connect text components
            kernel = np.ones((1, 1), np.uint8)
            dilated = cv2.dilate(denoised, kernel, iterations=1)
            
            return dilated
        except Exception as e:
            logger.error(f"Image preprocessing error: {str(e)}")
            return None


class OCRService:
    """OCR service using Tesseract with advanced preprocessing"""
    
    def __init__(self):
        # Configure Tesseract path for Windows
        if os.name == 'nt':
            possible_paths = [
                r'C:\Program Files\Tesseract-OCR\tesseract.exe',
                r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
                r'Tesseract-OCR\tesseract.exe',
                'tesseract'
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    pytesseract.pytesseract.tesseract_cmd = path
                    print(f"âœ… Tesseract found at: {path}")
                    break
    
    def extract_text_from_image(self, image_path: str) -> Dict[str, Any]:
        """Extract text from image with confidence score"""
        try:
            # Preprocess image
            preprocessor = ImagePreprocessor()
            processed_img = preprocessor.preprocess_image(image_path)
            
            if processed_img is None:
                return {'text': '', 'confidence': 0, 'success': False}
            
            # OCR configuration - optimized for document text
            custom_config = r'--oem 3 --psm 6 -c preserve_interword_spaces=1'
            
            # Extract text
            text = pytesseract.image_to_string(processed_img, config=custom_config)
            
            # Get confidence scores
            try:
                data = pytesseract.image_to_data(processed_img, output_type=pytesseract.Output.DICT)
                confidences = [int(conf) for conf in data['conf'] if conf != '-1']
                avg_confidence = sum(confidences) / len(confidences) if confidences else 75
            except:
                avg_confidence = 75.0
            
            return {
                'text': text.strip(),
                'confidence': round(avg_confidence, 2),
                'success': True
            }
        except Exception as e:
            logger.error(f"OCR Error: {str(e)}")
            return {'text': '', 'confidence': 0, 'success': False, 'error': str(e)}
    
    def extract_text_from_pdf(self, pdf_path):
        """Extract text from PDF by converting pages to images"""
        try:
            print(f"📑 Converting PDF to images: {pdf_path}")
            
            # Convert PDF to images
            images = convert_from_path(pdf_path, dpi=300)
            print(f"✅ PDF converted to {len(images)} pages")
            
            full_text = ""
            confidences = []
            
            for i, image in enumerate(images):
                print(f"   Processing page {i+1}/{len(images)}...")
                
                # ✅ FIX: Use Windows temp directory instead of /tmp/
                import tempfile
                temp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
                temp_path = temp_file.name
                temp_file.close()
                
                image.save(temp_path, 'JPEG')
                
                # Extract text from image
                result = self.extract_text_from_image(temp_path)
                full_text += f"\n--- Page {i+1} ---\n{result['text']}\n"
                confidences.append(result['confidence'])
                
                # Cleanup
                try:
                    os.remove(temp_path)
                    print(f"   ✅ Cleaned up temp file: {temp_path}")
                except Exception as cleanup_error:
                    print(f"   ⚠️ Could not delete temp file: {cleanup_error}")
            
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return {
                'text': full_text.strip(),
                'confidence': round(avg_confidence, 2),
                'success': True
            }
        except Exception as e:
            logger.error(f"PDF OCR Error: {str(e)}")
            traceback.print_exc()
            return {'text': '', 'confidence': 0, 'success': False, 'error': str(e)}
    

class RiskAnalyzer:
    """Risk analysis service using NLP and keyword matching - FIXED: No duplicates"""

    def __init__(self):
        # Load spaCy model
        try:
            self.nlp = spacy.load('en_core_web_sm')
            print("✅ spaCy model loaded successfully")
        except:
            print("⚠️ spaCy model not found. Downloading...")
            os.system('python -m spacy download en_core_web_sm')
            self.nlp = spacy.load('en_core_web_sm')

        # Comprehensive risk keywords by category
        self.risk_keywords = {
            'FINANCIAL': [
                'payment', 'fee', 'charge', 'cost', 'price', 'refund', 'credit', 'debit',
                'bank', 'account', 'financial', 'money', 'dollar', 'euro', 'currency',
                'interest', 'late fee', 'penalty', 'subscription fee', 'annual fee',
                'processing fee', 'transaction', 'billing', 'invoice', 'pay', 'paid',
                'deposit', 'withdrawal', 'balance', 'overdraft', 'finance charge',
                'apr', 'interest rate', 'monthly fee', 'service fee', 'cancellation fee'
            ],
            'PRIVACY': [
                'privacy', 'personal', 'data', 'information', 'collect', 'share',
                'third party', 'cookie', 'track', 'gdpr', 'ccpa', 'consent', 'opt-out',
                'opt-in', 'personal information', 'personally identifiable', 'pii',
                'data protection', 'data processing', 'data controller', 'data subject',
                'biometric', 'location data', 'browsing history', 'device information',
                'advertising', 'marketing', 'sell data', 'disclose', 'transfer'
            ],
            'LEGAL': [
                'law', 'legal', 'court', 'jurisdiction', 'arbitration', 'lawsuit',
                'comply', 'regulation', 'governing', 'rights', 'dispute', 'indemnify',
                'liability', 'indemnification', 'warranty', 'disclaimer', 'governing law',
                'venue', 'class action', 'binding', 'arbitrator', 'attorney', 'sue',
                'litigation', 'statute', 'compliance', 'regulatory', 'enforce',
                'waiver', 'severability', 'force majeure', 'assignment'
            ],
            'SUBSCRIPTION': [
                'subscription', 'renew', 'cancel', 'monthly', 'annual', 'term',
                'auto-renew', 'trial', 'expire', 'recurring', 'automatic renewal',
                'cancel anytime', 'billing cycle', 'membership', 'plan', 'upgrade',
                'downgrade', 'termination', 'suspend', 'refund policy',
                'free trial', 'introductory offer', 'promotional rate', 'price increase',
                'notice period', 'cancellation period', 'renewal notice'
            ]
        }

        # Risk level thresholds
        self.risk_thresholds = {
            'CRITICAL': 4,
            'HIGH': 3,
            'MEDIUM': 2,
            'LOW': 1
        }

    def analyze_text(self, text: str) -> List[Dict[str, Any]]:
        """Analyze text for risks using NLP and keyword matching - NO DUPLICATES"""
        risks = []
        
        if not text or len(text.strip()) < 20:
            return risks

        # Process text with spaCy
        doc = self.nlp(text[:15000])
        
        # Get all sentences
        all_sentences = [sent.text.strip() for sent in doc.sents]
        print(f"📝 Raw sentences from spaCy: {len(all_sentences)}")
        
        # Deduplicate sentences using normalized text
        unique_sentences = []
        seen_sentences = set()
        
        for sentence in all_sentences:
            if len(sentence) < 20:
                continue
                
            # Create normalized version (lowercase, remove extra spaces)
            normalized = ' '.join(sentence.lower().split())
            
            # Skip if we've seen this sentence before
            if normalized in seen_sentences:
                continue
                
            seen_sentences.add(normalized)
            unique_sentences.append(sentence)
        
        print(f"🎯 Unique sentences after deduplication: {len(unique_sentences)}")

        # Track risks by normalized sentence to prevent duplicates
        seen_risks = set()

        for sentence in unique_sentences:
            sentence_lower = ' '.join(sentence.lower().split())

            # Check each risk category
            for category, keywords in self.risk_keywords.items():
                matches = []
                for keyword in keywords:
                    if keyword in sentence_lower:
                        matches.append(keyword)

                # If enough keywords match, classify as risk
                if len(matches) >= self.risk_thresholds['MEDIUM']:
                    # Determine risk level based on number of matches
                    if len(matches) >= self.risk_thresholds['CRITICAL']:
                        risk_level = 'CRITICAL'
                    elif len(matches) >= self.risk_thresholds['HIGH']:
                        risk_level = 'HIGH'
                    else:
                        risk_level = 'MEDIUM'

                    # Calculate confidence score
                    confidence = min(len(matches) * 20, 95)
                    
                    # Create unique key for this risk (category + normalized sentence)
                    risk_key = f"{category}_{sentence_lower[:200]}"
                    
                    # Skip if we've already added this exact risk
                    if risk_key in seen_risks:
                        continue
                        
                    seen_risks.add(risk_key)

                    risks.append({
                        'category': category,
                        'risk_level': risk_level,
                        'clause_text': sentence[:500],
                        'explanation': f"Detected {len(matches)} risk indicators: {', '.join(matches[:5])}",
                        'page_number': 1,
                        'confidence': confidence,
                        'keywords_found': matches[:5]
                    })
                    
                    # Once we classify a sentence, move to next sentence
                    # (prevents same sentence being classified under multiple categories)
                    break

        print(f"✅ Final unique risks: {len(risks)}")
        return risks


class DocumentAnalysisService:
    """Main service for document analysis with OCR and risk detection"""
    
    def __init__(self):
        self.ocr_service = OCRService()
        self.risk_analyzer = RiskAnalyzer()
        print("âœ… DocumentAnalysisService initialized")
    
    def process_document(self, document):
        """
        Complete document processing pipeline
        This is the MAIN method called by views.py - DO NOT RENAME!
        """
        try:
            print(f"\n{'='*60}")
            print(f"🚀 PROCESSING DOCUMENT: {document.id}")
            print(f"{'='*60}")
            print(f"📄 Title: {document.title}")
            print(f"📁 Type: {document.document_type}")
            
            # Update document status
            document.status = 'PROCESSING'
            document.save()
            print(f"✅ Status updated to: PROCESSING")
            
            # Get file path
            file_path = document.file.path
            print(f"📁 File path: {file_path}")
            
            # Check if file exists
            if not os.path.exists(file_path):
                error_msg = f"❌ File not found: {file_path}"
                print(error_msg)
                raise FileNotFoundError(error_msg)
            
            print(f"✅ File exists: {os.path.getsize(file_path)} bytes")
            
            # Extract text based on file type
            file_extension = os.path.splitext(file_path)[1].lower()
            print(f"📄 File extension: {file_extension}")
            
            print("🔍 Starting OCR extraction...")
            
            if file_extension in ['.jpg', '.jpeg', '.png', '.tiff', '.bmp', '.webp']:
                print("🖼️ Processing as image file...")
                ocr_result = self.ocr_service.extract_text_from_image(file_path)
            elif file_extension == '.pdf':
                print("📑 Processing as PDF file...")
                ocr_result = self.ocr_service.extract_text_from_pdf(file_path)
            elif file_extension == '.txt':
                print("📝 Processing as text file...")
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
                ocr_result = {
                    'text': text,
                    'confidence': 100.0,
                    'success': True
                }
            else:
                print("🖼️ Trying as image file...")
                ocr_result = self.ocr_service.extract_text_from_image(file_path)
            
            # Check if OCR was successful
            if not ocr_result.get('success', False):
                error_msg = ocr_result.get('error', 'OCR extraction failed')
                print(f"❌ OCR failed: {error_msg}")
                raise Exception(error_msg)
            
            text = ocr_result['text']
            print(f"✅ OCR completed. Extracted {len(text)} characters")
            print(f"📊 OCR Confidence: {ocr_result['confidence']}%")
            
            # Preview first 200 characters
            preview = text[:200].replace('\n', ' ').strip()
            print(f"📝 Text preview: {preview}...")
            
            # Save extracted text to database
            extracted_text, created = ExtractedText.objects.update_or_create(
                document=document,
                defaults={
                    'raw_text': text,
                    'preprocessed_text': text,
                    'ocr_confidence': ocr_result['confidence']
                }
            )
            print(f"💾 Extracted text saved to database (ID: {extracted_text.id})")
            
            # Analyze text for risks
            print("🔬 Analyzing text for risks...")
            risks = self.risk_analyzer.analyze_text(text)
            print(f"⚠️ Found {len(risks)} potential risks")
            
            # Save risks to database
            risk_count = 0
            for risk in risks:
                try:
                    RiskAnalysis.objects.create(
                        document=document,
                        category=risk['category'],
                        risk_level=risk['risk_level'],
                        clause_text=risk['clause_text'],
                        explanation=risk['explanation'],
                        page_number=risk.get('page_number', 1)
                    )
                    risk_count += 1
                    print(f"  - [{risk['risk_level']}] {risk['category']}: {risk['clause_text'][:50]}...")
                except Exception as e:
                    print(f"  ❌ Failed to save risk: {e}")
            
            # Update document status to COMPLETED
            document.status = 'COMPLETED'
            document.save()
            
            print(f"\n{'='*60}")
            print(f"✅ SUCCESS! Document {document.id} processed")
            print(f"📊 Found {risk_count} risks")
            print(f"📈 OCR Confidence: {ocr_result['confidence']}%")
            print(f"{'='*60}\n")
            
            # ✅ Send success notification
            try:
                from notifications.services import NotificationService
                NotificationService.notify_document_processed(document)
                
                # Check for critical risks
                critical_risks = RiskAnalysis.objects.filter(
                    document=document, 
                    risk_level='CRITICAL'
                )
                for risk in critical_risks:
                    NotificationService.notify_high_risk_detected(document, risk)
            except Exception as notify_error:
                print(f"⚠️ Notification error (non-critical): {notify_error}")
            
            return {
                'success': True,
                'risk_count': risk_count,
                'confidence': ocr_result['confidence'],
                'document_id': str(document.id)
            }
            
        except Exception as e:
            error_msg = f"❌ Document processing failed: {str(e)}"
            print(error_msg)
            print(f"\n📋 FULL ERROR TRACEBACK:")
            traceback.print_exc()
            print(f"{'='*60}\n")
            
            # Update document status to FAILED
            try:
                document.status = 'FAILED'
                document.save()
                print(f"✅ Document status updated to FAILED")
                
                # ✅ Send failure notification
                try:
                    from notifications.services import NotificationService
                    NotificationService.create_notification(
                        recipient=document.user,
                        notification_type='FAILED',
                        title=f"Document processing failed: {document.title}",
                        message=f"Your document '{document.title}' could not be processed. Error: {str(e)[:100]}",
                        content_object=document
                    )
                except:
                    pass  # Notification failed, but document is already marked as failed
                    
            except Exception as status_error:
                print(f"❌ Could not update status: {status_error}")
            
            return {
                'success': False,
                'error': str(e),
                'document_id': str(document.id) if document else None
            }
    

class IntelligentDocumentProcessor:
    """Advanced document processor with AI features (requires PyTorch)"""
    
    def __init__(self):
        self.ocr_service = OCRService()
        self.ai_available = False
        
        # Try to import AI modules
        try:
            from .ai_engine import AIRiskAnalyzer
            self.ai = AIRiskAnalyzer()
            self.ai_available = True
            print("âœ… Advanced AI features enabled")
        except ImportError:
            print("âš ï¸ Advanced AI features disabled. Install PyTorch and transformers to enable.")
        
        # Optional text analysis libraries
        self.textstat_available = False
        self.textblob_available = False
        self.sumy_available = False
        
        try:
            import textstat
            self.textstat = textstat
            self.textstat_available = True
        except ImportError:
            pass
        
        try:
            from textblob import TextBlob
            self.TextBlob = TextBlob
            self.textblob_available = True
        except ImportError:
            pass
        
        try:
            from sumy.parsers.plaintext import PlaintextParser
            from sumy.nlp.tokenizers import Tokenizer
            from sumy.summarizers.text_rank import TextRankSummarizer
            self.sumy_parser = PlaintextParser
            self.sumy_tokenizer = Tokenizer
            self.sumy_summarizer = TextRankSummarizer
            self.sumy_available = True
        except ImportError:
            pass
    
    def get_document_hash(self, content: str) -> str:
        """Generate unique hash for document to avoid re-processing"""
        return hashlib.md5(content.encode()).hexdigest()
    
    def process_document_intelligently(self, document):
        """Process document with advanced AI features if available"""
        if not self.ai_available:
            return {
                'status': 'basic_processing',
                'message': 'Using basic OCR + keyword analysis. Install PyTorch for AI features.',
                'document_id': str(document.id)
            }
        
        # Advanced AI processing here
        return {
            'status': 'ai_processing',
            'message': 'Advanced AI features coming soon',
            'document_id': str(document.id)
        }
    
    def analyze_readability(self, text: str) -> Dict[str, Any]:
        """Calculate readability scores if textstat is available"""
        if not self.textstat_available:
            return {'error': 'Readability analysis requires textstat (pip install textstat)'}
        
        try:
            return {
                'flesch_reading_ease': self.textstat.flesch_reading_ease(text),
                'smog_index': self.textstat.smog_index(text),
                'coleman_liau_index': self.textstat.coleman_liau_index(text),
                'automated_readability_index': self.textstat.automated_readability_index(text),
                'grade_level': self.textstat.text_standard(text, float_output=True),
                'complexity': 'HIGH' if len(text) > 5000 else 'MEDIUM'
            }
        except Exception as e:
            return {'error': str(e)}
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment if textblob is available"""
        if not self.textblob_available:
            return {'error': 'Sentiment analysis requires textblob (pip install textblob)'}
        
        try:
            blob = self.TextBlob(text[:2000])
            sentiment = blob.sentiment
            
            return {
                'polarity': round(sentiment.polarity, 3),
                'subjectivity': round(sentiment.subjectivity, 3),
                'mood': 'POSITIVE' if sentiment.polarity > 0.1 else 'NEGATIVE' if sentiment.polarity < -0.1 else 'NEUTRAL'
            }
        except Exception as e:
            return {'error': str(e)}
    
    def generate_summary(self, text: str, sentences: int = 5) -> Dict[str, Any]:
        """Generate text summary if sumy is available"""
        if not self.sumy_available:
            return {'error': 'Summarization requires sumy (pip install sumy)'}
        
        try:
            parser = self.sumy_parser.from_string(text, self.sumy_tokenizer("english"))
            summarizer = self.sumy_summarizer()
            summary = summarizer(parser.document, sentences)
            return {
                'summary': ' '.join([str(sentence) for sentence in summary]),
                'sentence_count': sentences
            }
        except Exception as e:
            return {'error': str(e)}


