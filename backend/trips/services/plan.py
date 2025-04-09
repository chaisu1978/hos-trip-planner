from .ors import get_route, get_optimized_route
from ..models import Trip, TripLeg, TripSegmentStep
from decimal import Decimal
from .hos import chunk_legs_by_hos
from datetime import timedelta
from django.utils import timezone
from math import radians, sin, cos, sqrt, atan2

def _resolve_label(leg_data, which: str) -> str:
    """
    Original old-version logic for non-drive segments
    (fuel, break, rest, pickup, dropoff).
    Also checks for a {which}_label if it exists.
    """
    if leg_data.get(f"{which}_label"):
        return leg_data[f"{which}_label"]

    leg_type = leg_data.get("leg_type")
    if leg_type == "fuel":
        return "Fuel Stop"
    elif leg_type == "rest":
        return "10-hr Rest Break"
    elif leg_type == "break":
        return "30-min Break"
    elif leg_type == "pickup":
        return "Pickup Stop"
    elif leg_type == "dropoff":
        return "Dropoff Stop"

    # If it's not drive, fuel, break, rest, etc., default to empty string
    return ""

def plan_trip(trip: Trip):
    """
    Hybrid approach:
      - For drive segments, we label them 'Pickup Leg X' vs. 'Dropoff Leg X'
        using the chunk_legs_by_hos segment_index (0 => current->pickup, 1 => pickup->dropoff).
      - For non-drive segments (fuel, break, rest, pickup, dropoff),
        we re-use the old _resolve_label() logic to get the nice wording.
      - No reverse_geocode calls, no time.sleep calls.
    """

    # Coordinates: 0 => current, 1 => pickup, 2 => dropoff
    coordinates = [
        [trip.current_location_lon, trip.current_location_lat],
        [trip.pickup_location_lon, trip.pickup_location_lat],
        [trip.dropoff_location_lon, trip.dropoff_location_lat],
    ]

    USE_OPTIMIZATION = False
    if USE_OPTIMIZATION:
        result = get_optimized_route(coordinates)
    else:
        result = get_route(coordinates)
        geometry = result.get("geometry", [])

    def haversine_distance_miles(lon1, lat1, lon2, lat2):
        """
        Compute the great-circle distance between two geographic points (in miles)
        using the Haversine formula.

        Parameters:
        - lon1, lat1: Longitude and latitude of the first point
        - lon2, lat2: Longitude and latitude of the second point

        Returns:
        - Distance in miles as a float
            """
        R = 3958.8  # Radius of Earth in miles
        dlon = radians(lon2 - lon1)
        dlat = radians(lat2 - lat1)
        a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        return R * c

    def build_cumulative_coords(route_coords):
        """
        route_coords is your entire polyline: [ (lon,lat), (lon,lat), ... ]
        Returns a list of (cum_miles, lon, lat).
        """
        cum = []
        total = 0.0
        prev_lon, prev_lat = route_coords[0]
        cum.append((0.0, prev_lon, prev_lat))

        for (lon, lat) in route_coords[1:]:
            dist_mi = haversine_distance_miles(prev_lon, prev_lat, lon, lat)
            total += dist_mi
            cum.append((total, lon, lat))
            prev_lon, prev_lat = lon, lat

        return cum

    # Save trip-level summary
    trip.planned_distance_miles = result["distance_miles"]
    trip.planned_duration_hours = result["duration_hours"]
    trip.save()

    geometry = result.get("geometry", [])
    cum_coords = build_cumulative_coords(geometry)

    trip.legs.all().delete()

    # Break the route into segments, then chunk by HOS with interpolation support
    segments = result.get("segments", [])
    hos_legs = chunk_legs_by_hos(
        segments=segments,
        coordinates=coordinates,
        start_cycle_hours=Decimal(trip.current_cycle_hours),
        cum_coords=cum_coords,
        total_route_distance=Decimal(result["distance_miles"])
    )


    current_time = trip.departure_time

    # We'll track how many drive legs we have for pickup vs dropoff
    pickup_drive_count = 1
    dropoff_drive_count = 1

    # Keep track of last known lat/lon/label for short non-drive segments
    last_known_lat = trip.current_location_lat
    last_known_lon = trip.current_location_lon
    last_known_label = trip.current_location_label or "Starting Location"

    for idx, leg_data in enumerate(hos_legs):
        # chunk_legs_by_hos often sets segment_index so we know whether it's part of:
        # 0 => current->pickup, 1 => pickup->dropoff
        segment_index = leg_data.pop("segment_index", None)

        # Distinguish drive vs. non-drive
        is_drive = (
            leg_data.get("distance_miles", 0) > 0
            and not leg_data.get("is_rest_stop")
            and not leg_data.get("is_fuel_stop")
        )

        # We'll remove steps from the data dict since we store them separately
        leg_steps = leg_data.pop("steps", [])

        if is_drive:
            # We rely on segment_index to decide if it's "Pickup Leg" or "Dropoff Leg"
            if segment_index == 0:
                label = f"Pickup Leg {pickup_drive_count}"
                pickup_drive_count += 1
            else:
                label = f"Dropoff Leg {dropoff_drive_count}"
                dropoff_drive_count += 1

            start_label = label
            end_label = label

            # If we have step coords, update last known lat/lon
            if leg_steps:
                first_step = leg_steps[0]
                last_step = leg_steps[-1]
                start_lat = first_step.get("start_lat", last_known_lat)
                start_lon = first_step.get("start_lon", last_known_lon)
                end_lat = last_step.get("end_lat", start_lat)
                end_lon = last_step.get("end_lon", start_lon)
            else:
                # Fallback
                start_lat = last_known_lat
                start_lon = last_known_lon
                end_lat = last_known_lat
                end_lon = last_known_lon

            # Update last known location
            last_known_lat = end_lat
            last_known_lon = end_lon
            last_known_label = label

        else:
            # Non-drive leg => label with old logic
            start_label = _resolve_label(leg_data, "start") or last_known_label
            end_label = _resolve_label(leg_data, "end") or last_known_label

        # Remove leftover fields
        leg_data.pop("start_label", None)
        leg_data.pop("end_label", None)

        # Calculate times
        duration_hrs = leg_data["duration_hours"]
        duration_seconds = float(duration_hrs) * 3600
        leg_data["departure_time"] = current_time
        current_time += timedelta(seconds=duration_seconds)
        leg_data["arrival_time"] = current_time

        # Create the DB record
        new_leg = TripLeg.objects.create(
            trip=trip,
            **leg_data,
            start_label=start_label,
            end_label=end_label,
        )


def _label_from_index(i, trip: Trip) -> str:
    if i == 0:
        return f"{trip.current_location_label} → {trip.pickup_location_label}"
    if i == 1:
        return f"{trip.pickup_location_label} → {trip.dropoff_location_label}"
    return f"{trip.pickup_location_label} → {trip.dropoff_location_label}"
