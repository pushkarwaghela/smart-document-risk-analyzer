from django.urls import path
from . import views_ai

urlpatterns = [
    path('chat/<uuid:document_id>/', views_ai.AIChatView.as_view(), name='ai-chat'),
    path('summary/<uuid:document_id>/', views_ai.AISummaryView.as_view(), name='ai-summary'),
    path('search/', views_ai.SemanticSearchView.as_view(), name='ai-search'),
    path('similar/<uuid:document_id>/', views_ai.SimilarDocumentsView.as_view(), name='ai-similar'),
    path('chat/<uuid:document_id>/clear/', views_ai.ClearChatHistoryView.as_view(), name='ai-chat-clear'),
]