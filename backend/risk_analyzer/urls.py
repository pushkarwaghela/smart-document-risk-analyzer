from django.urls import path
from . import views

urlpatterns = [
    path('documents/<uuid:document_id>/risks/', views.RiskAnalysisListView.as_view(), name='risk-list'),
    path('documents/<uuid:document_id>/report/', views.RiskReportView.as_view(), name='risk-report'),
    path('statistics/', views.RiskStatisticsView.as_view(), name='risk-statistics'),
]