import os
import re
import cv2
import numpy as np
import pytesseract
from PIL import Image
import spacy
from pdf2image import convert_from_path
from django.conf import settings
from documents.models import Document, ExtractedText, RiskAnalysis
import logging

logger = logging.getLogger(__name__)

class ImagePreprocessor:
    """Advanced image preprocessing for better OCR accuracy"""
    
    @staticmethod
    def preprocess_image(image_path):
        """Apply multiple preprocessing techniques"""
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
            
            # Apply thresholding
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Denoise
            denoised = cv2.fastNlMeansDenoising(thresh)
            
            return denoised
        except Exception as e:
            logger.error(f"Image preprocessing error: {str(e)}")
            return None

class OCRService:
    """OCR service using Tesseract"""
    
    def __init__(self):
        # Configure Tesseract path for Windows
        if os.name == 'nt':
            tesseract_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
            if os.path.exists(tesseract_path):
                pytesseract.pytesseract.tesseract_cmd = tesseract_path
    
    def extract_text_from_image(self, image_path):
        """Extract text from image"""
        try:
            # Preprocess image
            preprocessor = ImagePreprocessor()
            processed_img = preprocessor.preprocess_image(image_path)
            
            if processed_img is None:
                return {'text': '', 'confidence': 0}
            
            # OCR configuration
            custom_config = r'--oem 3 --psm 6'
            
            # Extract text
            text = pytesseract.image_to_string(processed_img, config=custom_config)
            
            # Get confidence
            try:
                data = pytesseract.image_to_data(processed_img, output_type=pytesseract.Output.DICT)
                confidences = [int(conf) for conf in data['conf'] if conf != '-1']
                avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            except:
                avg_confidence = 75  # Default confidence
            
            return {
                'text': text,
                'confidence': avg_confidence
            }
        except Exception as e:
            logger.error(f"OCR Error: {str(e)}")
            return {'text': '', 'confidence': 0}
    
    def extract_text_from_pdf(self, pdf_path):
        """Extract text from PDF"""
        try:
            # Convert PDF to images
            images = convert_from_path(pdf_path, dpi=300)
            
            full_text = ""
            confidences = []
            
            for i, image in enumerate(images):
                # Save temporarily
                temp_path = f"/tmp/page_{i}.jpg"
                image.save(temp_path, 'JPEG')
                
                # Extract text from image
                result = self.extract_text_from_image(temp_path)
                full_text += f"\n--- Page {i+1} ---\n{result['text']}\n"
                confidences.append(result['confidence'])
                
                # Cleanup
                try:
                    os.remove(temp_path)
                except:
                    pass
            
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return {
                'text': full_text,
                'confidence': avg_confidence
            }
        except Exception as e:
            logger.error(f"PDF OCR Error: {str(e)}")
            return {'text': '', 'confidence': 0}

class RiskAnalyzer:
    """Risk analysis service"""
    
    def __init__(self):
        try:
            self.nlp = spacy.load('en_core_web_sm')
        except:
            logger.warning("spaCy model not found. Downloading...")
            os.system('python -m spacy download en_core_web_sm')
            self.nlp = spacy.load('en_core_web_sm')
        
        # Risk keywords by category
        self.risk_keywords = {
            'FINANCIAL': [
                'payment', 'fee', 'charge', 'cost', 'price', 'refund', 'credit', 'debit',
                'bank', 'account', 'financial', 'money', 'dollar', 'euro', 'currency',
                'interest', 'late fee', 'penalty', 'subscription fee', 'annual fee',
                'processing fee', 'transaction', 'billing', 'invoice', 'pay', 'paid'
            ],
            'PRIVACY': [
                'privacy', 'personal', 'data', 'information', 'collect', 'share',
                'third party', 'cookie', 'track', 'gdpr', 'ccpa', 'consent', 'opt-out',
                'opt-in', 'personal information', 'personally identifiable', 'pii',
                'data protection', 'data processing', 'data controller', 'data subject'
            ],
            'LEGAL': [
                'law', 'legal', 'court', 'jurisdiction', 'arbitration', 'lawsuit',
                'comply', 'regulation', 'governing', 'rights', 'dispute', 'indemnify',
                'liability', 'indemnification', 'warranty', 'disclaimer', 'governing law',
                'venue', 'class action', 'binding', 'arbitrator', 'attorney', 'sue'
            ],
            'SUBSCRIPTION': [
                'subscription', 'renew', 'cancel', 'monthly', 'annual', 'term',
                'auto-renew', 'trial', 'expire', 'recurring', 'automatic renewal',
                'cancel anytime', 'billing cycle', 'membership', 'plan', 'upgrade',
                'downgrade', 'termination', 'suspend', 'refund policy'
            ]
        }
    
    def analyze_text(self, text):
        """Analyze text for risks"""
        risks = []
        
        # Split into sentences
        doc = self.nlp(text[:10000])  # Limit to 10000 chars for performance
        sentences = [sent.text.strip() for sent in doc.sents]
        
        for sentence in sentences:
            if len(sentence) < 20:  # Skip very short sentences
                continue
                
            sentence_lower = sentence.lower()
            
            # Check each risk category
            for category, keywords in self.risk_keywords.items():
                matches = []
                for keyword in keywords:
                    if keyword in sentence_lower:
                        matches.append(keyword)
                
                # If at least 2 keywords match, classify as risk
                if len(matches) >= 2:
                    # Determine risk level based on number of matches
                    if len(matches) >= 4:
                        risk_level = 'CRITICAL'
                    elif len(matches) >= 3:
                        risk_level = 'HIGH'
                    else:
                        risk_level = 'MEDIUM'
                    
                    risks.append({
                        'category': category,
                        'risk_level': risk_level,
                        'clause_text': sentence[:500],  # Limit length
                        'explanation': f"Detected {len(matches)} risk indicators: {', '.join(matches[:5])}",
                        'page_number': 1,
                        'confidence': min(len(matches) * 20, 95)  # 20% per keyword match
                    })
        
        return risks

class DocumentAnalysisService:
    """Main service for document analysis"""
    
    def __init__(self):
        self.ocr_service = OCRService()
        self.risk_analyzer = RiskAnalyzer()
    
    def process_document(self, document):
        """Complete document processing pipeline"""
        try:
            # Update document status
            document.status = 'PROCESSING'
            document.save()
            logger.info(f"Started processing document: {document.id}")
            
            # Get file path
            file_path = document.file.path
            file_extension = os.path.splitext(file_path)[1].lower()
            
            # Extract text based on file type
            if file_extension in ['.jpg', '.jpeg', '.png', '.tiff', '.bmp', '.webp']:
                ocr_result = self.ocr_service.extract_text_from_image(file_path)
            elif file_extension == '.pdf':
                ocr_result = self.ocr_service.extract_text_from_pdf(file_path)
            elif file_extension == '.txt':
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
                ocr_result = {
                    'text': text,
                    'confidence': 100.0
                }
            else:
                # Try as image anyway
                ocr_result = self.ocr_service.extract_text_from_image(file_path)
            
            # Save extracted text
            extracted_text, created = ExtractedText.objects.update_or_create(
                document=document,
                defaults={
                    'raw_text': ocr_result['text'],
                    'preprocessed_text': ocr_result['text'],
                    'ocr_confidence': ocr_result['confidence']
                }
            )
            
            # Analyze text for risks
            risks = self.risk_analyzer.analyze_text(ocr_result['text'])
            
            # Save risks to database
            risk_count = 0
            for risk in risks:
                RiskAnalysis.objects.create(
                    document=document,
                    category=risk['category'],
                    risk_level=risk['risk_level'],
                    clause_text=risk['clause_text'],
                    explanation=risk['explanation'],
                    page_number=risk['page_number']
                )
                risk_count += 1
            
            # Update document status
            document.status = 'COMPLETED'
            document.save()
            
            logger.info(f"Completed processing document: {document.id}. Found {risk_count} risks.")
            
            return {
                'success': True,
                'risk_count': risk_count,
                'confidence': ocr_result['confidence']
            }
            
        except Exception as e:
            logger.error(f"Document processing failed: {str(e)}")
            document.status = 'FAILED'
            document.save()
            return {
                'success': False,
                'error': str(e)
            }