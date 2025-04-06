import { Typography, Box } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import HotelIcon from "@mui/icons-material/Hotel";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ScrollZoomHint from "../common/ScrollZoomHint";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
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
  markerRefs?: React.MutableRefObject<Record<number, any>>;
  onCenterMap?: (fn: (lat: number, lon: number) => void) => void;
}

export default function AnimatedTripMap({
  trip,
  theme,
  selectedLegId,
  onLegSelect,
  locationMarkers,
  markerRefs,
  onCenterMap,
}: AnimatedTripMapProps) {
  const { current, pickup, dropoff } = locationMarkers;

  const [visibleLegCount, setVisibleLegCount] = useState(0);
  const mapRef = useRef<any>(null);
  const localMarkerRefs = markerRefs ?? useRef<Record<number, any>>({});

  useEffect(() => {
    if (!onCenterMap) return;

    const centerMapFn = (lat: number, lon: number) => {
      if (mapRef.current) {
        const currentZoom = mapRef.current.getZoom();
        mapRef.current.setView([lat, lon], currentZoom, { animate: true });
      }
    };

    onCenterMap(centerMapFn);
  }, [onCenterMap]);

  // Animate legs sequentially
  useEffect(() => {
    if (!trip?.legs) return;
    let index = 0;
    setVisibleLegCount(0);

    const interval = setInterval(() => {
      index++;
      setVisibleLegCount(index);
      if (index >= trip.legs.length) clearInterval(interval);
    }, 350);

    return () => clearInterval(interval);
  }, [trip?.id]);

  // Fit bounds to visible points
  const FitMap = () => {
    const map = useMap();

    useEffect(() => {
      if (selectedLegId !== null) return; // Skip fitting if a leg is selected

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
    }, [trip?.id, visibleLegCount, selectedLegId]);

    return null;
  };

  const legTypeColorMap: Record<string, MUIColor> = {
    pickup: "warning",
    dropoff: "success",
    drive: "success",
    rest: "info",
    break: "info",
    fuel: "error",
  };

  const legIcons = {
    drive: <DirectionsCarIcon fontSize="small" />,
    rest: <HotelIcon fontSize="small" />,
    fuel: <LocalGasStationIcon fontSize="small" />,
    break: <AccessTimeIcon fontSize="small" />,
    pickup: <AccessTimeIcon fontSize="small" />,
    dropoff: <AccessTimeIcon fontSize="small" />,
  };

  return (
    <Box position="relative" width="100%" height="100%">
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={5}
        scrollWheelZoom={true}
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
          { loc: current, color: "warning" as MUIColor, label: "CURRENT" },
          { loc: pickup, color: "warning" as MUIColor, label: "PICKUP" },
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

          const legType = leg.leg_type;
          const colorKey = legTypeColorMap[legType] ?? "info";
          const iconMarker = createThemedMarkerIcon(theme, colorKey, 16);
          const icon = legIcons[legType as keyof typeof legIcons] ?? (
            <AccessTimeIcon fontSize="small" />
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
              icon={iconMarker}
              eventHandlers={{
                click: () => {
                  onLegSelect(leg.id);
                  localMarkerRefs.current[leg.id]?.openPopup();
                },
              }}
              ref={(el) => (localMarkerRefs.current[leg.id] = el)}
            >
              <Popup>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                  p={1}
                  sx={{
                    borderLeft: `4px solid ${theme.palette[colorKey].main}`,
                    minWidth: "150px",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Box
                      width={28}
                      height={28}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="50%"
                      bgcolor={theme.palette[colorKey].main}
                      color="#fff"
                    >
                      {icon}
                    </Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {legType.toUpperCase()}
                    </Typography>
                  </Box>

                  <Typography fontSize="0.85rem">
                    {leg.notes ||
                      leg.start_label ||
                      leg.end_label ||
                      "No label"}
                  </Typography>
                </Box>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <ScrollZoomHint />
    </Box>
  );
}
