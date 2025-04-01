from django.core.cache import cache
from django.utils.hashable import make_hashable
from rest_framework.views import APIView
from rest_framework import viewsets, permissions
from .models import Trip
from .serializers import TripSerializer
from .services.plan import plan_trip
from core.authentication import CustomJWTAuthentication
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from .services.generate_daily_logs import generate_daily_logs
from .serializers import DailyLogSheetSerializer
from drf_spectacular.utils import extend_schema
from drf_spectacular.utils import OpenApiParameter
import requests
from .utils.cache_keys import make_cache_key
from .serializers import GeocodeResultSerializer
from .serializers import GeocodeReverseResultSerializer

class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [AllowAny]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Trip.objects.filter(user=self.request.user).order_by("-planned_at")
        return Trip.objects.none()

    def perform_create(self, serializer):
        user = self.request.user if self.request.user and self.request.user.is_authenticated else None
        trip = serializer.save(user=user)
        plan_trip(trip)

    @extend_schema(
    responses={200: DailyLogSheetSerializer(many=True)},
    description="Returns FMCSA-style daily logs for a specific trip"
    )

    @action(detail=True, methods=["get"])
    def logs(self, request, pk=None):
        trip = self.get_object()
        logs = generate_daily_logs(trip)
        serializer = DailyLogSheetSerializer(logs, many=True)
        return Response(serializer.data)


class GeocodeSearchView(APIView):
    permission_classes = [AllowAny]
    serializer_class = GeocodeResultSerializer

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        if len(query) < 3:
            return Response([])

        user_ip = request.META.get("REMOTE_ADDR", "")
        cache_key = make_cache_key("geocode", user_ip, query)
        if cache.get(cache_key):
            return Response([])  # short-circuit repeat queries

        # Store marker to prevent immediate repeat (10s)
        cache.set(cache_key, True, timeout=10)

        headers = {
            "User-Agent": "HOS-Trip-Planner/1.0 (https://hostp.webworkstt.com)",
        }

        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={
                "q": query,
                "format": "json",
                "countrycodes": "us",
                "addressdetails": 0,
                "limit": 5,
            },
            headers=headers,
        )

        data = response.json()
        serializer = GeocodeResultSerializer(data=data, many=True)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)


class GeocodeReverseView(APIView):
    permission_classes = [AllowAny]
    serializer_class = GeocodeReverseResultSerializer

    @extend_schema(
        parameters=[
            OpenApiParameter(name="lat", required=True, type=str, description="Latitude"),
            OpenApiParameter(name="lon", required=True, type=str, description="Longitude"),
        ],
        responses=GeocodeReverseResultSerializer
    )
    def get(self, request):
        lat = request.query_params.get("lat")
        lon = request.query_params.get("lon")

        if not lat or not lon:
            return Response({"detail": "lat and lon are required"}, status=400)

        # Optional: Short-circuit repeated requests from same IP for same coordinates
        user_ip = request.META.get("REMOTE_ADDR", "")
        cache_key = make_cache_key("reverse", user_ip, f"{lat},{lon}")
        if cache.get(cache_key):
            return Response({"detail": "Too many requests. Try again shortly."}, status=429)

        # 10-second limit per lat/lon/ip
        cache.set(cache_key, True, timeout=10)

        headers = {
            "User-Agent": "HOS-Trip-Planner/1.0 (https://hostp.webworkstt.com)",
        }

        response = requests.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={"format": "json", "lat": lat, "lon": lon, "countrycodes": "us"},
            headers=headers,
        )

        if response.status_code != 200:
            return Response({"detail": "Reverse geocoding failed"}, status=response.status_code)

        data = response.json()

        serializer = GeocodeReverseResultSerializer(data={
            "display_name": data.get("display_name", ""),
            "lat": data.get("lat", ""),
            "lon": data.get("lon", "")
        })
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)
