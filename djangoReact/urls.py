from django.urls import path, include, re_path
from api.views import *


urlpatterns = [
    path("", include("api.urls")),  # ✅ Ensure this is included


    re_path(r"^(?!api/|admin/|dj-rest-auth/|auth/|accounts/|stripe_webhook/).*$", serve_react, {"document_root": settings.REACT_APP_BUILD_PATH}),


]
