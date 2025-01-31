from django.urls import path
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({"message": "API is working!"})

urlpatterns = [
    path("", api_root, name="api-root"),  # 👈 This ensures /api/ works
]
