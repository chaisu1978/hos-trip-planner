from rest_framework import viewsets, permissions
from .models import Trip
from .serializers import TripSerializer
from .services.plan import plan_trip
from core.authentication import CustomJWTAuthentication
from rest_framework.permissions import AllowAny

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
