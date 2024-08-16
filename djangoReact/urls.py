from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from api.views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('index/', index, name='index'),
    path('scope/', handle_scope, name='scope'),
    path('photo/', upload_photo, name='photo_submission'),
    path('line/', handle_scope, name='line'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', register_user, name='register_user'),
    path('dj-rest-auth/', include('dj_rest_auth.urls')),
    path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),
    path('accounts/', include('allauth.urls')),
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('auth/github/', GitHubLoginView.as_view(), name='github_login'),
    path('api/payments/', PaymentView.as_view(), name='payment_view'),
    re_path(r"^(?P<path>.*)$", serve_react, {"document_root": settings.REACT_APP_BUILD_PATH}),
]

