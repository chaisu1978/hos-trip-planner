from rest_framework import viewsets, permissions
from .models import Trip
from .serializers import TripSerializer

class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user).order_by("-planned_at")

    def perform_create(self, serializer):
        # We’ll add planner logic here later
        serializer.save(user=self.request.user)
