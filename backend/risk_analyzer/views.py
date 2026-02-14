from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from documents.models import Document
from .models import RiskAnalysis
from .serializers import RiskAnalysisSerializer

class RiskStatisticsView(APIView):
    """Get risk statistics for the authenticated user"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            # Get documents for current user
            documents = Document.objects.filter(user=request.user)
            
            # Get risks for user's documents
            risks = RiskAnalysis.objects.filter(document__in=documents)
            
            # Calculate statistics
            stats = {
                'total_documents': documents.count(),
                'total_risks': risks.count(),
                'risk_by_category': [],
                'risk_by_level': [],
                'critical_risks': risks.filter(risk_level='CRITICAL').count(),
                'high_risks': risks.filter(risk_level='HIGH').count(),
                'medium_risks': risks.filter(risk_level='MEDIUM').count(),
                'low_risks': risks.filter(risk_level='LOW').count(),
            }
            
            # Group by category
            categories = risks.values('category').annotate(
                count=Count('category')
            ).order_by('-count')
            
            for cat in categories:
                stats['risk_by_category'].append({
                    'category': cat['category'],
                    'count': cat['count']
                })
            
            # Group by risk level
            levels = risks.values('risk_level').annotate(
                count=Count('risk_level')
            ).order_by('-count')
            
            for level in levels:
                stats['risk_by_level'].append({
                    'risk_level': level['risk_level'],
                    'count': level['count']
                })
            
            return Response(stats)
            
        except Exception as e:
            print(f"❌ Error in RiskStatisticsView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RiskAnalysisListView(generics.ListAPIView):
    """Get all risks for a specific document"""
    serializer_class = RiskAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            document_id = self.kwargs['document_id']
            return RiskAnalysis.objects.filter(
                document_id=document_id,
                document__user=self.request.user
            )
        except Exception as e:
            print(f"❌ Error in RiskAnalysisListView: {str(e)}")
            return RiskAnalysis.objects.none()

class RiskReportView(APIView):
    """Generate comprehensive risk report for a document"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, document_id):
        try:
            document = get_object_or_404(Document, id=document_id, user=request.user)
            risks = RiskAnalysis.objects.filter(document=document)
            
            report = {
                'document_title': document.title,
                'upload_date': document.uploaded_at,
                'total_risks': risks.count(),
                'critical_risks': risks.filter(risk_level='CRITICAL').count(),
                'high_risks': risks.filter(risk_level='HIGH').count(),
                'medium_risks': risks.filter(risk_level='MEDIUM').count(),
                'low_risks': risks.filter(risk_level='LOW').count(),
                'risk_summary': {},
                'top_risky_clauses': RiskAnalysisSerializer(
                    risks.order_by('-risk_level')[:5], 
                    many=True
                ).data
            }
            
            # Generate summary by category
            for category in ['FINANCIAL', 'PRIVACY', 'LEGAL', 'SUBSCRIPTION']:
                cat_risks = risks.filter(category=category)
                if cat_risks.exists():
                    report['risk_summary'][category] = {
                        'count': cat_risks.count(),
                        'critical_count': cat_risks.filter(risk_level='CRITICAL').count(),
                        'high_count': cat_risks.filter(risk_level='HIGH').count(),
                        'medium_count': cat_risks.filter(risk_level='MEDIUM').count(),
                        'low_count': cat_risks.filter(risk_level='LOW').count(),
                    }
            
            return Response(report)
            
        except Document.DoesNotExist:
            return Response(
                {'error': 'Document not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"❌ Error in RiskReportView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )