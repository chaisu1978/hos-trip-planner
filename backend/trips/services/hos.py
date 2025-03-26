from decimal import Decimal
from typing import List

# FMCSA constants
HOS_MAX_DRIVE_HOURS = Decimal("11.0")
HOS_MAX_DUTY_HOURS = Decimal("14.0")
HOS_REST_BREAK_HOURS = Decimal("10.0")
HOS_BREAK_REQUIRED_AFTER_HOURS = Decimal("8.0")
HOS_CYCLE_LIMIT_HOURS = Decimal("70.0")
HOS_MIN_BREAK_DURATION = Decimal("0.5")
FUEL_STOP_INTERVAL_MILES = Decimal("1000.0")
FUEL_STOP_DURATION = Decimal("0.25")
PICKUP_DROPOFF_DURATION = Decimal("1.0")

def chunk_legs_by_hos(segments: List[dict], coordinates: List[list], start_cycle_hours: Decimal):
    """
    Splits segments into TripLeg-style dicts, inserting rest stops, fuel stops,
    and breaks based on FMCSA Hours of Service rules.
    """
    legs = []
    current_drive_hours = Decimal("0.0")
    current_cycle_hours = Decimal(start_cycle_hours)
    duty_hours_since_rest = Decimal("0.0")
    drive_hours_since_break = Decimal("0.0")
    miles_since_fuel = Decimal("0.0")
    leg_order = 0

    def add_event_leg(label, duration, note, is_rest=False, is_fuel=False):
        nonlocal leg_order, current_cycle_hours, duty_hours_since_rest, current_drive_hours
        # Use last known end coords if available
        last_leg = legs[-1] if legs else {}
        legs.append({
            "leg_order": leg_order,
            "start_label": label,
            "end_label": label,
            "start_lat": last_leg.get("end_lat"),
            "start_lon": last_leg.get("end_lon"),
            "end_lat": last_leg.get("end_lat"),
            "end_lon": last_leg.get("end_lon"),
            "distance_miles": Decimal("0.0"),
            "duration_hours": duration,
            "is_rest_stop": is_rest,
            "is_fuel_stop": is_fuel,
            "notes": note
        })
        leg_order += 1
        current_cycle_hours += duration
        duty_hours_since_rest += duration
        if is_rest:
            current_drive_hours = Decimal("0.0")
            duty_hours_since_rest = Decimal("0.0")
            drive_hours_since_break = Decimal("0.0")

    # Insert 1 hour at pickup
    add_event_leg("Pickup Stop", PICKUP_DROPOFF_DURATION, "1-hour stop for pickup", is_rest=False)

    for i, segment in enumerate(segments):
        seg_duration_hrs = Decimal(segment["duration"]) / 3600
        seg_distance_miles = Decimal(segment["distance"])

        # Enforce 30-min break if > 8 hours driving since last break
        if drive_hours_since_break + seg_duration_hrs > HOS_BREAK_REQUIRED_AFTER_HOURS:
            add_event_leg("30-min Break", HOS_MIN_BREAK_DURATION, "30-minute required HOS break")

        # Enforce fuel stop every 1000 miles
        if miles_since_fuel + seg_distance_miles > FUEL_STOP_INTERVAL_MILES:
            add_event_leg("Fuel Stop", FUEL_STOP_DURATION, "Fuel stop required every 1000 miles", is_fuel=True)
            miles_since_fuel = Decimal("0.0")

        # Enforce 10-hour rest if 11h drive OR 14h duty OR 70h cycle would be exceeded
        if (
            current_drive_hours + seg_duration_hrs > HOS_MAX_DRIVE_HOURS or
            duty_hours_since_rest + seg_duration_hrs > HOS_MAX_DUTY_HOURS or
            current_cycle_hours + seg_duration_hrs > HOS_CYCLE_LIMIT_HOURS
        ):
            add_event_leg("Rest Break", HOS_REST_BREAK_HOURS, "Required 10-hour rest break", is_rest=True)

        start_coords = coordinates[i]
        end_coords = coordinates[i + 1]

        legs.append({
            "leg_order": leg_order,
            "segment_index": i,
            "start_label": None,
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
        duty_hours_since_rest += seg_duration_hrs
        drive_hours_since_break += seg_duration_hrs
        miles_since_fuel += seg_distance_miles

    # Insert 1 hour at dropoff
    add_event_leg("Dropoff Stop", PICKUP_DROPOFF_DURATION, "1-hour stop for dropoff", is_rest=False)

    return legs
