from rest_framework import serializers
from .models import RiskAnalysis

class RiskAnalysisSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    risk_level_display = serializers.CharField(source='get_risk_level_display', read_only=True)
    
    class Meta:
        model = RiskAnalysis
        fields = [
            'id', 
            'category', 
            'category_display', 
            'risk_level', 
            'risk_level_display', 
            'clause_text', 
            'explanation', 
            'page_number', 
            'created_at'
        ]