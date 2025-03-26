import os
import requests
from decimal import Decimal

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
        "units": "mi"
    }

    response = requests.post(ORS_BASE_URL, json=payload, headers=HEADERS)

    if response.status_code != 200:
        raise Exception(f"ORS Error: {response.status_code} - {response.text}")

    data = response.json()

    route = data["routes"][0]

    return {
        # Already in miles
        "distance_miles": Decimal(route["summary"]["distance"]),
        # Convert from seconds to hours
        "duration_hours": Decimal(route["summary"]["duration"]) / 3600,
        "segments": route["segments"],
        "geometry": route.get("geometry", "")
    }
