from .ors import get_route, get_optimized_route
from ..models import Trip, TripLeg, TripSegmentStep
from decimal import Decimal
from .hos import chunk_legs_by_hos
from datetime import timedelta
from django.utils import timezone

def _resolve_label(leg_data, which: str, trip: Trip) -> str:
    """ Helper to generate a label for a leg based on its data """
    if leg_data.get(f"{which}_label"):
        return leg_data[f"{which}_label"]
    return _label_from_index(leg_data["leg_order"], trip)


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

    USE_OPTIMIZATION = True

    if USE_OPTIMIZATION:
        result = get_optimized_route(coordinates)
    else:
        result = get_route(coordinates)

    trip.planned_distance_miles = result["distance_miles"]
    trip.planned_duration_hours = result["duration_hours"]
    trip.save()

    # 👇 NEW: extract geometry early
    geometry = result.get("geometry", [])

    trip.legs.all().delete()
    segments = result.get("segments", [])
    hos_legs = chunk_legs_by_hos(segments, coordinates, Decimal(trip.current_cycle_hours))

    current_time = trip.departure_time

    for leg_data in hos_legs:
        seg_idx = leg_data.get("segment_index")

        leg_data.pop("start_label", None)
        leg_data.pop("end_label", None)
        leg_data.pop("segment_index", None)

        duration_hrs = leg_data["duration_hours"]
        duration_seconds = float(duration_hrs) * 3600

        leg_data["departure_time"] = current_time
        current_time += timedelta(seconds=duration_seconds)
        leg_data["arrival_time"] = current_time

        # ✅ inject optimization geometry ONCE into first drive leg
        if not leg_data.get("is_rest_stop") and geometry:
            # Flip (lon, lat) to (lat, lon) before storing
            leg_data["polyline_geometry"] = [(lat, lon) for lon, lat in geometry]
            geometry = []  # Ensure it's only used once

        leg = TripLeg.objects.create(
            trip=trip,
            **leg_data,
            start_label=_resolve_label(leg_data, "start", trip),
            end_label=_resolve_label(leg_data, "end", trip),
        )

        if not leg.is_rest_stop and seg_idx is not None:
            leg_steps = segments[seg_idx].get("steps", [])
            if leg_steps:
                decoded_polyline = []
                for j, step in enumerate(leg_steps):
                    TripSegmentStep.objects.create(
                        leg=leg,
                        step_order=j,
                        instruction=step.get("instruction", ""),
                        distance_meters=Decimal(step.get("distance", 0)),
                        duration_seconds=Decimal(str(step.get("duration") or "0")),
                        start_lat=step.get("start_lat", leg.start_lat),
                        start_lon=step.get("start_lon", leg.start_lon),
                        end_lat=step.get("end_lat", leg.end_lat),
                        end_lon=step.get("end_lon", leg.end_lon),
                        waypoints=step.get("way_points", []),
                    )
                    decoded_polyline.append([step["start_lat"], step["start_lon"]])
                decoded_polyline.append([
                    leg_steps[-1]["end_lat"],
                    leg_steps[-1]["end_lon"]
                ])
                leg.polyline_geometry = decoded_polyline
                leg.save()


def _label_from_index(i, trip: Trip) -> str:
    labels = [
        f"Start: {trip.current_location_label}",
        f"Pickup: {trip.pickup_location_label}",
        f"Dropoff: {trip.dropoff_location_label}",
    ]
    if i < len(labels):
        return labels[i]
    return f"From {trip.pickup_location_label} to {trip.dropoff_location_label}"
