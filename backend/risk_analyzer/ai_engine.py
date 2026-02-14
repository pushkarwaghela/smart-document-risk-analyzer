import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    pipeline,
    RobertaTokenizer,
    RobertaForSequenceClassification
)
import numpy as np
from typing import List, Dict, Tuple
import logging
from django.conf import settings
import os

logger = logging.getLogger(__name__)

class AIRiskAnalyzer:
    """State-of-the-art transformer-based risk analysis"""
    
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"🚀 Using device: {self.device}")
        
        # Load Legal-BERT (trained on legal documents)
        self.model_name = "nlpaueb/legal-bert-base-uncased"
        
        try:
            # For sequence classification (risk categories)
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                self.model_name,
                num_labels=4,  # FINANCIAL, PRIVACY, LEGAL, SUBSCRIPTION
                ignore_mismatched_sizes=True
            ).to(self.device)
            
            # Zero-shot classifier for custom categories
            self.zero_shot = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli",
                device=0 if torch.cuda.is_available() else -1
            )
            
            # Named Entity Recognition for extracting important information
            self.ner = pipeline(
                "ner",
                model="dslim/bert-base-NER",
                aggregation_strategy="simple",
                device=0 if torch.cuda.is_available() else -1
            )
            
            logger.info("✅ Advanced AI models loaded successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to load models: {e}")
            raise
    
    def analyze_with_legal_bert(self, text: str) -> List[Dict]:
        """Analyze text using Legal-BERT (trained on legal documents)"""
        # Split into chunks (BERT has 512 token limit)
        chunks = [text[i:i+512] for i in range(0, len(text), 512)]
        
        all_predictions = []
        risk_categories = ['FINANCIAL', 'PRIVACY', 'LEGAL', 'SUBSCRIPTION']
        
        for chunk in chunks[:3]:  # Limit to first 3 chunks for performance
            inputs = self.tokenizer(
                chunk, 
                return_tensors="pt", 
                truncation=True, 
                max_length=512,
                padding=True
            ).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
                
            scores = probabilities.cpu().numpy()[0]
            
            for i, category in enumerate(risk_categories):
                confidence = float(scores[i] * 100)
                if confidence > 30:  # 30% confidence threshold
                    all_predictions.append({
                        'category': category,
                        'confidence': round(confidence, 2),
                        'text': chunk[:200] + '...',
                        'model': 'legal-bert'
                    })
        
        return all_predictions
    
    def zero_shot_classification(self, text: str, candidate_labels: List[str]) -> Dict:
        """Classify text into ANY categories without training"""
        result = self.zero_shot(text[:512], candidate_labels)
        return {
            'labels': result['labels'][:3],
            'scores': [round(s * 100, 2) for s in result['scores'][:3]]
        }
    
    def extract_entities(self, text: str) -> List[Dict]:
        """Extract named entities (people, organizations, money, dates)"""
        entities = self.ner(text[:1000])
        
        # Group and filter entities
        grouped = {}
        for entity in entities:
            key = f"{entity['entity_group']}_{entity['word']}"
            if key not in grouped:
                grouped[key] = {
                    'entity': entity['entity_group'],
                    'text': entity['word'],
                    'confidence': round(entity['score'] * 100, 2),
                    'count': 1
                }
            else:
                grouped[key]['count'] += 1
        
        return list(grouped.values())[:10]  # Top 10 entities
    
    def detect_bias(self, text: str) -> Dict:
        """Detect biased or unfair clauses"""
        bias_keywords = {
            'discrimination': ['race', 'gender', 'age', 'disability', 'religion', 'marital'],
            'unfair': ['sole discretion', 'without notice', 'non-refundable', 'no liability'],
            'hidden_fees': ['processing fee', 'service charge', 'administrative fee'],
            'auto_renewal': ['automatically renew', 'recurring', 'perpetual'],
            'liability': ['indemnify', 'hold harmless', 'not liable', 'as-is']
        }
        
        text_lower = text.lower()
        biases = []
        
        for bias_type, keywords in bias_keywords.items():
            found = [k for k in keywords if k in text_lower]
            if found:
                biases.append({
                    'type': bias_type.replace('_', ' ').title(),
                    'keywords': found,
                    'severity': 'HIGH' if len(found) > 2 else 'MEDIUM',
                    'count': len(found)
                })
        
        return {
            'has_bias': len(biases) > 0,
            'biases': biases,
            'risk_level': 'CRITICAL' if len(biases) > 3 else 'HIGH' if biases else 'LOW'
        }