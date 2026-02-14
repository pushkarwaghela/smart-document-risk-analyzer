from rest_framework import serializers
from .models import Document, ExtractedText
from risk_analyzer.serializers import RiskAnalysisSerializer

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

class ExtractedTextSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtractedText
        fields = ['raw_text', 'preprocessed_text', 'ocr_confidence', 'created_at']
