from django.contrib import admin
from django.urls import path, include, re_path
from api.views import *
from django.http import JsonResponse
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
def api_root(request):
    return JsonResponse({"message": "API is working!"})

urlpatterns = [
    path("", api_root, name="api-root"), 


    path('api/admin/', admin.site.urls),
    path('api/dj-rest-auth/', include('dj_rest_auth.urls')),
    path('api/dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/accounts/', include('allauth.urls')),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/stripe_webhook/', stripe_webhook, name="stripe_webhook"),

    path('api/index/', index, name='index'),
    path('api/scope/', handle_scope, name='scope'),
    path('api/photo/', upload_photo, name='photo_submission'),
    path('api/line/', handle_scope, name='line'),
    path('api/userToken/', UsernameTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/googleToken/', GoogleTokenObtainPairView.as_view(), name='google-token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', register_user, name='register_user'),

    path('api/verify-email/<str:token>/', verify_email, name='verify-email'),
    re_path(r"^api/verify-email/(?P<token>[\w\.\-\_]+)/$", verify_email, name="verify-email"),  # ✅ Regex path

    path('api/resend-verification-email/', resend_verification_email, name='resend-verification-email'),
    path('api/check-verification-status/', check_verification_status, name='check-verification-status'),
    path('api/auth/google/', GoogleLoginView.as_view(), name='google_login'),
    # path('api/auth/github/', GitHubLoginView.as_view(), name='github_login'),
    path('api/subscription/status/', subscription_status, name='subscription_status'),
    path('api/payments/', CreateSubscriptionCheckoutSessionView.as_view(), name='create_subscription_checkout_session'),
    path('api/token-payments/', CreateTokenCheckoutSessionView.as_view(), name='create_token_checkout_session'),
    path('api/update_subscription/', ChangeSubscriptionTierView.as_view(), name='change_subscription_tier'),
    path('api/cancel-subscription/', CancelSubscriptionView.as_view(), name='cancel_subscription'),
    path('api/estimates/', create_estimate, name='create_estimate'),
    path('api/saved-estimates/', get_user_estimates, name='user_estimates'),
    path('api/delete-estimate/<int:estimate_id>/', delete_user_estimate, name='delete_user_estimate'),
    path('api/saved-estimates/<str:estimate_id>/', get_saved_estimate, name='get_saved_estimate'),
    path('api/save-estimate-items/', SaveEstimateItems.as_view(), name='save_estimate_items'),
    path('api/fetch-estimate-items/<str:estimate_id>/', FetchEstimateItems.as_view(), name='get_saved_estimate_items'),
    path('api/update-task/<str:estimate_id>/<int:task_number>/', UpdateTaskView.as_view(), name='update_task'),
    path('api/delete-task/<str:estimate_id>/<int:task_number>/', DeleteTaskView.as_view(), name='delete_task'),
    path('api/update-estimate/<str:estimate_id>/', UpdateEstimateInfoView.as_view(), name='update_estimate'),
    path('api/save-business-info/', save_business_info, name='save_business_info'),
    path('api/get-saved-business-info/', get_saved_business_info, name='get_saved_business_info'),
    path('api/get-user-token-count/', get_user_token_count, name='get_user_token_count'),
    path('api/deduct-tokens/', deduct_tokens, name='deduct_tokens'),
    path('api/get-user-subscription-tier/', get_user_subscription_tier, name='get_user_subscription_tier'),
    path('api/save-search-responses/<str:estimate_id>/', SaveSearchResponseView.as_view(), name='save_search_responses'),
    path('api/get-search-responses/<str:estimate_id>/', RetrieveSearchResponseView.as_view(), name='get_search_responses'),
    path('api/delete-search-response/<str:estimate_id>/<int:saved_response_id>/', DeleteSearchResponseView.as_view(), name='delete_search_response'),
    path('api/save-estimate-margin/<str:estimate_id>/', save_or_update_estimate_margin, name='save_or_update_estimate_margin'),
    path('api/get-estimate-margin/<str:estimate_id>/', get_estimate_margin, name='get_estimate_margin'),
    path('api/password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('api/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('api/update-email/', EmailUpdateView.as_view(), name='update_email'),
    path('api/update-password/', PasswordUpdateView.as_view(), name='update_password'),
    path('api/get-user-profile/', UserInfoView.as_view(), name='get_user_profile'),
    path('api/save-user-info/', save_user_data, name='save_user_data'),
    path('api/auth/user-state/', UserStateView.as_view(), name='user_state_view'),
    path('api/subscription/complete-profile/', CompleteProfileView.as_view(), name='complete-profile'),
    path('api/confirm-user-updated-email/<str:token>/', ConfirmEmailChangeView.as_view(), name='confirm-user-updated-email'),
]

