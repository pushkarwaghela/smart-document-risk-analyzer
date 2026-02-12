from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q
from documents.models import Document, RiskAnalysis  # Fixed import
from documents.serializers import RiskAnalysisSerializer  # Fixed import

class RiskStatisticsView(APIView):
    """Get risk statistics for the authenticated user"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
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

class RiskAnalysisListView(generics.ListAPIView):
    """Get all risks for a specific document"""
    serializer_class = RiskAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        document_id = self.kwargs['document_id']
        return RiskAnalysis.objects.filter(
            document_id=document_id,
            document__user=self.request.user
        )

class RiskReportView(APIView):
    """Generate comprehensive risk report for a document"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, document_id):
        try:
            document = Document.objects.get(id=document_id, user=request.user)
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
                    }
            
            return Response(report)
            
        except Document.DoesNotExist:
            return Response(
                {'error': 'Document not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
