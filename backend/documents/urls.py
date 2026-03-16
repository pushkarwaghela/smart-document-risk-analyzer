from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.DocumentUploadView.as_view(), name='document-upload'),
    path('list/', views.DocumentListView.as_view(), name='document-list'),
    path('<uuid:pk>/', views.DocumentDetailView.as_view(), name='document-detail'),
    path('<uuid:pk>/process/', views.DocumentProcessView.as_view(), name='document-process'),
    path('<uuid:pk>/delete/', views.DocumentDeleteView.as_view(), name='document-delete'),  # ✅ THIS LINE
    path('with-risks/', views.DocumentWithRiskCountView.as_view(), name='documents-with-risks'),
]