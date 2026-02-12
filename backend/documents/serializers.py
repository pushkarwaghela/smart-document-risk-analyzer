from rest_framework import serializers
from .models import Document, ExtractedText, RiskAnalysis

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'title', 'document_type', 'file', 'uploaded_at', 'status']
        read_only_fields = ['id', 'uploaded_at', 'status']

class DocumentDetailSerializer(serializers.ModelSerializer):
    risk_analyses = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'document_type', 'file', 'uploaded_at', 'status', 'risk_analyses']
    
    def get_risk_analyses(self, obj):
        analyses = obj.risk_analyses.all()[:10]
        return RiskAnalysisSerializer(analyses, many=True).data

class RiskAnalysisSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    risk_level_display = serializers.CharField(source='get_risk_level_display', read_only=True)
    
    class Meta:
        model = RiskAnalysis
        fields = ['id', 'category', 'category_display', 'risk_level', 'risk_level_display', 
                  'clause_text', 'explanation', 'page_number', 'created_at']