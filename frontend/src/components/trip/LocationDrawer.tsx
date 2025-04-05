import { useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
  TextField,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import type L from "leaflet";
import { useRef, useState, useCallback } from "react";
import { debounce } from "../../utils/debounce";
import apiClient from "../../services/auth";
import { useSnackbar } from "../common/SnackbarProvider";

interface Props {
  open: boolean;
  type: "current" | "pickup" | "dropoff";
  onClose: () => void;
  onSelect: (location: { label: string; lat: number; lon: number }) => void;
  initialValue?: { label: string; lat: number; lon: number };
}

const fetchLocations = async (
  value: string,
  setResults: React.Dispatch<React.SetStateAction<any[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (value.length < 3) {
    setResults([]);
    setLoading(false);
    return;
  }

  setLoading(true);
  try {
    const { data } = await apiClient.get("/trips/geocode/search/", {
      params: { q: value },
    });
    setResults(data);
  } catch (error) {
    console.error("Geocode search failed", error);
    setResults([]);
  }
  setLoading(false);
};

const fetchReverseGeocode = async (
  lat: number,
  lon: number
): Promise<string> => {
  try {
    const { data } = await apiClient.get("/trips/geocode/reverse/", {
      params: { lat, lon },
    });
    return data.display_name || "Selected location";
  } catch (error) {
    console.error("Reverse geocode failed", error);
    return "Selected location";
  }
};

const LocationDrawer = ({
  open,
  type,
  onClose,
  onSelect,
  initialValue,
}: Props) => {
  const [center, setCenter] = useState<[number, number]>([39.8283, -98.5795]);
  const mapRef = useRef<L.Map | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const { showSnackbar } = useSnackbar();

  const MapListener = () => {
    const map = useMapEvents({
      moveend: () => {
        const c = map.getCenter();
        setCenter([c.lat, c.lng]);
      },
    });

    if (!mapRef.current) {
      mapRef.current = map;
    }

    return null;
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      fetchLocations(value, setResults, setLoading);
    }, 1200),
    []
  );

  const handleResultClick = (lat: string, lon: string, displayName: string) => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    setCenter([latNum, lonNum]);
    mapRef.current?.setView([latNum, lonNum], 11);
    setQuery(displayName);
    setResults([]);
  };

  const handleConfirm = async () => {
    const [lat, lon] = center;
    const label = await fetchReverseGeocode(lat, lon);
    onSelect({ label, lat, lon });
    setQuery("");
    setResults([]);
  };

  // When the drawer opens, update query + center
  useEffect(() => {
    if (!open) return;

    if (initialValue) {
      const latLng: [number, number] = [initialValue.lat, initialValue.lon];
      setQuery(initialValue.label);
      setCenter(latLng);

      // Delay setView until map is mounted
      setTimeout(() => {
        mapRef.current?.setView(latLng, 11);
      }, 250);
    } else {
      const fallback: [number, number] = [39.8283, -98.5795];
      setQuery("");
      setCenter(fallback);

      setTimeout(() => {
        mapRef.current?.setView(fallback, 5);
      }, 250);
    }

    // Trigger resize after drawer opens
    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 500);
  }, [open, initialValue]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: "45%" },
          backgroundColor: "background.paper",
        },
      }}
    >
      {/* Header */}
      <Box
        position="sticky"
        top={0}
        zIndex={10}
        bgcolor="background.paper"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        py={1}
      >
        <Typography variant="h6">
          Select {type.toUpperCase()} Location
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />

      {/* Body */}
      <Box p={2} display="flex" flexDirection="column" gap={2}>
        <Autocomplete
          freeSolo
          disableClearable
          options={results}
          loading={loading}
          inputValue={query}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.display_name
          }
          onInputChange={(_, value) => {
            setQuery(value);
            debouncedSearch(value);
          }}
          onChange={(_, value) => {
            if (value && value.lat && value.lon && value.display_name) {
              handleResultClick(value.lat, value.lon, value.display_name);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search location"
              variant="outlined"
              size="small"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleConfirm}
          sx={{
            borderRadius: "24px",
            padding: "8px",
          }}
        >
          Confirm Location
        </Button>

        <Box position="relative" height="400px">
          <MapContainer
            center={center}
            zoom={5}
            scrollWheelZoom={false}
            style={{ width: "100%", height: "100%", zIndex: 0 }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <MapListener />
          </MapContainer>

          {/* Marker */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -100%)",
              zIndex: 999,
              pointerEvents: "none",
            }}
          >
            <img
              src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"
              alt="Map pin"
              width={25}
              height={41}
              style={{ userSelect: "none" }}
            />
          </Box>
        </Box>

        <Typography variant="body2" align="center">
          Drag the map to place the pin on your desired location.
        </Typography>
        {type === "current" && (
          <Button
            variant="contained"
            size="small"
            disabled={locating}
            onClick={async () => {
              setLocating(true);
              navigator.geolocation.getCurrentPosition(
                async (pos) => {
                  const { latitude, longitude } = pos.coords;
                  const label = await fetchReverseGeocode(latitude, longitude);
                  setCenter([latitude, longitude]);
                  setQuery(label);
                  mapRef.current?.setView([latitude, longitude], 11);
                  setLocating(false);

                  showSnackbar("Location detected successfully!", "success"); // SUCCESS SNACKBAR
                },
                (error) => {
                  console.error("Geolocation error:", error);
                  setLocating(false);

                  showSnackbar(
                    "Unable to retrieve your location. Please check permissions or try again.",
                    "error"
                  ); // ERROR SNACKBAR
                }
              );
            }}
            startIcon={
              locating ? (
                <CircularProgress color="inherit" size={16} />
              ) : undefined
            }
          >
            {locating ? "Getting Location..." : "Use My Location"}
          </Button>
        )}
      </Box>
    </Drawer>
  );
};

export default LocationDrawer;
