import os
import requests
from decimal import Decimal
import polyline

ORS_KEY = os.getenv("ORS_KEY")
ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-hgv"

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
        "geometry_simplify": False,
        "units": "mi",
        "profile": "driving-hgv",

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
        # Decode the encoded polyline string with correct precision
        decoded = polyline.decode(geometry, precision=5)
        coords = [(lon, lat) for lat, lon in decoded]
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


def get_optimized_route(coordinates):
    """
    Calls ORS Optimization API to get an optimized route with improved geometry.
    Assumes:
    - 1 vehicle starting at current location
    - 2 jobs: pickup and dropoff
    """
    url = "https://api.openrouteservice.org/optimization"

    payload = {
        "jobs": [
            {
                "id": 1,
                "location": coordinates[1],  # pickup
                "service": 3600  # 1 hour = 3600 seconds
            },
            {
                "id": 2,
                "location": coordinates[2],  # dropoff
                "service": 3600
            }
        ],
        "vehicles": [
            {
                "id": 1,
                "start": coordinates[0],  # current location
                "profile": "driving-hgv"
            }
        ],
        "options": {
            "g": True  # enable geometry
        }
    }

    response = requests.post(url, json=payload, headers=HEADERS)

    if response.status_code != 200:
        raise Exception(f"ORS Optimization Error: {response.status_code} - {response.text}")

    data = response.json()
    route = data["routes"][0]

    decoded_geometry = polyline.decode(route["geometry"], precision=5)
    coords = [(lon, lat) for lat, lon in decoded_geometry]

    return {
        "distance_miles": Decimal(route["distance"]) / Decimal("1609.34"),  # meters to miles
        "duration_hours": Decimal(route["duration"]) / 3600,
        "geometry": coords,
        "steps": [],  # optional, may use for future
        "segments": [],
    }
