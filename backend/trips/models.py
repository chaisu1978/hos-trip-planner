from django.db import models
from django.conf import settings
from django.utils import timezone

class Trip(models.Model):
    user = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="trips"
)
    name = models.CharField(max_length=100, blank=True)

    current_location_label = models.CharField(max_length=255)
    current_location_lat = models.FloatField()
    current_location_lon = models.FloatField()

    pickup_location_label = models.CharField(max_length=255)
    pickup_location_lat = models.FloatField()
    pickup_location_lon = models.FloatField()

    dropoff_location_label = models.CharField(max_length=255)
    dropoff_location_lat = models.FloatField()
    dropoff_location_lon = models.FloatField()

    current_cycle_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

    planned_distance_miles = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    planned_duration_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    planned_at = models.DateTimeField(auto_now_add=True)
    departure_time = models.DateTimeField(default=timezone.now)

    def __str__(self):
        user_email = self.user.email if self.user else "Anonymous"
        return f"Trip by {user_email} on {self.planned_at.date()}"


class TripLeg(models.Model):
    trip = models.ForeignKey("Trip", on_delete=models.CASCADE, related_name="legs")
    # 0 = first leg, 1 = second leg, ...
    leg_order = models.PositiveIntegerField()

    start_label = models.CharField(max_length=255)
    start_lat = models.FloatField(null=True, blank=True)
    start_lon = models.FloatField(null=True, blank=True)

    end_label = models.CharField(max_length=255)
    end_lat = models.FloatField(null=True, blank=True)
    end_lon = models.FloatField(null=True, blank=True)

    distance_miles = models.DecimalField(max_digits=7, decimal_places=2)
    duration_hours = models.DecimalField(max_digits=5, decimal_places=2)
    # Set during planning
    departure_time = models.DateTimeField(null=True, blank=True)
    arrival_time = models.DateTimeField(null=True, blank=True)

    is_rest_stop = models.BooleanField(default=False)
    is_fuel_stop = models.BooleanField(default=False)

    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Leg {self.leg_order} of Trip {self.trip.id}"


class TripSegmentStep(models.Model):
    leg = models.ForeignKey("TripLeg", on_delete=models.CASCADE, related_name="steps")
    # order within the leg
    step_order = models.PositiveIntegerField()

    instruction = models.TextField(blank=True, default="")
    distance_meters = models.DecimalField(max_digits=7, decimal_places=2)
    duration_seconds = models.DecimalField(max_digits=7, decimal_places=2)

    start_lat = models.FloatField()
    start_lon = models.FloatField()
    end_lat = models.FloatField()
    end_lon = models.FloatField()
    # [start_idx, end_idx] from ORS (optional)
    waypoints = models.JSONField(null=True, blank=True, default=list)

    def __str__(self):
        return f"Step {self.step_order} of Leg {self.leg.id}"
