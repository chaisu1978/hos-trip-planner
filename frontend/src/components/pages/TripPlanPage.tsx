import { useState } from "react";
import { useEffect } from "react";
import {
  useTheme,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import PersonPinCircleIcon from "@mui/icons-material/PersonPinCircle";
import LocationInput from "../trip/LocationInput";
import CycleHoursInput from "../trip/CycleHoursInput";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import LocationDrawer from "../trip/LocationDrawer";
import { createThemedMarkerIcon } from "../../utils/createThemedMarkerIcon";

// leaflet
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { motion } from "framer-motion";

interface LocationData {
  label: string;
  lat: number;
  lon: number;
}

const TripPlanPage = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null
  );
  const [pickupLocation, setPickupLocation] = useState<LocationData | null>(
    null
  );
  const [dropoffLocation, setDropoffLocation] = useState<LocationData | null>(
    null
  );
  const [cycleHours, setCycleHours] = useState<number>(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<
    "current" | "pickup" | "dropoff" | null
  >(null);
  const theme = useTheme();

  const currentIcon = createThemedMarkerIcon(theme, "error");
  const pickupIcon = createThemedMarkerIcon(theme, "info");
  const dropoffIcon = createThemedMarkerIcon(theme, "success");

  const handleOpenDrawer = (type: "current" | "pickup" | "dropoff") => {
    setDrawerType(type);
    setDrawerOpen(true);
  };

  const handleLocationSelect = (location: LocationData) => {
    if (drawerType === "current") setCurrentLocation(location);
    else if (drawerType === "pickup") setPickupLocation(location);
    else if (drawerType === "dropoff") setDropoffLocation(location);

    setDrawerOpen(false);
    setDrawerType(null);
  };

  const MapAutoFit = ({ points }: { points: [number, number][] }) => {
    const map = useMap();

    useEffect(() => {
      if (points.length === 0) return;

      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] }); // optional padding
    }, [points, map]);

    return null;
  };

  const getLatLngTuple = (loc: LocationData | null): [number, number] | null =>
    loc ? [loc.lat, loc.lon] : null;

  const points = [
    getLatLngTuple(currentLocation),
    getLatLngTuple(pickupLocation),
    getLatLngTuple(dropoffLocation),
  ].filter(Boolean) as [number, number][];

  return (
    <Box
      id="trip-plan-page-start"
      display="flex"
      flex="1 0 auto"
      flexDirection={{ xs: "column", sm: "row" }}
      justifyContent="flex-start"
      alignItems="start"
      padding={{ xs: "24px", sm: "16px" }}
      gap={{ xs: "16px", sm: "32px" }}
      sx={{
        minHeight: "85vh", // Instead of fixed height
      }}
    >
      <Box
        id="inputs"
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"flex-start"}
        alignItems={"center"}
        padding={"11px 16px 16px 16px"}
        gap={"12px"}
        width={{ xs: "100%", sm: "25%" }}
        minWidth={{ xs: "100%", sm: "310px" }}
        sx={{
          borderRadius: { xs: "0px 16px 16px 0px", md: "0px 16px 0px 16px" },
          background: (theme) =>
            `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.highlight.light})`,
          position: { xs: "static", sm: "sticky" },
          top: { sm: "80px" },
          // minHeight: "80vh",
        }}
      >
        <Typography variant="h5" fontFamily={"typeography.h1"} fontWeight={400}>
          TRIP DETAILS
        </Typography>
        {/* INPUT CARDS - TO MAKE INTO COMPONENT */}
        <LocationInput
          icon={<PersonPinCircleIcon />}
          baseLabel="CURRENT LOCATION"
          description="Let us know where you're starting from. You can use your current GPS location or manually enter it."
          value={currentLocation || undefined}
          onClick={() => handleOpenDrawer("current")}
          onClear={() => setCurrentLocation(null)}
        />
        <LocationInput
          icon={<ArchiveIcon />}
          baseLabel="PICKUP LOCATION"
          description="Where are you picking up your load? Includes a one hour loading delay in trip plan."
          value={pickupLocation || undefined}
          onClick={() => handleOpenDrawer("pickup")}
          onClear={() => setPickupLocation(null)}
        />
        <LocationInput
          icon={<UnarchiveIcon />}
          baseLabel="DROPOFF LOCATION"
          value={dropoffLocation || undefined}
          description="Where are you delivering your load? Includes a one hour unloading delay in trip plan."
          onClick={() => handleOpenDrawer("dropoff")}
          onClear={() => setDropoffLocation(null)}
        />

        <CycleHoursInput value={cycleHours} onChange={setCycleHours} />

        <motion.div
          animate={{
            scale:
              currentLocation && pickupLocation && dropoffLocation ? 1 : 0.95,
            opacity:
              currentLocation && pickupLocation && dropoffLocation ? 1 : 0.5,
          }}
          transition={{ duration: 0.2 }}
          style={{ width: "100%" }}
        >
          <Button
            variant="contained"
            size="large"
            color="secondary"
            startIcon={<CalendarMonthIcon />}
            fullWidth
            disabled={!(currentLocation && pickupLocation && dropoffLocation)}
            sx={{
              borderRadius: "24px",
              padding: "8px",
            }}
          >
            PLAN TRIP
          </Button>
        </motion.div>
      </Box>
      <Box
        id="trip-summary"
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"flex-start"}
        alignItems={"flex-start"}
        padding={"11px 24px 24px 24px"}
        gap={"16px"}
        width={{ xs: "100%", sm: "75%" }}
        sx={{
          backgroundColor: "background.default",
          border: "0px solid transparent",
          boxShadow: 1,
          borderRadius: "4px",
          minHeight: "85vh",
          color: "text.primary",
        }}
      >
        {/* leaflet map full width, 65vh */}
        <MapContainer
          center={[39.8283, -98.5795]}
          zoom={5}
          scrollWheelZoom={false}
          style={{ width: "100%", height: "55vh" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">
            OpenStreetMap</a> contributors'
          />
          <MapAutoFit points={points} />
          {currentLocation && (
            <Marker
              position={[currentLocation.lat, currentLocation.lon]}
              icon={currentIcon}
            >
              <Popup>
                <b>CURRENT LOCATION:</b> {currentLocation.label}
              </Popup>
            </Marker>
          )}
          {pickupLocation && (
            <Marker
              position={[pickupLocation.lat, pickupLocation.lon]}
              icon={pickupIcon}
            >
              <Popup>
                <b>PICKUP LOCATION:</b> {pickupLocation.label}
              </Popup>
            </Marker>
          )}
          {dropoffLocation && (
            <Marker
              position={[dropoffLocation.lat, dropoffLocation.lon]}
              icon={dropoffIcon}
            >
              <Popup>
                <b>DROPOFF LOCATION:</b> {dropoffLocation.label}
              </Popup>
            </Marker>
          )}
        </MapContainer>
        <Box
          id="trip-summary-header"
          display={"flex"}
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent={"space-between"}
          alignItems={"center"}
          width={"100%"}
        >
          <Typography
            variant="h5"
            fontFamily={"typeography.h1"}
            fontWeight={400}
          >
            TRIP SUMMARY
          </Typography>
          <Button
            variant="contained"
            size="medium"
            color="secondary"
            startIcon={<LibraryBooksIcon />}
            sx={{
              borderRadius: "24px",
              padding: "8px 24px",
            }}
          >
            DAILY LOGS
          </Button>
        </Box>
        <Box
          id="trip-summary-content"
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"flex-start"}
          alignItems={"flex-start"}
          padding={"10px"}
          gap={"8px"}
          width={"100%"}
          sx={{
            backgroundColor: "background.paper",
            color: "text.primary",
            borderRadius: "0px 12px 0px 12px",
          }}
        >
          Trip Details will go here and can interact with the map above.
        </Box>
      </Box>
      <LocationDrawer
        // key forces remount on drawerType change
        key={drawerType}
        open={drawerOpen}
        type={drawerType ?? "current"}
        onClose={() => setDrawerOpen(false)}
        onSelect={handleLocationSelect}
        initialValue={
          drawerType === "current"
            ? (currentLocation ?? undefined)
            : drawerType === "pickup"
              ? (pickupLocation ?? undefined)
              : (dropoffLocation ?? undefined)
        }
      />
    </Box>
  );
};

export default TripPlanPage;
