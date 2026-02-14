from django.test import TestCase, Client
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import Document, RiskAnalysis
import tempfile
from PIL import Image
import io

class DocumentAPITestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.api_headers = {
            'HTTP_AUTHORIZATION': f'Token {self.token.key}'
        }
    
    def test_document_upload(self):
        """Test document upload endpoint"""
        # Create test image
        image = Image.new('RGB', (100, 100), color='red')
        img_io = io.BytesIO()
        image.save(img_io, format='JPEG')
        img_io.seek(0)
        
        # Upload
        response = self.client.post(
            '/api/documents/upload/',
            {
                'title': 'Test Document',
                'document_type': 'TC',
                'file': img_io
            },
            **self.api_headers,
            format='multipart'
        )
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Document.objects.count(), 1)
    
    def test_document_list(self):
        """Test document list endpoint"""
        # Create test document
        Document.objects.create(
            user=self.user,
            title='Test Doc',
            document_type='TC'
        )
        
        response = self.client.get(
            '/api/documents/list/',
            **self.api_headers
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
    
    def test_authentication_required(self):
        """Test authentication is required"""
        response = self.client.get('/api/documents/list/')
        self.assertEqual(response.status_code, 403)