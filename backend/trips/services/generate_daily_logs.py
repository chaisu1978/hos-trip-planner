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
    return "other"

def map_status(status):
    return {
        "pickup": "on_duty",
        "dropoff": "on_duty",
        "fuel": "on_duty",
        "break": "off_duty",
        "rest": "sleeper_berth",
        "drive": "driving"
    }.get(status, "off_duty")

def generate_daily_logs(trip):
    """
    1. For each leg, we assign day-based 15-min increments.
    2. We do NOT skip or remove 00:00 segments: 
       We want both the evening portion and the morning portion to exist.
    3. For each day, we convert increments into 'periods'.
    4. We forcibly 'cap' the day at 23:59 if it tries to run to next day.
    5. Next day starts fresh at 00:00 (which means you see the "morning after").
    """
    from collections import defaultdict
    
    timeline = defaultdict(lambda: defaultdict(str))  # day -> {HH:MM -> status}
    miles_by_date = defaultdict(float)
    hours_by_date = defaultdict(float)

    # We store the "first_legs" and "last_legs" 
    # so we can decide each day's earliest and latest references
    first_legs = {}
    last_legs = {}

    legs = trip.legs.all().order_by("departure_time")
    if not legs:
        return []

    def clean_label(label):
        if not label:
            return ""
        ll = label.lower()
        if ll.startswith("from "):
            parts = label[5:].split(" to ")
            return parts[0].strip() if parts else label
        if ll.startswith("pickup:") or ll.startswith("dropoff:"):
            return label.split(":", 1)[-1].strip()
        if ll.startswith("start:"):
            return label.split(":", 1)[-1].strip()
        return label.strip()

    trip_start_label = clean_label(legs.first().start_label)
    trip_end_label   = clean_label(legs.last().end_label)

    # Phase 1: Fill timeline in 15-min increments.
    for leg in legs:
        start_dt = localtime(leg.departure_time)
        end_dt   = localtime(leg.arrival_time)
        status   = map_status(get_leg_type(leg))

        current = start_dt
        while current < end_dt:
            # day boundary
            day_start = datetime.combine(current.date(), time.min, tzinfo=current.tzinfo)
            day_end   = day_start + timedelta(days=1)
            seg_end   = min(end_dt, day_end)

            seg_day = current.date().isoformat()
            if seg_day not in first_legs:
                first_legs[seg_day] = leg
            last_legs[seg_day] = leg

            # Fill 15-min blocks with 'status'
            time_cursor = current
            while time_cursor < seg_end:
                t_str = time_cursor.strftime("%H:%M")
                existing = timeline[seg_day].get(t_str)
                if (not existing) or (STATUS_PRIORITY[status] < STATUS_PRIORITY[existing]):
                    timeline[seg_day][t_str] = status

                time_cursor += timedelta(minutes=15)

            # Proportional miles/hours
            duration_mins = (seg_end - current).total_seconds() / 60.0
            hours = duration_mins / 60.0
            if float(leg.duration_hours or 0) > 0:
                # leg.distance_miles is decimal, so convert to float carefully
                dist = float(leg.distance_miles)
                dur  = float(leg.duration_hours)
                miles = (dist * hours) / dur
            else:
                miles = 0.0

            miles_by_date[seg_day] += miles
            hours_by_date[seg_day] += hours

            current = seg_end  # move on

    # Phase 2: Convert each day's 15-min 'status' blocks into duty periods
    logs = []
    sorted_days = sorted(timeline.keys())

    for day_key in sorted_days:
        day_slots = timeline[day_key]
        sorted_times = sorted(day_slots)
        periods = []

        current_stat = None
        start_time = None
        for slot in sorted_times:
            st = day_slots[slot]
            if st != current_stat:
                if current_stat and start_time != slot:
                    periods.append({
                        "status": current_stat,
                        "start": start_time,
                        "end": slot
                    })
                current_stat = st
                start_time = slot

        # close final
        if current_stat and start_time:
            # clamp to 23:59 if needed
            # unless it's actually the final day -> 
            #   we can do 'arr_end' if we want the real arrival?
            # But let's keep it consistent: always go to 23:59 
            # if the next day is in sorted_days
            # We can do a quick check if day_key is the last in sorted_days
            is_last_day = (day_key == sorted_days[-1])
            if is_last_day:
                # actual arrival if we want
                last_leg = last_legs[day_key]
                if last_leg:
                    arr_str = localtime(last_leg.arrival_time).strftime("%H:%M")
                    if start_time != arr_str:
                        periods.append({
                            "status": current_stat,
                            "start": start_time,
                            "end": arr_str
                        })
                else:
                    # no leg? just do 23:59
                    if start_time != "23:59":
                        periods.append({
                            "status": current_stat,
                            "start": start_time,
                            "end": "23:59"
                        })
            else:
                # forcibly 23:59
                if start_time != "23:59":
                    periods.append({
                        "status": current_stat,
                        "start": start_time,
                        "end": "23:59"
                    })

        # Summation
        status_hours = defaultdict(float)
        for prd in periods:
            h1,m1 = map(int,prd["start"].split(":"))
            h2,m2 = map(int,prd["end"].split(":"))
            start_min = h1*60 + m1
            end_min   = h2*60 + m2
            if end_min < start_min:
                end_min += 24*60
            dur = (end_min - start_min)/60.0
            status_hours[prd["status"]] += dur

        total_hrs = sum(status_hours.values())
        parsed_date = datetime.strptime(day_key, "%Y-%m-%d").date()

        logs.append({
            "date": day_key,
            "day": parsed_date.day,
            "month": calendar.month_name[parsed_date.month],
            "year": parsed_date.year,
            "from_location": trip_start_label,
            "to_location": trip_end_label,
            "duty_periods": periods,
            "total_miles": round(miles_by_date[day_key], 2),
            "total_hours": round(total_hrs, 2),
            "off_duty_total":      round(status_hours["off_duty"], 2),
            "sleeper_berth_total": round(status_hours["sleeper_berth"], 2),
            "driving_total":       round(status_hours["driving"], 2),
            "on_duty_total":       round(status_hours["on_duty"], 2),
        })

    return logs
