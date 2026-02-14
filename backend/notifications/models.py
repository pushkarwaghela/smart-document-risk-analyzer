from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import uuid

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('PROCESSING', 'Document Processing'),
        ('COMPLETED', 'Processing Completed'),
        ('FAILED', 'Processing Failed'),
        ('RISK_ALERT', 'High Risk Detected'),
        ('SHARE', 'Document Shared'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # ✅ FIX: Change from IntegerField to CharField for UUID support
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True)
    object_id = models.CharField(max_length=255, null=True, blank=True)  # Changed from PositiveIntegerField
    content_object = GenericForeignKey('content_type', 'object_id')
    
    is_read = models.BooleanField(default=False)
    is_emailed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.recipient.username} - {self.title}"