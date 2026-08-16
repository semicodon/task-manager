"""
  POST /api/auth/register/   → RegisterView   (AllowAny — sign up)
  GET  /api/auth/me/         → MeView         (IsAuthenticated — current user)
"""
from django.urls import path

from .views import MeView, RegisterView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),
]
