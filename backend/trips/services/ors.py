import os
import requests
from decimal import Decimal
import polyline

ORS_KEY = os.getenv("ORS_KEY")
ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-car"

HEADERS = {
    "Authorization": ORS_KEY,
    "Content-Type": "application/json"
}


def get_route(coordinates):
    """
    Calls the ORS Directions API and returns parsed route data.
    :param coordinates: List of [lon, lat] pairs for current, pickup, dropoff
    :return: dict with route geometry, duration, distance, steps
    """
    if len(coordinates) < 2:
        raise ValueError("At least two coordinates are required.")

    payload = {
        "coordinates": coordinates,
        "instructions": True,
        "geometry": True,
        "units": "mi",
        "geometry_simplify": False,
    }

    response = requests.post(ORS_BASE_URL, json=payload, headers=HEADERS)

    if response.status_code != 200:
        raise Exception(f"ORS Error: {response.status_code} - {response.text}")

    data = response.json()
    route = data["routes"][0]
    segments = route["segments"]

    # Map segment steps with actual coordinates from the full geometry
    geometry = route.get("geometry", "")

    if isinstance(geometry, str):
        # Decode the encoded polyline string
        decoded = polyline.decode(geometry)  # → [(lat, lon), ...]
        coords = [(lon, lat) for lat, lon in decoded]  # match ORS waypoint convention
    else:
        coords = []

    # Step objects don't have coordinates, only waypoints
    for segment in segments:
        for step in segment["steps"]:
            wp = step.get("way_points", [])
            if len(wp) == 2:
                start_idx, end_idx = wp
                start_coord = coords[start_idx]
                end_coord = coords[end_idx]
                step["start_lon"], step["start_lat"] = start_coord
                step["end_lon"], step["end_lat"] = end_coord

    return {
        "distance_miles": Decimal(route["summary"]["distance"]),
        "duration_hours": Decimal(route["summary"]["duration"]) / 3600,
        "segments": segments,
        "geometry": coords,  # optional, for entire trip polyline
    }