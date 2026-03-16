from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Document, ExtractedText
from .serializers import DocumentSerializer, DocumentDetailSerializer
import threading
import logging
import os
import traceback

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

# ✅ WORKING DELETE VIEW
class DocumentDeleteView(APIView):
    """Delete a document"""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, pk):
        try:
            # Log the request
            logger.info(f"🗑️ Delete request for document {pk} by user {request.user.id}")
            
            # Get the document
            document = get_object_or_404(Document, pk=pk, user=request.user)
            
            # Store file path for logging
            file_path = document.file.path if document.file else None
            
            # Delete the document (cascade will delete related risks, extracted text)
            document.delete()
            
            # Try to delete physical file if it exists
            if file_path and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    logger.info(f"✅ Deleted file: {file_path}")
                except Exception as e:
                    logger.warning(f"⚠️ Could not delete file: {e}")
            
            logger.info(f"✅ Document {pk} deleted successfully")
            
            return Response({
                'success': True,
                'message': 'Document deleted successfully'
            }, status=status.HTTP_200_OK)
            
        except Document.DoesNotExist:
            logger.warning(f"❌ Document {pk} not found")
            return Response({
                'success': False,
                'error': 'Document not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"❌ Delete error: {str(e)}")
            traceback.print_exc()
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DocumentProcessView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        document = get_object_or_404(Document, pk=pk, user=request.user)
        
        def process_in_background():
            from risk_analyzer.services import DocumentAnalysisService
            service = DocumentAnalysisService()
            service.process_document(document)
        
        thread = threading.Thread(target=process_in_background)
        thread.daemon = True
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
        for doc in queryset[:10]:
            from risk_analyzer.models import RiskAnalysis
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