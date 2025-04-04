// frontend/src/components/trip/AnimatedTripMap.tsx
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { TripLeg } from "../../types/TripLeg";
import { Theme } from "@mui/material";
import { createThemedMarkerIcon } from "../../utils/createThemedMarkerIcon";

interface Trip {
  id: number;
  legs: TripLeg[];
}

interface LocationData {
  label: string;
  lat: number;
  lon: number;
}

type MUIColor =
  | "error"
  | "info"
  | "success"
  | "primary"
  | "secondary"
  | "warning";

interface AnimatedTripMapProps {
  trip: Trip | null;
  theme: Theme;
  selectedLegId: number | null;
  onLegSelect: (id: number) => void;
  locationMarkers: {
    current: LocationData | null;
    pickup: LocationData | null;
    dropoff: LocationData | null;
  };
}

export default function AnimatedTripMap({
  trip,
  theme,
  selectedLegId,
  onLegSelect,
  locationMarkers,
}: AnimatedTripMapProps) {
  const { current, pickup, dropoff } = locationMarkers;

  const [visibleLegCount, setVisibleLegCount] = useState(0);
  const mapRef = useRef<any>(null);
  const markerRefs = useRef<Record<number, any>>({});

  // Animate legs sequentially
  useEffect(() => {
    if (!trip?.legs) return;
    let index = 0;
    setVisibleLegCount(0);

    const interval = setInterval(() => {
      index++;
      setVisibleLegCount(index);
      if (index >= trip.legs.length) clearInterval(interval);
    }, 500);

    return () => clearInterval(interval);
  }, [trip?.id]);

  // Fit bounds to visible points
  const FitMap = () => {
    const map = useMap();

    useEffect(() => {
      const staticPoints: [number, number][] = [current, pickup, dropoff]
        .filter(Boolean)
        .map((loc) => [loc!.lat, loc!.lon]);

      const polyPoints: [number, number][] =
        trip?.legs
          ?.slice(0, visibleLegCount)
          .flatMap((leg) => leg.polyline_geometry || [])
          .filter(
            (coord): coord is [number, number] =>
              Array.isArray(coord) &&
              coord.length === 2 &&
              typeof coord[0] === "number" &&
              typeof coord[1] === "number"
          ) ?? [];

      const allCoords = [...staticPoints, ...polyPoints];

      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords);
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }, [trip?.id, visibleLegCount]);

    return null;
  };

  const legTypeColorMap: Record<string, MUIColor> = {
    pickup: "primary",
    dropoff: "secondary",
    drive: "success",
    rest: "info",
    break: "warning",
    fuel: "error",
  };

  return (
    <MapContainer
      center={[39.8283, -98.5795]}
      zoom={5}
      scrollWheelZoom={false}
      style={{ width: "100%", height: "55vh" }}
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      />
      <FitMap />

      {/* User-selected locations */}
      {[
        { loc: current, color: "error" as MUIColor, label: "CURRENT" },
        { loc: pickup, color: "info" as MUIColor, label: "PICKUP" },
        { loc: dropoff, color: "success" as MUIColor, label: "DROPOFF" },
      ]
        .filter(({ loc }) => !!loc)
        .map(({ loc, color, label }) => (
          <Marker
            key={label}
            position={[loc!.lat, loc!.lon]}
            icon={createThemedMarkerIcon(theme, color)}
          >
            <Popup>
              <b>{label} LOCATION:</b> {loc!.label}
            </Popup>
          </Marker>
        ))}

      {/* Polylines with animation */}
      {trip?.legs
        .slice(0, visibleLegCount)
        .filter(
          (leg) =>
            Array.isArray(leg.polyline_geometry) &&
            leg.polyline_geometry.length > 1
        )
        .map((leg) => (
          <Polyline
            key={`polyline-${leg.id}`}
            positions={leg.polyline_geometry as [number, number][]}
            pathOptions={{
              color:
                selectedLegId === leg.id
                  ? theme.palette.warning.main
                  : theme.palette.success.main,
              weight: selectedLegId === leg.id ? 6 : 4,
              opacity: 0.85,
            }}
            eventHandlers={{
              click: () => onLegSelect(leg.id),
            }}
          />
        ))}

      {/* Markers for each leg */}
      {trip?.legs.slice(0, visibleLegCount).map((leg) => {
        const isDriveLeg = leg.leg_type === "drive";
        if (isDriveLeg) return null;

        const icon = createThemedMarkerIcon(
          theme,
          legTypeColorMap[leg.leg_type] ?? "info"
        );

        // Get a safe position: use start of polyline if available
        let lat: number | null = null;
        let lon: number | null = null;

        // Use polyline_geometry if available
        if (
          Array.isArray(leg.polyline_geometry) &&
          leg.polyline_geometry.length > 0
        ) {
          [lat, lon] = leg.polyline_geometry[0];
        }

        // Fallbacks if polyline is missing or empty
        if (
          (lat == null || lon == null) &&
          leg.start_lat != null &&
          leg.start_lon != null
        ) {
          lat = leg.start_lat;
          lon = leg.start_lon;
        }

        if (
          (lat == null || lon == null) &&
          leg.end_lat != null &&
          leg.end_lon != null
        ) {
          lat = leg.end_lat;
          lon = leg.end_lon;
        }

        if (lat == null || lon == null) return null;
        console.log(
          "Placing marker for leg",
          leg.id,
          leg.leg_type,
          "at",
          lat,
          lon
        );

        return (
          <Marker
            key={`marker-${leg.id}`}
            position={[lat, lon]}
            icon={icon}
            eventHandlers={{
              click: () => {
                onLegSelect(leg.id);
                markerRefs.current[leg.id]?.openPopup();
              },
            }}
            ref={(el) => (markerRefs.current[leg.id] = el)}
          >
            <Popup>
              <strong>{leg.leg_type.toUpperCase()}</strong>
              <br />
              {leg.notes || leg.start_label || leg.end_label || "No label"}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
