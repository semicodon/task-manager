
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import (
    TokenBlacklistView,        # POST {refresh} → revokes the refresh token
    TokenObtainPairView,       # POST {username, password} → {access, refresh}
    TokenRefreshView,          # POST {refresh} → {access, refresh}
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("tasks.urls")),
    path("api-auth/", include("rest_framework.urls")),
    path("api/auth/login/",   TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(),    name="token_refresh"),
    path("api/auth/logout/",  TokenBlacklistView.as_view(),  name="token_blacklist"),
    path("api/auth/", include("accounts.urls")),
    path("api-auth/", include("rest_framework.urls")),
]

]
