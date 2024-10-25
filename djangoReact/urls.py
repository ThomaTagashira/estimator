from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from api.views import *
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/index/', index, name='index'),
    path('api/scope/', handle_scope, name='scope'),
    path('api/photo/', upload_photo, name='photo_submission'),
    path('api/line/', handle_scope, name='line'),
    path('api/userToken/', UsernameTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/googleToken/', GoogleTokenObtainPairView.as_view(), name='google-token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', register_user, name='register_user'),
    path('dj-rest-auth/', include('dj_rest_auth.urls')),
    path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),
    path('accounts/', include('allauth.urls')),
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('api/auth/github/', GitHubLoginView.as_view(), name='github_login'),
    path('api/subscription/status/', subscription_status, name='subscription_status'),
    path('api/payments/', CreateSubscriptionCheckoutSessionView.as_view(), name='create_subscription_checkout_session'),
    path('api/token-payments/', CreateTokenCheckoutSessionView.as_view(), name='create_token_checkout_session'),
    path('stripe_webhook/', stripe_webhook, name='stripe_webhook'),
    path('api/estimates/', create_estimate, name='create_estimate'),
    path('api/saved-estimates/', get_user_estimates, name='user_estimates'),
    path('api/saved-estimates/<str:estimate_id>/', get_saved_estimate, name='get_saved_estimate'),
    path('api/save-estimate-items/', SaveEstimateItems.as_view(), name='save_estimate_items'),
    path('api/fetch-estimate-items/<str:estimate_id>/', FetchEstimateItems.as_view(), name='get_saved_estimate_items'),
    path('api/update-task/<str:estimate_id>/<int:task_number>/', UpdateTaskView.as_view(), name='update_task'),
    path('api/delete-task/<str:estimate_id>/<int:task_number>/', DeleteTaskView.as_view(), name='delete_task'),






    #re_path(r"^(?P<path>.*)$", serve_react, {"document_root": settings.REACT_APP_BUILD_PATH}),
]

