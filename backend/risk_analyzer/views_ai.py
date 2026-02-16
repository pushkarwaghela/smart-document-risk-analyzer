from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from documents.models import Document
from .gemini_chat import GeminiChat
from .semantic_search import SemanticSearch
import logging
import traceback

logger = logging.getLogger(__name__)

# Initialize services with error handling
try:
    gemini_chat = GeminiChat()
    semantic_search = SemanticSearch()
    logger.info("✅ Gemini AI Services initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize AI services: {str(e)}")
    gemini_chat = None
    semantic_search = None

class AIChatView(APIView):
    """Chat with a document using Gemini AI"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, document_id):
        try:
            if gemini_chat is None:
                return Response(
                    {'error': 'AI service not available. Check server logs.', 'success': False},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            document = get_object_or_404(Document, id=document_id, user=request.user)
            question = request.data.get('question')

            if not question:
                return Response(
                    {'error': 'Question is required', 'success': False},
                    status=status.HTTP_400_BAD_REQUEST
                )

            logger.info(f"Processing Gemini chat for document {document_id}")
            result = gemini_chat.chat_with_document(document_id, question)

            if result['success']:
                return Response(result)
            else:
                return Response(
                    {'error': result['error'], 'success': False},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Exception as e:
            logger.error(f"AI Chat error: {str(e)}")
            traceback.print_exc()
            return Response(
                {'error': str(e), 'success': False},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AISummaryView(APIView):
    """Generate AI summary of document using Gemini"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, document_id):
        try:
            if gemini_chat is None:
                return Response(
                    {'error': 'AI service not available. Check server logs.', 'success': False},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            document = get_object_or_404(Document, id=document_id, user=request.user)
            logger.info(f"Generating Gemini summary for document {document_id}")
            result = gemini_chat.generate_summary(document_id)

            if result['success']:
                return Response(result)
            else:
                return Response(
                    {'error': result['error'], 'success': False},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Exception as e:
            logger.error(f"AI Summary error: {str(e)}")
            traceback.print_exc()
            return Response(
                {'error': str(e), 'success': False},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SemanticSearchView(APIView):
    """Search documents semantically"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            if semantic_search is None:
                return Response(
                    {'error': 'Search service not available', 'success': False},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            # Rebuild index for this user
            semantic_search.build_index(user_id=request.user.id)

            query = request.query_params.get('q', '')
            if not query:
                return Response(
                    {'error': 'Search query is required', 'success': False},
                    status=status.HTTP_400_BAD_REQUEST
                )

            results = semantic_search.search(query)
            return Response({'results': results, 'success': True})
        except Exception as e:
            logger.error(f"Semantic search error: {str(e)}")
            traceback.print_exc()
            return Response(
                {'error': str(e), 'success': False},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SimilarDocumentsView(APIView):
    """Find documents similar to a given document"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, document_id):
        try:
            if semantic_search is None:
                return Response(
                    {'error': 'Search service not available', 'success': False},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            document = get_object_or_404(Document, id=document_id, user=request.user)

            # Rebuild index for this user
            semantic_search.build_index(user_id=request.user.id)

            results = semantic_search.find_similar(document_id)
            return Response({'results': results, 'success': True})
        except Exception as e:
            logger.error(f"Similar documents error: {str(e)}")
            traceback.print_exc()
            return Response(
                {'error': str(e), 'success': False},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ClearChatHistoryView(APIView):
    """Clear chat history for a document"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, document_id):
        try:
            if gemini_chat is None:
                return Response(
                    {'error': 'AI service not available', 'success': False},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            document = get_object_or_404(Document, id=document_id, user=request.user)
            
            result = gemini_chat.clear_chat_history(document_id)
            
            return Response({
                'success': result,
                'message': 'Chat history cleared' if result else 'No chat history found'
            })
        except Exception as e:
            logger.error(f"Clear chat error: {str(e)}")
            traceback.print_exc()
            return Response(
                {'error': str(e), 'success': False},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )