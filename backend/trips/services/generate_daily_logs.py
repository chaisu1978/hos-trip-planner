from collections import defaultdict
from datetime import timedelta, datetime, time
from django.utils.timezone import localtime
import calendar

STATUS_PRIORITY = {
    "sleeper_berth": 1,
    "off_duty": 2,
    "driving": 3,
    "on_duty": 4,
}


def get_leg_type(leg):
    if "34-hour" in leg.notes.lower():
        return "cycle"
    if leg.is_rest_stop:
        return "rest"
    if leg.is_fuel_stop:
        return "fuel"
    if "30-minute" in leg.notes.lower():
        return "break"
    if "pickup" in leg.notes.lower():
        return "pickup"
    if "dropoff" in leg.notes.lower():
        return "dropoff"
    if leg.distance_miles > 0:
        return "drive"
    return "rest"

def map_status(status):
    return {
        "pickup": "on_duty",
        "dropoff": "on_duty",
        "fuel": "on_duty",
        "break": "off_duty",
        "rest": "sleeper_berth",
        "cycle": "off_duty",
        "drive": "driving"
    }.get(status, "off_duty")

def generate_daily_logs(trip):
    """
    1. For each leg, we assign day-based 15-min increments (no skipping).
    2. Evening befores and morning afters both appear.
    3. We label every daily log with the trip's overall start_label and end_label
       (ignoring day-specific from/to).
    4. The final day ends at the actual arrival time; prior days clamp to 23:59.
    """

    timeline = defaultdict(lambda: defaultdict(str))  # day_key -> {HH:MM -> status}
    miles_by_date = defaultdict(float)
    hours_by_date = defaultdict(float)

    # We'll still track earliest & latest leg per day internally
    # but won't actually use them for from/to labels, as requested.
    first_legs = {}
    last_legs = {}

    legs = trip.legs.all().order_by("departure_time")
    if not legs:
        return []

    def clean_label(label, want_second_chunk=False):
        if not label:
            return ""

        ll = label.lower().strip()

        if ll.startswith("from "):
            # e.g. "From Chicago, IL to Dallas, TX"
            after_from = label[5:]  # "Chicago, IL to Dallas, TX"
            parts = after_from.split(" to ")
            # parts == ["Chicago, IL", "Dallas, TX"]
            if len(parts) == 2:
                if want_second_chunk:
                    return parts[1].strip()
                else:
                    return parts[0].strip()
            return label

        if ll.startswith("pickup:") or ll.startswith("dropoff:"):
            return label.split(":", 1)[-1].strip()

        if ll.startswith("start:"):
            return label.split(":", 1)[-1].strip()

        return label.strip()

    # For the entire trip's start/end labeling
    trip_start_label = clean_label(legs.first().start_label, want_second_chunk=False)
    trip_end_label   = clean_label(legs.last().end_label,  want_second_chunk=True)

    # ---- PHASE 1: BUILD 15-MIN TIMELINE PER DAY
    for leg in legs:
        start_dt = localtime(leg.departure_time)
        end_dt   = localtime(leg.arrival_time)
        status   = map_status(get_leg_type(leg))

        current = start_dt
        while current < end_dt:
            day_start = datetime.combine(current.date(), time.min, tzinfo=current.tzinfo)
            day_end   = day_start + timedelta(days=1)
            seg_end   = min(end_dt, day_end)

            day_key = current.date().isoformat()
            if day_key not in first_legs:
                first_legs[day_key] = leg
            last_legs[day_key] = leg

            # fill 15-min blocks
            time_cursor = current
            while time_cursor < seg_end:
                t_str = time_cursor.strftime("%H:%M")
                existing = timeline[day_key].get(t_str)
                if not existing or STATUS_PRIORITY[status] < STATUS_PRIORITY.get(existing, 99):
                    timeline[day_key][t_str] = status

                time_cursor += timedelta(minutes=15)

            # proportionally distribute distance/hours for that day
            seg_minutes = (seg_end - current).total_seconds() / 60.0
            seg_hours   = seg_minutes / 60.0

            if float(leg.duration_hours or 0) > 0:
                dist = float(leg.distance_miles)
                dur  = float(leg.duration_hours)
                seg_miles = (dist * seg_hours) / dur
            else:
                seg_miles = 0.0

            miles_by_date[day_key] += seg_miles
            hours_by_date[day_key] += seg_hours

            current = seg_end

    # ---- PHASE 2: CONVERT TIMELINE SLOTS -> PERIODS
    logs = []
    all_days = sorted(timeline.keys())

    for i, day_key in enumerate(all_days):
        day_slots = timeline[day_key]
        sorted_times = sorted(day_slots)
        periods = []

        current_stat = None
        start_time   = None

        # group timeslots into [start, end) periods
        for hhmm in sorted_times:
            st = day_slots[hhmm]
            if st != current_stat:
                if current_stat and start_time != hhmm:
                    periods.append({
                        "status": current_stat,
                        "start": start_time,
                        "end": hhmm
                    })
                current_stat = st
                start_time = hhmm

        if current_stat and start_time:
            # final chunk
            # if it's the last day in the entire trip, we can do actual arrival
            # otherwise, clamp to 23:59
            if i == len(all_days) - 1:
                # final day
                last_leg_of_day = last_legs.get(day_key)
                if last_leg_of_day:
                    arr_str = localtime(last_leg_of_day.arrival_time).strftime("%H:%M")
                    if start_time != arr_str:
                        periods.append({
                            "status": current_stat,
                            "start": start_time,
                            "end": arr_str
                        })
                else:
                    # fallback if no leg found
                    if start_time != "23:59":
                        periods.append({
                            "status": current_stat,
                            "start": start_time,
                            "end": "23:59"
                        })
            else:
                # clamp to 23:59
                if start_time != "23:59":
                    periods.append({
                        "status": current_stat,
                        "start": start_time,
                        "end": "23:59"
                    })

        # compute daily totals
        status_hours = defaultdict(float)
        for p in periods:
            h1,m1 = map(int, p["start"].split(":"))
            h2,m2 = map(int, p["end"].split(":"))
            st_min = h1*60 + m1
            ed_min = h2*60 + m2
            if ed_min < st_min:
                ed_min += 24*60
            dur_hrs = (ed_min - st_min)/60.0
            status_hours[p["status"]] += dur_hrs

        total_hrs = sum(status_hours.values())
        parsed_date = datetime.strptime(day_key, "%Y-%m-%d").date()

        # now we label every day's from/to with entire trip's start/end
        logs.append({
            "date": day_key,
            "day": parsed_date.day,
            "month": calendar.month_name[parsed_date.month],
            "year": parsed_date.year,
            "from_location": trip_start_label,
            "to_location":   trip_end_label,
            "duty_periods":  periods,
            "total_miles":   round(miles_by_date[day_key], 2),
            "total_hours":   round(total_hrs, 2),
            "off_duty_total":      round(status_hours["off_duty"], 2),
            "sleeper_berth_total": round(status_hours["sleeper_berth"], 2),
            "driving_total":       round(status_hours["driving"], 2),
            "on_duty_total":       round(status_hours["on_duty"], 2),
        })

    return logs
