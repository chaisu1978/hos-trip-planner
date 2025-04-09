from django.conf import settings
from rest_framework.response import Response

def is_request_from_trusted_frontend(request) -> bool:
    if settings.DEBUG:
        return True
    referer = request.headers.get("Referer", "") or request.headers.get("Origin", "")
    trusted = getattr(settings, "TRUSTED_REFERER", "")
    return referer.startswith(trusted)

def reject_if_untrusted(request):
    if not is_request_from_trusted_frontend(request):
        return Response({"detail": "Forbidden"}, status=403)
