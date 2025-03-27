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
