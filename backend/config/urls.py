from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

from django.views.static import serve as static_serve
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.urls import re_path

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/core/', include('core.urls')),
    path('api/trips/', include('trips.urls')),

    # drf-spectacular schema and documentation URLs
    path('api/schema/', SpectacularAPIView.as_view(), name='api-schema'),
    path(
        'api/docs/',
        SpectacularSwaggerView.as_view(url_name='api-schema'),
        name='api-docs'
        ),
    path(
        'api/redoc/',
        SpectacularRedocView.as_view(url_name='api-schema'),
        name='api-redoc'
        ),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )

@require_GET
@csrf_exempt
def media_with_cors(request, path):
    response = static_serve(request, path, document_root=settings.MEDIA_ROOT)
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Headers"] = "Origin, Content-Type, Accept"
    response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    return response

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', media_with_cors),
]