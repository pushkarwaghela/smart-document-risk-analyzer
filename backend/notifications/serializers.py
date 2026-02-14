from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    content_object_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'title', 'message', 'is_read', 'created_at', 'content_object_url']
    
    def get_content_object_url(self, obj):
        if obj.content_object:
            # Handle different content types
            if obj.content_type.model == 'document':
                return f"/documents/{obj.object_id}"
            elif obj.content_type.model == 'riskanalysis':
                return f"/documents/{obj.content_object.document.id}"
        return None