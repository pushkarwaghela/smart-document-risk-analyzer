class RiskExpertSystem:
    """Expert system for comprehensive risk scoring"""
    
    RISK_RULES = {
        'financial': {
            'high_value': ['$', '€', '£', 'dollar', 'euro', 'payment', 'fee'],
            'recurring': ['subscription', 'monthly', 'annual', 'renew'],
            'penalties': ['late fee', 'penalty', 'interest', 'charge'],
            'refund_policy': ['non-refundable', 'no refund', 'final sale']
        },
        'privacy': {
            'data_collection': ['collect', 'gather', 'track', 'monitor'],
            'data_sharing': ['share', 'disclose', 'transfer', 'sell'],
            'third_party': ['third party', 'affiliate', 'partner'],
            'user_rights': ['opt-out', 'delete', 'access', 'portability']
        },
        'legal': {
            'liability': ['indemnify', 'hold harmless', 'not liable'],
            'jurisdiction': ['governing law', 'venue', 'arbitration'],
            'changes': ['modify', 'change', 'amend', 'update'],
            'termination': ['terminate', 'suspend', 'cancel']
        }
    }
    
    def calculate_risk_score(self, document):
        """Calculate comprehensive risk score (0-100)"""
        risks = RiskAnalysis.objects.filter(document=document)
        
        if not risks.exists():
            return 0
        
        # Base score from risk counts
        base_score = min(risks.count() * 5, 50)
        
        # Risk level multiplier
        level_multiplier = {
            'CRITICAL': 1.5,
            'HIGH': 1.2,
            'MEDIUM': 1.0,
            'LOW': 0.8
        }
        
        weighted_score = 0
        for risk in risks:
            weighted_score += level_multiplier.get(risk.risk_level, 1.0)
        
        # Category diversity bonus
        categories = risks.values('category').distinct().count()
        diversity_bonus = min(categories * 5, 20)
        
        # Readability penalty (complex documents are riskier)
        readability_penalty = self.calculate_readability_penalty(document)
        
        # Final score
        final_score = min(
            base_score + (weighted_score * 2) + diversity_bonus - readability_penalty,
            100
        )
        
        return max(0, round(final_score, 1))
    
    def calculate_readability_penalty(self, document):
        """Penalize complex, hard-to-read documents"""
        if not hasattr(document, 'extracted_text'):
            return 0
        
        text = document.extracted_text.preprocessed_text
        
        # Average sentence length
        sentences = text.split('.')
        avg_sentence_length = sum(len(s.split()) for s in sentences) / max(len(sentences), 1)
        
        # Long sentences = harder to read
        if avg_sentence_length > 25:
            return 15
        elif avg_sentence_length > 20:
            return 10
        elif avg_sentence_length > 15:
            return 5
        
        return 0
    
    def get_risk_breakdown(self, document):
        """Get detailed risk breakdown by category"""
        risks = RiskAnalysis.objects.filter(document=document)
        
        breakdown = {
            'overall_score': self.calculate_risk_score(document),
            'categories': {},
            'recommendations': []
        }
        
        for category in ['FINANCIAL', 'PRIVACY', 'LEGAL', 'SUBSCRIPTION']:
            cat_risks = risks.filter(category=category)
            if cat_risks.exists():
                breakdown['categories'][category] = {
                    'count': cat_risks.count(),
                    'critical': cat_risks.filter(risk_level='CRITICAL').count(),
                    'high': cat_risks.filter(risk_level='HIGH').count(),
                    'medium': cat_risks.filter(risk_level='MEDIUM').count(),
                    'low': cat_risks.filter(risk_level='LOW').count(),
                    'score': self.calculate_category_score(cat_risks)
                }
                
                # Generate recommendations
                if cat_risks.filter(risk_level='CRITICAL').exists():
                    breakdown['recommendations'].append(
                        f"Immediate review required for {category.lower()} risks"
                    )
        
        return breakdown
    
    def calculate_category_score(self, risks):
        """Calculate score for a specific risk category"""
        weights = {'CRITICAL': 10, 'HIGH': 7, 'MEDIUM': 4, 'LOW': 1}
        total = sum(weights.get(r.risk_level, 0) for r in risks)
        return min(total * 2, 100)