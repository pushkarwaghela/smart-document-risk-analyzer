from django.db import models
from django.contrib.auth.models import User
import uuid

def document_upload_path(instance, filename):
    return f'uploads/user_{instance.user.id}/{uuid.uuid4()}_{filename}'

class Document(models.Model):
    DOCUMENT_TYPES = [
        ('TC', 'Terms & Conditions'),
        ('PP', 'Privacy Policy'),
        ('AG', 'Agreement'),
        ('OT', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    document_type = models.CharField(max_length=2, choices=DOCUMENT_TYPES, default='OT')
    file = models.FileField(upload_to=document_upload_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"

class ExtractedText(models.Model):
    document = models.OneToOneField(Document, on_delete=models.CASCADE, related_name='extracted_text')
    raw_text = models.TextField()
    preprocessed_text = models.TextField(blank=True)
    ocr_confidence = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Text from {self.document.title}"

class RiskAnalysis(models.Model):
    RISK_CATEGORIES = [
        ('FINANCIAL', 'Financial Risk'),
        ('PRIVACY', 'Privacy Risk'),
        ('LEGAL', 'Legal Risk'),
        ('SUBSCRIPTION', 'Subscription Risk'),
    ]
    
    RISK_LEVELS = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='risk_analyses')
    category = models.CharField(max_length=20, choices=RISK_CATEGORIES)
    risk_level = models.CharField(max_length=20, choices=RISK_LEVELS)
    clause_text = models.TextField()
    explanation = models.TextField()
    page_number = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-risk_level', '-created_at']
    
    def __str__(self):
        return f"{self.get_category_display()} - {self.get_risk_level_display()}"