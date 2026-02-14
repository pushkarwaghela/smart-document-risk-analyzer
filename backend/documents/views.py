from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import Document
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

class DocumentProcessView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        print(f"\n{'='*60}")
        print(f"🚀 PROCESSING REQUEST for document: {pk}")
        print(f"{'='*60}")
        
        try:
            # Get the document
            document = get_object_or_404(Document, pk=pk, user=request.user)
            print(f"✅ Document found: {document.title}")
            print(f"📁 File path: {document.file.path}")
            print(f"📄 File exists: {os.path.exists(document.file.path)}")
            
            # Update status to PROCESSING
            document.status = 'PROCESSING'
            document.save()
            print(f"📝 Status updated to: PROCESSING")
            
            def process_in_background(doc_id):
                """Background thread for document processing"""
                print(f"\n{'='*60}")
                print(f"🔧 BACKGROUND THREAD STARTED for document: {doc_id}")
                print(f"{'='*60}")
                
                try:
                    # Import here to avoid circular imports
                    from risk_analyzer.services import DocumentAnalysisService
                    from documents.models import Document
                    
                    # Get fresh document instance
                    doc = Document.objects.get(id=doc_id)
                    
                    # Process the document
                    service = DocumentAnalysisService()
                    result = service.process_document(doc)
                    
                    if result['success']:
                        print(f"✅ Background processing completed successfully!")
                        print(f"📊 Found {result.get('risk_count', 0)} risks")
                    else:
                        print(f"❌ Background processing failed: {result.get('error', 'Unknown error')}")
                        
                except Exception as e:
                    print(f"💥 ERROR in background thread: {str(e)}")
                    traceback.print_exc()
                    
                    # Update document status to FAILED
                    try:
                        from documents.models import Document
                        doc = Document.objects.get(id=doc_id)
                        doc.status = 'FAILED'
                        doc.save()
                        print(f"✅ Document status updated to FAILED")
                    except:
                        pass
                
                print(f"\n{'='*60}")
                print(f"🔧 BACKGROUND THREAD FINISHED for document: {doc_id}")
                print(f"{'='*60}\n")
            
            # Start background thread
            thread = threading.Thread(
                target=process_in_background,
                args=(str(document.id),)
            )
            thread.daemon = True
            thread.start()
            
            print(f"🎯 Background thread started successfully")
            print(f"{'='*60}\n")
            
            return Response({
                'success': True,
                'message': 'Document processing started',
                'document_id': str(document.id)
            }, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            print(f"💥 ERROR in DocumentProcessView:")
            print(f"   Type: {type(e).__name__}")
            print(f"   Message: {str(e)}")
            traceback.print_exc()
            print(f"{'='*60}\n")
            
            return Response({
                'success': False,
                'error': f"Failed to start processing: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DocumentWithRiskCountView(generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Document.objects.filter(user=self.request.user).order_by('-uploaded_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        data = []
        for doc in queryset[:10]:
            try:
                from risk_analyzer.models import RiskAnalysis
                risk_count = RiskAnalysis.objects.filter(document=doc).count()
            except:
                risk_count = 0
                
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