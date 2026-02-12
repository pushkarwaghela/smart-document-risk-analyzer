from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Document
from .serializers import DocumentSerializer, DocumentDetailSerializer
from risk_analyzer.services import DocumentAnalysisService
import threading
import logging

logger = logging.getLogger(__name__)

class DocumentUploadView(generics.CreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DocumentListView(generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Document.objects.filter(user=self.request.user).order_by('-uploaded_at')

class DocumentDetailView(generics.RetrieveAPIView):
    serializer_class = DocumentDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)

class DocumentProcessView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        document = get_object_or_404(Document, pk=pk, user=request.user)
        
        # Start processing in background thread
        def process_in_background():
            service = DocumentAnalysisService()
            service.process_document(document)
        
        thread = threading.Thread(target=process_in_background)
        thread.start()
        
        return Response({
            'message': 'Document processing started',
            'document_id': str(document.id)
        }, status=status.HTTP_202_ACCEPTED)

class DocumentWithRiskCountView(generics.ListAPIView):
    """Get documents with risk counts for analytics"""
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Document.objects.filter(user=self.request.user).order_by('-uploaded_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        data = []
        for doc in queryset[:10]:  # Last 10 documents
            risk_count = RiskAnalysis.objects.filter(document=doc).count()
            doc_data = {
                'id': doc.id,
                'title': doc.title,
                'document_type': doc.get_document_type_display(),
                'status': doc.status,
                'uploaded_at': doc.uploaded_at,
                'risk_count': risk_count
            }
            data.append(doc_data)
        return Response(data)