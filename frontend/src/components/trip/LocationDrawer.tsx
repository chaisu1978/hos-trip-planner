import {
  Drawer,
  Box,
  Typography,
  Button,
  Divider,
  useTheme,
} from "@mui/material";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  type: "current" | "pickup" | "dropoff";
  onClose: () => void;
  onSelect: (location: { label: string; lat: number; lon: number }) => void;
}

const LocationDrawer = ({ open, type, onClose, onSelect }: Props) => {
  const theme = useTheme();
  const [center, setCenter] = useState<[number, number]>([39.8283, -98.5795]); // USA center
  const mapRef = useRef(null);

  // Listen to map movement
  const MapListener = () => {
    useMapEvents({
      moveend: (e) => {
        const c = e.target.getCenter();
        setCenter([c.lat, c.lng]);
      },
    });
    return null;
  };

  const handleConfirm = async () => {
    const [lat, lon] = center;

    // Reverse geocode with OpenStreetMap's Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await response.json();
    const label = data.display_name || "Selected location";

    onSelect({ label, lat, lon });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 480 },
          backgroundColor: "background.paper",
        },
      }}
    >
      <Box p={2} display="flex" flexDirection="column" gap={2}>
        <Typography variant="h6">
          Select {type.toUpperCase()} Location
        </Typography>
        <Divider />

        <Box position="relative" height="400px">
          <MapContainer
            center={center}
            zoom={5}
            scrollWheelZoom={true}
            style={{ width: "100%", height: "100%", zIndex: 0 }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <MapListener />
          </MapContainer>

          {/* Static pin overlay */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "32px",
              height: "32px",
              transform: "translate(-50%, -100%)",
              zIndex: 999,
              pointerEvents: "none",
            }}
          >
            📍
          </Box>
        </Box>

        <Typography variant="body2" align="center">
          Drag the map to place the pin on your desired location.
        </Typography>

        <Button variant="contained" color="primary" onClick={handleConfirm}>
          Confirm Location
        </Button>
      </Box>
    </Drawer>
  );
};

export default LocationDrawer;
