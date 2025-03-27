from collections import defaultdict
from datetime import datetime
from django.utils.timezone import localtime


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


def generate_daily_logs(trip):
    """
    Generates structured HOS daily log data per FMCSA requirements.
    Each log includes duty periods, durations, miles, and labels.
    """
    logs_by_date = defaultdict(list)

    for leg in trip.legs.all().order_by("departure_time"):
        start = localtime(leg.departure_time)
        end = localtime(leg.arrival_time)
        date_key = start.date().isoformat()

        logs_by_date[date_key].append({
            "leg_id": leg.id,
            "status": get_leg_type(leg),  # ✅ Use helper here
            "start": start.strftime("%H:%M"),
            "end": end.strftime("%H:%M"),
            "label": leg.start_label,
            "location": leg.start_label or "—",
            "miles": float(leg.distance_miles),
            "hours": float(leg.duration_hours),
            "notes": leg.notes,
        })

    log_sheets = []
    for date, periods in logs_by_date.items():
        total_miles = sum(p["miles"] for p in periods)
        total_hours = sum(p["hours"] for p in periods)
        log_sheets.append({
            "date": date,
            "duty_periods": periods,
            "total_miles": round(total_miles, 2),
            "total_hours": round(total_hours, 2)
        })

    return log_sheets
