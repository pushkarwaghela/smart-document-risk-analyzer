from django.db import models
from documents.models import Document

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
    
    document = models.ForeignKey(
        Document, 
        on_delete=models.CASCADE, 
        related_name='risk_analyses'  # This is the KEY line!
    )
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