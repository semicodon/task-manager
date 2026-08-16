"""
  - RegisterView (POST /api/auth/register/)
      Creates a new User, returns a token pair; React app can log the user in immediately w/o 2nd rep
      Permission: AllowAny

  - MeView (GET /api/auth/me/)
      Returns the currently-authenticated user.
      Permission: IsAuthenticated (the project default).
"""
from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/

    Request body:
        { "username": "...", "email": "...", "password": "..." }

    Success (201):
        {
            "username": "...",
            "email": "...",
            "tokens": { "access": "<JWT>", "refresh": "<JWT>" }
        }

        generics.CreateAPIView: gives POST + the serializer integration. override .create() to merge JWT tokens into the response.
    """

    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    queryset = User.objects.all()

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = User.objects.get(username=response.data["username"])
        refresh = RefreshToken.for_user(user)
        response.data["tokens"] = {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
        return response


class MeView(generics.RetrieveAPIView):
    """
    GET /api/auth/me/
    Returns the currently-authenticated user.
    """
    serializer_class = UserSerializer

    def get_object(self):
        """
        Overriding get_object to return request.user makes the rest of
        RetrieveAPIView's machinery work.
        """
        return self.request.user
