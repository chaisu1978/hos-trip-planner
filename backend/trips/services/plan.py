from .ors import get_route
from ..models import Trip, TripLeg, TripSegmentStep
from decimal import Decimal
from .hos import chunk_legs_by_hos

def _resolve_label(leg_data, which: str, trip: Trip) -> str:
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

    # 1. Call ORS
    result = get_route(coordinates)

    trip.planned_distance_miles = result["distance_miles"]
    trip.planned_duration_hours = result["duration_hours"]
    trip.save()

    # 2. Clear existing legs if this is a re-plan
    trip.legs.all().delete()

    segments = result["segments"]
    total_legs = len(segments)

    hos_legs = chunk_legs_by_hos(segments, coordinates, Decimal(trip.current_cycle_hours))

    for leg_data in hos_legs:
        leg_data.pop("start_label", None)
        leg_data.pop("end_label", None)
        leg_data.pop("segment_index", None)

        leg = TripLeg.objects.create(
            trip=trip,
            **leg_data,
            start_label=_resolve_label(leg_data, "start", trip),
            end_label=_resolve_label(leg_data, "end", trip),
        )

        # only add steps if not a rest stop
        if not leg.is_rest_stop:
            seg_idx = leg_data.get("segment_index")
            if seg_idx is not None:
                for j, step in enumerate(segments[seg_idx].get("steps", [])):
                    TripSegmentStep.objects.create(
                        leg=leg,
                        step_order=j,
                        instruction=step.get("instruction", ""),
                        distance_meters=Decimal(step.get("distance", 0)),
                        duration_seconds=Decimal(str(step.get("duration") or "0")),
                        start_lat=leg.start_lat,
                        start_lon=leg.start_lon,
                        end_lat=leg.end_lat,
                        end_lon=leg.end_lon,
                        waypoints=step.get("way_points", []),
                    )


def _label_from_index(i, trip: Trip) -> str:
    return {
        0: trip.current_location_label,
        1: trip.pickup_location_label,
        2: trip.dropoff_location_label,
    }.get(i, f"Point {i}")
