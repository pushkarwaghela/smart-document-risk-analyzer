from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.views import APIView
from django.db import IntegrityError
from .serializers import UserSerializer, RegisterSerializer

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(ObtainAuthToken):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        print(f"Login attempt: {request.data.get('username')}")
        serializer = self.serializer_class(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            print(f"Login failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        print(f"Login successful: {user.username}")
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        request.user.auth_token.delete()
        return Response({'message': 'Logged out successfully'})

class UserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    def get_object(self):
        return self.request.user
