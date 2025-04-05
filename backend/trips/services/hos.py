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

def find_coord_at(cum_coords, target_miles):
    """
    Given the list of (cum_miles, lon, lat),
    return an interpolated (lon, lat) for target_miles.
    If target_miles is beyond the end, clamp to the last coordinate.
    """
    if target_miles <= 0:
        return (cum_coords[0][1], cum_coords[0][2])  # (lon, lat)

    # If beyond end, clamp:
    if target_miles >= cum_coords[-1][0]:
        return (cum_coords[-1][1], cum_coords[-1][2])

    # Otherwise, binary search or linear search.
    # We'll do a simple linear approach here for clarity:
    for i in range(len(cum_coords) - 1):
        distA, lonA, latA = cum_coords[i]
        distB, lonB, latB = cum_coords[i+1]

        if distA <= target_miles <= distB:
            # We are in between i and i+1
            ratio = (target_miles - distA) / (distB - distA)
            # linear interpolation:
            lon = lonA + ratio * (lonB - lonA)
            lat = latA + ratio * (latB - latA)
            return (lon, lat)

    # Fallback (shouldn't happen if above checks are correct)
    return (cum_coords[-1][1], cum_coords[-1][2])


def slice_geometry_for_leg(cum_coords, start_miles, end_miles):
    """
    Returns a slice of the geometry from cum_coords between start_miles and end_miles.
    Converts to (lat, lon) tuples for Leaflet.
    """
    coords = []
    for cum_mi, lon, lat in cum_coords:
        if start_miles <= cum_mi <= end_miles:
            coords.append((lat, lon))  # Flip to (lat, lon) for Leaflet
        elif cum_mi > end_miles:
            break
    return coords


def chunk_legs_by_hos(segments, coordinates, start_cycle_hours, cum_coords, total_route_distance):
    """
    A fully incremental approach that:
      - Slices each segment into smaller partial drive legs
      - Checks fueling every 1000 miles
      - Respects 11-hr drive limit, 8-hr break, 70-hr cycle, etc.
      - Inserts rest breaks & fuel stops exactly when needed
      - Avoids negative leftover or weird 'OTHER' segments
    """
    legs = []
    leg_order = 0
    progress_miles = Decimal("0.0")  # how far along the route we are

    # Tracking
    current_cycle_hours = Decimal(start_cycle_hours)
    current_drive_hours = Decimal("0.0")
    duty_hours_since_rest = Decimal("0.0")
    drive_hours_since_break = Decimal("0.0")
    miles_since_fuel = Decimal("0.0")

    pickup_stop_inserted = False

    def add_event_leg(label: str,
                      duration_hrs: Decimal,
                      note: str,
                      is_rest=False,
                      is_fuel=False):
        """
        Creates a zero-distance 'leg' at the end of the last leg's coordinates.
        """
        nonlocal leg_order, current_cycle_hours, duty_hours_since_rest
        nonlocal current_drive_hours, drive_hours_since_break, miles_since_fuel

        last_leg = legs[-1] if legs else {}
        # We place the event at the "end" of the last drive leg
        # so that is find_coord_at(cum_coords, progress_miles)
        event_lon, event_lat = find_coord_at(cum_coords, float(progress_miles))

        # If we already have a rest immediately prior, skip
        if is_rest and last_leg.get("is_rest_stop", False):
            return

        legs.append({
            "leg_order": leg_order,
            "start_label": label,
            "end_label": label,
            "start_lat": event_lat,
            "start_lon": event_lon,
            "end_lat": event_lat,
            "end_lon": event_lon,
            "distance_miles": 0.0,
            "duration_hours": duration_hrs,
            "is_rest_stop": is_rest,
            "is_fuel_stop": is_fuel,
            "notes": note,
            "steps": []
        })
        leg_order += 1

        # Update counters
        current_cycle_hours += duration_hrs
        duty_hours_since_rest += duration_hrs

        if is_rest:
            # Reset daily drive counters after a 10-hr rest
            current_drive_hours = Decimal("0.0")
            duty_hours_since_rest = Decimal("0.0")
            drive_hours_since_break = Decimal("0.0")

    # Helper: create a partial drive chunk
    def add_drive_leg(chunk_miles, duration_hrs, seg_index, steps=None):
        nonlocal leg_order, current_cycle_hours, duty_hours_since_rest
        nonlocal current_drive_hours, drive_hours_since_break, miles_since_fuel
        nonlocal progress_miles
        if steps is None:
            steps = []
        # Start coordinate
        start_lon, start_lat = find_coord_at(cum_coords, float(progress_miles))
        # End coordinate
        end_lon, end_lat = find_coord_at(cum_coords, float(progress_miles + chunk_miles))


        geometry_slice = slice_geometry_for_leg(
            cum_coords,
            float(progress_miles),
            float(progress_miles + chunk_miles)
        )

        legs.append({
            "leg_order": leg_order,
            "segment_index": seg_index,
            "start_label": None,
            "end_label": None,
            "start_lat": start_lat,
            "start_lon": start_lon,
            "end_lat": end_lat,
            "end_lon": end_lon,
            "distance_miles": chunk_miles,
            "duration_hours": duration_hrs,
            "is_rest_stop": False,
            "is_fuel_stop": False,
            "notes": "",
            "steps": steps,
            "polyline_geometry": geometry_slice,  # 👈 the new line!
        })

        # advance the progress
        progress_miles += chunk_miles
        # update all your HOS counters, etc.

        leg_order += 1

        # Update counters
        current_cycle_hours += duration_hrs
        duty_hours_since_rest += duration_hrs
        current_drive_hours += duration_hrs
        drive_hours_since_break += duration_hrs
        miles_since_fuel += chunk_miles

    for i, segment in enumerate(segments):
        seg_distance_miles = Decimal(segment["distance"])
        seg_duration_hrs = Decimal(segment["duration"]) / 3600
        seg_steps = segment.get("steps", [])

        if i == 0 and not pickup_stop_inserted:
            # We'll insert the pickup stop AFTER the first drive chunk of this segment, so let's keep a flag
            pass

        # The ratio from distance -> duration
        # (assuming uniform speed across segment)
        if seg_distance_miles > 0:
            # hours per mile
            speed_ratio = seg_duration_hrs / seg_distance_miles
        else:
            speed_ratio = Decimal("0.0")

        # While we have distance left in this segment:
        dist_left = seg_distance_miles
        while dist_left > 0:
            # 1) If we are near the 8-hour mark, do we need a break?
            if drive_hours_since_break >= HOS_BREAK_REQUIRED_AFTER_HOURS:
                add_event_leg("30-min Break", HOS_MIN_BREAK_DURATION, "30-minute required HOS break")
                drive_hours_since_break = Decimal("0.0")

            # 2) Check if we've exceeded the 70-hour cycle limit:
            if current_cycle_hours >= HOS_CYCLE_LIMIT_HOURS:
                # Insert 34-hour reset
                add_event_leg("Cycle Reset", Decimal("34.0"), "34-hour off-duty reset to restart 70-hour cycle", is_rest=True)

                # This rest fully resets your cycle counters
                current_cycle_hours = Decimal("0.0")
                duty_hours_since_rest = Decimal("0.0")
                current_drive_hours = Decimal("0.0")
                drive_hours_since_break = Decimal("0.0")
                miles_since_fuel = Decimal("0.0")

                # Continue after the cycle reset, so more driving can happen in the same while loop iteration
                # or break if you prefer to let next iteration handle new chunk

            # 3) If we are near the 11-hour or 14-hour daily limit, do a 10-hr rest
            if (current_drive_hours >= HOS_MAX_DRIVE_HOURS
            or duty_hours_since_rest >= HOS_MAX_DUTY_HOURS):
                # Insert 10-hour rest
                add_event_leg("Rest Break", HOS_REST_BREAK_HOURS, "Required 10-hour rest break", is_rest=True)
                # That resets daily counters, so we can keep going


            # 3) Figure out how many hours remain in the daily 11-hour drive limit:
            daily_drive_left = HOS_MAX_DRIVE_HOURS - current_drive_hours
            if daily_drive_left <= 0:
                # We must do a rest break
                add_event_leg("Rest Break", HOS_REST_BREAK_HOURS, "Required 10-hour rest break", is_rest=True)
                daily_drive_left = HOS_MAX_DRIVE_HOURS

            # 4) Fuel check: how many miles until we must refuel?
            fuel_miles_left = FUEL_STOP_INTERVAL_MILES - miles_since_fuel
            if fuel_miles_left <= 0:
                # If we've already exceeded 1000 miles somehow, force a fuel stop
                add_event_leg("Fuel Stop", FUEL_STOP_DURATION, "Fuel stop required every 1000 miles", is_fuel=True)
                fuel_miles_left = FUEL_STOP_INTERVAL_MILES

            # 5) We can only drive the lesser of:
            #    - dist_left in segment
            #    - fuel_miles_left
            #    - daily_drive_left in miles
            if speed_ratio == 0:
                # Means no distance? We skip
                chunk_miles = dist_left
                chunk_hrs = Decimal("0.0")
            else:
                daily_drive_miles_left = HOS_MAX_DRIVE_HOURS - current_drive_hours
                daily_drive_miles_left /= speed_ratio

                fuel_miles_left = FUEL_STOP_INTERVAL_MILES - miles_since_fuel

                break_miles_left = Decimal("Infinity")
                if drive_hours_since_break < HOS_BREAK_REQUIRED_AFTER_HOURS:
                    break_time_left = HOS_BREAK_REQUIRED_AFTER_HOURS - drive_hours_since_break
                    break_miles_left = break_time_left / speed_ratio

                # Compute how many miles we can safely drive before needing a break, fuel, or rest
                chunk_miles = min(dist_left, fuel_miles_left, daily_drive_miles_left, break_miles_left)
                chunk_hrs = chunk_miles * speed_ratio

            # 6) Create a partial drive leg
            start_coord = coordinates[i]
            end_coord = coordinates[i + 1]
            add_drive_leg(chunk_miles, chunk_hrs, i, seg_steps)

            # 7) Subtract from the segment
            dist_left -= chunk_miles
            seg_duration_hrs -= chunk_hrs

            # 8) If chunk_miles == fuel_miles_left => we hit 1000 exactly => fuel
            #   Or if miles_since_fuel >= 1000
            if miles_since_fuel >= FUEL_STOP_INTERVAL_MILES:
                add_event_leg("Fuel Stop", FUEL_STOP_DURATION, "Fuel stop required every 1000 miles", is_fuel=True)
                miles_since_fuel = Decimal("0.0")

            # 9) If daily_drive_left == chunk_hrs => might need rest next loop
            # We handle that at the top of next iteration or after we exit.

        # Insert a 1-hr pickup stop if it's the first segment
        if i == 0 and not pickup_stop_inserted:
            add_event_leg("Pickup Stop", PICKUP_DROPOFF_DURATION, "1-hour stop for pickup")
            pickup_stop_inserted = True

    # After finishing all segments, we add final dropoff
    add_event_leg("Dropoff Stop", PICKUP_DROPOFF_DURATION, "1-hour stop for dropoff")

    return legs
