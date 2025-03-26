# trips/services/hos.py

from decimal import Decimal
from typing import List


# FMCSA constants
HOS_MAX_DRIVE_HOURS = Decimal("11.0")
HOS_MAX_DUTY_HOURS = Decimal("14.0")
HOS_REST_BREAK_HOURS = Decimal("10.0")
HOS_BREAK_REQUIRED_AFTER_HOURS = Decimal("8.0")
HOS_CYCLE_LIMIT_HOURS = Decimal("70.0")


def chunk_legs_by_hos(segments: List[dict], coordinates: List[list], start_cycle_hours: Decimal):
    """
    Splits segments into TripLeg-style dicts, inserting rest stops when HOS rules require it.
    Includes `segment_index` to allow mapping steps back to ORS response.
    """

    legs = []
    current_drive_hours = Decimal("0.0")
    current_cycle_hours = Decimal(start_cycle_hours)
    leg_order = 0

    for i, segment in enumerate(segments):
        seg_duration_hrs = Decimal(segment["duration"]) / 3600
        seg_distance_miles = Decimal(segment["distance"])

        # Insert a rest break if HOS driving or cycle limit would be exceeded
        if (
            current_drive_hours + seg_duration_hrs > HOS_MAX_DRIVE_HOURS
            or current_cycle_hours + seg_duration_hrs > HOS_CYCLE_LIMIT_HOURS
        ):
            legs.append({
                "leg_order": leg_order,
                "start_label": "Rest Break",
                "end_label": "Rest Break",
                "start_lat": None,
                "start_lon": None,
                "end_lat": None,
                "end_lon": None,
                "distance_miles": Decimal("0.0"),
                "duration_hours": HOS_REST_BREAK_HOURS,
                "is_rest_stop": True,
                "is_fuel_stop": False,
                "notes": "Required 10-hour rest break"
            })
            leg_order += 1
            current_drive_hours = Decimal("0.0")
            current_cycle_hours += HOS_REST_BREAK_HOURS

        start_coords = coordinates[i]
        end_coords = coordinates[i + 1]

        legs.append({
            "leg_order": leg_order,
            "segment_index": i,  # NEW: index to reference the ORS segment
            "start_label": None,  # override in plan_trip if needed
            "end_label": None,
            "start_lat": start_coords[1],
            "start_lon": start_coords[0],
            "end_lat": end_coords[1],
            "end_lon": end_coords[0],
            "distance_miles": seg_distance_miles,
            "duration_hours": seg_duration_hrs,
            "is_rest_stop": False,
            "is_fuel_stop": False,
            "notes": ""
        })

        leg_order += 1
        current_drive_hours += seg_duration_hrs
        current_cycle_hours += seg_duration_hrs

    return legs
