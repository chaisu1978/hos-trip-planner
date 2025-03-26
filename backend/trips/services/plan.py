from .ors import get_route
from ..models import Trip, TripLeg, TripSegmentStep
from decimal import Decimal


def plan_trip(trip: Trip):
    """
    Given a Trip instance (with locations), calls ORS and populates route data.
    Creates TripLegs for the route: current → pickup → dropoff
    """

    # ORS wants coordinates as [lon, lat]
    coordinates = [
        [trip.current_location_lon, trip.current_location_lat],
        [trip.pickup_location_lon, trip.pickup_location_lat],
        [trip.dropoff_location_lon, trip.dropoff_location_lat],
    ]

    # 1. Call ORS
    result = get_route(coordinates)

    trip.planned_distance_miles = result["distance_miles"]
    trip.planned_duration_hours = result["duration_hours"]
    trip.save()

    # 2. Clear existing legs if this is a re-plan
    trip.legs.all().delete()

    segments = result["segments"]
    total_legs = len(segments)

    for i, segment in enumerate(segments):
        start = coordinates[i]
        end = coordinates[i + 1]

        # Create leg
        leg = TripLeg.objects.create(
            trip=trip,
            leg_order=i,
            start_label=_label_from_index(i, trip),
            start_lat=start[1],
            start_lon=start[0],
            end_label=_label_from_index(i + 1, trip),
            end_lat=end[1],
            end_lon=end[0],
            distance_miles=Decimal(segment["distance"]),
            duration_hours=Decimal(segment["duration"]) / 3600,
        )

        # Add steps (optional now, but nice)
        for j, step in enumerate(segment.get("steps", [])):
            TripSegmentStep.objects.create(
                leg=leg,
                step_order=j,
                instruction=step.get("instruction", ""),
                distance_meters=Decimal(step.get("distance", 0)),
                duration_seconds=Decimal(step.get("duration", 0)),
                start_lat=start[1],
                start_lon=start[0],
                end_lat=end[1],
                end_lon=end[0],
                waypoints=step.get("way_points", []),
            )


def _label_from_index(i, trip: Trip) -> str:
    return {
        0: trip.current_location_label,
        1: trip.pickup_location_label,
        2: trip.dropoff_location_label,
    }.get(i, f"Point {i}")
