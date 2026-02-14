from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .models import Notification
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    
    @staticmethod
    def create_notification(recipient, notification_type, title, message, content_object=None):
        """Create in-app notification"""
        try:
            notification = Notification.objects.create(
                recipient=recipient,
                notification_type=notification_type,
                title=title,
                message=message,
                content_object=content_object
            )
            logger.info(f"✅ Notification created for {recipient.username}: {title}")
            return notification
        except Exception as e:
            logger.error(f"❌ Failed to create notification: {e}")
            return None
    
    @staticmethod
    def send_email_notification(recipient, subject, template_name, context):
        """Send email notification"""
        try:
            html_message = render_to_string(template_name, context)
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient.email],
                html_message=html_message,
                fail_silently=False,
            )
            logger.info(f"✅ Email sent to {recipient.email}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to send email: {e}")
            return False
    
    @staticmethod
    def notify_document_processed(document):
        """Send notifications when document processing completes"""
        user = document.user
        risk_count = document.risk_analyses.count()
        
        # Create in-app notification
        NotificationService.create_notification(
            recipient=user,
            notification_type='COMPLETED' if document.status == 'COMPLETED' else 'FAILED',
            title=f"Document {document.status}: {document.title}",
            message=f"Your document '{document.title}' has been processed. Found {risk_count} risks." if document.status == 'COMPLETED' else f"Document '{document.title}' processing failed.",
            content_object=document
        )
        
        # Send email (optional - uncomment if you want emails)
        """
        context = {
            'user': user,
            'document': document,
            'risk_count': risk_count,
            'site_url': 'http://localhost:5173'
        }
        
        NotificationService.send_email_notification(
            recipient=user,
            subject=f"✅ Your document analysis is ready: {document.title}",
            template_name='emails/document_processed.html',
            context=context
        )
        """
    
    @staticmethod
    def notify_high_risk_detected(document, risk):
        """Send alert for high/critical risks"""
        user = document.user
        
        NotificationService.create_notification(
            recipient=user,
            notification_type='RISK_ALERT',
            title=f"⚠️ {risk.risk_level} Risk Detected",
            message=f"Found {risk.risk_level} risk in '{document.title}': {risk.category}",
            content_object=risk
        )