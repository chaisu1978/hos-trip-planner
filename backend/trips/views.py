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
from .serializers import GeocodeReverseResultSerializer, SvgLogListSerializer, GenericDetailMessageSerializer
from .services.svg_log_sheet import inject_duty_periods_into_svg
from django.conf import settings
from pathlib import Path
from django.http import HttpResponse
import cairosvg
from io import BytesIO
from PyPDF2 import PdfMerger

class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [AllowAny]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Trip.objects.filter(user=self.request.user).order_by("-planned_at")
        else:
            # Return trips with user=None (anonymous)
            return Trip.objects.filter(user=None).order_by("-planned_at")

    def perform_create(self, serializer):
        user = self.request.user if self.request.user and self.request.user.is_authenticated else None
        trip = serializer.save(user=user)
        plan_trip(trip)

    @extend_schema(
    request=None,
    responses={200: DailyLogSheetSerializer(many=True)},
    description="Returns FMCSA-style daily logs for a specific trip"
    )

    @extend_schema(
        responses={200: GenericDetailMessageSerializer},
        description="Generates SVG log files for a specific trip"
    )
    @action(detail=True, methods=["post"])
    def generate_svgs(self, request, pk=None):
        trip = self.get_object()
        logs = generate_daily_logs(trip)
        inject_duty_periods_into_svg(logs, trip.id)
        return Response({"detail": f"SVGs generated for trip {trip.id}"})

    @extend_schema(
        responses={200: SvgLogListSerializer},
        description="Returns URLs to all generated daily log SVGs for this trip"
    )
    @action(detail=True, methods=["get"])
    def svg_logs(self, request, pk=None):
        trip = self.get_object()
        trip_dir = Path(settings.MEDIA_ROOT) / str(trip.id) / "logs"

        if not trip_dir.exists():
            return Response({
                "count": 0,
                "svg_urls": []
            })

        svg_files = sorted(trip_dir.glob("output-*.svg"))
        svg_urls = [
            request.build_absolute_uri(
                f"{settings.MEDIA_URL}{trip.id}/logs/{svg_file.name}"
            ) for svg_file in svg_files
        ]

        return Response({
            "count": len(svg_urls),
            "svg_urls": svg_urls
        })

    @extend_schema(
        responses={200: "application/pdf"},
        description="Download all SVG daily logs as a combined PDF"
    )
    @action(detail=True, methods=["get"])
    def download_logs(self, request, pk=None):
        trip = self.get_object()
        trip_dir = Path(settings.MEDIA_ROOT) / str(trip.id) / "logs"
        svg_files = sorted(trip_dir.glob("output-*.svg"))

        if not svg_files:
            return HttpResponse("No SVG logs found", status=404)

        # Convert each SVG to a PDF in memory
        pdf_streams = []
        for svg_file in svg_files:
            pdf_bytes = BytesIO()
            cairosvg.svg2pdf(url=str(svg_file), write_to=pdf_bytes)
            pdf_bytes.seek(0)
            pdf_streams.append(pdf_bytes)

        # Merge PDFs into one
        merger = PdfMerger()
        for pdf in pdf_streams:
            merger.append(pdf)

        output_pdf = BytesIO()
        merger.write(output_pdf)
        merger.close()
        output_pdf.seek(0)

        response = HttpResponse(output_pdf.read(), content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="DailyLogs-{trip.id}.pdf"'
        return response


class GeocodeSearchView(APIView):
    permission_classes = [AllowAny]
    serializer_class = GeocodeResultSerializer

    def get(self, request):
        query = request.query_params.get("q", "").strip()

        # Normalize query for cache key
        normalized_query = " ".join(query.lower().split())
        if len(normalized_query) < 3:
            return Response([])

        user_ip = request.META.get("REMOTE_ADDR", "")
        cache_key = make_cache_key("geocode", user_ip, normalized_query)
        if cache.get(cache_key):
            return Response([])

        # Cache the query to avoid hammering Nominatim
        cache.set(cache_key, True, timeout=10)

        def nominatim_search(q):
            headers = {
                "User-Agent": "HOS-Trip-Planner/1.0 (https://hostp.webworkstt.com)",
            }
            return requests.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": q,
                    "format": "json",
                    "countrycodes": "us",
                    "addressdetails": 0,
                    "limit": 5,
                    "dedupe": 0,
                    "accept-language": "en",
                },
                headers=headers,
                timeout=5
            )

        # Primary search
        response = nominatim_search(query)
        data = response.json()

        # Optional fallback: use first word if original query returns nothing
        if not data and " " in query:
            fallback = query.split()[0]
            response = nominatim_search(fallback)
            data = response.json()

        serializer = self.serializer_class(data=data, many=True)
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
