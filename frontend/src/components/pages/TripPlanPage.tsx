import { useState } from "react";
import {
  useTheme,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import PersonPinCircleIcon from "@mui/icons-material/PersonPinCircle";
import LocationInput from "../trip/LocationInput";
import TripLegCard from "../trip/TripLegCard";
import CycleHoursInput from "../trip/CycleHoursInput";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import LocationDrawer from "../trip/LocationDrawer";
import AnimatedTripMap from "../trip/AnimatedTripMap";
import { TripLeg } from "../../types/TripLeg";
import { useSnackbar } from "../common/SnackbarProvider";
import apiClient from "../../services/auth";
import { motion } from "framer-motion";
import { useRef } from "react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LoadingOverlay from "../common/LoadingOverlay";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SvgLogbookModal from "../logs/SvgLogbookModal";

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
  const [submitting, setSubmitting] = useState(false);
  const [trip, setTrip] = useState<any>(null);
  const [selectedLegId, setSelectedLegId] = useState<number | null>(null);
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const [logSvgUrls, setLogSvgUrls] = useState<string[]>([]);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  const tripPlanned = !!trip;

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

  const handleSubmitTrip = async () => {
    if (!currentLocation || !pickupLocation || !dropoffLocation) {
      showSnackbar("Please set all locations before planning.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: "", // Optional: you could add a generated name later
        current_location_label: currentLocation.label,
        current_location_lat: currentLocation.lat,
        current_location_lon: currentLocation.lon,
        pickup_location_label: pickupLocation.label,
        pickup_location_lat: pickupLocation.lat,
        pickup_location_lon: pickupLocation.lon,
        dropoff_location_label: dropoffLocation.label,
        dropoff_location_lat: dropoffLocation.lat,
        dropoff_location_lon: dropoffLocation.lon,
        current_cycle_hours: cycleHours.toFixed(2), // Backend expects stringified decimal
        departure_time: new Date().toISOString(), // Backend expects ISO format
      };

      const response = await apiClient.post("/trips/trips/", payload);

      // Normalize legs
      const legs = response.data.legs.map((leg: any, index: number) => ({
        id: index,
        leg_type: leg.leg_type,
        distance_miles: leg.distance_miles ?? 0, // backend returns in miles
        duration_hours: leg.duration_hours ?? 0,
        start_label: leg.start_label,
        end_label: leg.end_label,
        notes: leg.notes,
        polyline_geometry: leg.polyline_geometry ?? [],
        start_lat: leg.start_lat,
        start_lon: leg.start_lon,
        end_lat: leg.end_lat,
        end_lon: leg.end_lon,
      }));
      console.log("Trip Legs API Response", response.data.legs);
      showSnackbar("Trip planned successfully!", "success");

      setTrip({ ...response.data, legs }); // override legs with normalized version
      if (mapSectionRef.current) {
        mapSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
      // TODO: Store trip in local state for summary/logbook display
    } catch (error) {
      console.error("Trip planning failed", error);
      showSnackbar("Failed to plan trip. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = 200;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollByAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollByAmount, behavior: "smooth" });
    }
  };

  const markerRefs = useRef<Record<number, any>>({});
  const mapRefFn = useRef<((lat: number, lon: number) => void) | null>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  const handleLegCardClick = (leg: TripLeg) => {
    // Close any open marker popups
    Object.values(markerRefs.current).forEach((marker) => {
      if (marker?.closePopup) marker.closePopup();
    });

    setSelectedLegId(leg.id);

    const marker = markerRefs.current[leg.id];
    if (marker) {
      // Open the popup (already done below)
      if (leg.leg_type !== "drive") {
        marker.openPopup();
      }

      // Center the map on the marker
      const latLng = marker.getLatLng?.();
      if (latLng && mapRefFn.current) {
        mapRefFn.current(latLng.lat, latLng.lng);
      }
    }
  };

  const handleResetTrip = () => {
    setCurrentLocation(null);
    setPickupLocation(null);
    setDropoffLocation(null);
    setCycleHours(0);
    setTrip(null);
    setSelectedLegId(null);

    // Close all marker popups
    Object.values(markerRefs.current).forEach((marker) => {
      if (marker?.closePopup) marker.closePopup();
    });
  };

  const handleShowLogs = async () => {
    if (!trip?.id) return;

    try {
      setLogsLoading(true);
      // First, trigger SVG generation
      await apiClient.post(`/trips/trips/${trip.id}/generate_svgs/`);

      // Then, fetch the SVG URLs
      const svgResponse = await apiClient.get(
        `/trips/trips/${trip.id}/svg_logs/`
      );
      const urls = svgResponse.data.svg_urls || [];

      setLogSvgUrls(urls);
      setLogModalOpen(true);
    } catch (error) {
      console.error("Failed to load logs", error);
      showSnackbar("Unable to generate logs. Please try again.", "error");
    } finally {
      setLogsLoading(false);
    }
  };

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
      {submitting && <LoadingOverlay />}

      <Box
        id="inputs"
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"flex-start"}
        alignItems={"center"}
        padding={"11px 16px 16px 16px"}
        gap={"12px"}
        width={{ xs: "100%", sm: "310px" }}
        minWidth={{ xs: "100%", sm: "310px" }}
        sx={{
          borderRadius: "0px 16px 0px 16px",
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
          disabled={tripPlanned}
        />
        <LocationInput
          icon={<ArchiveIcon />}
          baseLabel="PICKUP LOCATION"
          description="Where are you picking up your load? Includes a one hour loading delay in trip plan."
          value={pickupLocation || undefined}
          onClick={() => handleOpenDrawer("pickup")}
          onClear={() => setPickupLocation(null)}
          disabled={tripPlanned}
        />
        <LocationInput
          icon={<UnarchiveIcon />}
          baseLabel="DROPOFF LOCATION"
          value={dropoffLocation || undefined}
          description="Where are you delivering your load? Includes a one hour unloading delay in trip plan."
          onClick={() => handleOpenDrawer("dropoff")}
          onClear={() => setDropoffLocation(null)}
          disabled={tripPlanned}
        />

        <CycleHoursInput
          value={cycleHours}
          onChange={setCycleHours}
          disabled={tripPlanned}
        />

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
          {trip ? (
            <Button
              variant="contained"
              size="large"
              startIcon={<RestartAltIcon />}
              color="primary"
              onClick={handleResetTrip}
              fullWidth
              sx={{ borderRadius: "24px", padding: "8px" }}
            >
              PLAN NEW TRIP
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              color="secondary"
              startIcon={
                submitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <CalendarMonthIcon />
                )
              }
              fullWidth
              disabled={
                !(currentLocation && pickupLocation && dropoffLocation) ||
                submitting
              }
              sx={{ borderRadius: "24px", padding: "8px" }}
              onClick={handleSubmitTrip}
            >
              PLAN TRIP
            </Button>
          )}
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
        width={{ xs: "100%", sm: "100%" }}
        sx={{
          backgroundColor: "background.default",
          border: "0px solid transparent",
          boxShadow: 1,
          borderRadius: "4px",
          // minHeight: "85vh",
          color: "text.primary",
        }}
      >
        {/* leaflet map full width, 55vh */}
        <Box ref={mapSectionRef} sx={{ width: "100%", height: "auto" }}>
          <AnimatedTripMap
            trip={trip}
            theme={theme}
            selectedLegId={selectedLegId}
            onLegSelect={setSelectedLegId}
            markerRefs={markerRefs}
            locationMarkers={{
              current: currentLocation,
              pickup: pickupLocation,
              dropoff: dropoffLocation,
            }}
            onCenterMap={(fn) => {
              mapRefFn.current = fn;
            }}
          />
        </Box>
        <Box
          id="trip-summary-header"
          display={"flex"}
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent={"space-between"}
          alignItems={{ xs: "center", sm: "flex-start" }}
          width={"100%"}
        >
          <Typography
            variant="h5"
            fontFamily={"typeography.h1"}
            fontWeight={400}
          >
            TRIP SUMMARY
          </Typography>

          {trip && (
            <Button
              variant="contained"
              size="large"
              color="secondary"
              startIcon={
                logsLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <LibraryBooksIcon />
                )
              }
              sx={{ borderRadius: "24px", padding: "8px 24px" }}
              onClick={handleShowLogs}
              disabled={logsLoading}
            >
              {logsLoading ? "GETTING LOGS" : "DAILY LOGS"}
            </Button>
          )}
        </Box>
        {!trip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            style={{
              width: "auto",
              minHeight: "180px",
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              textAlign: "left",
              padding: "0",
              color: theme.palette.text.secondary,
            }}
          >
            <CalendarMonthIcon
              sx={{
                fontSize: 64,
                color: theme.palette.grey[400],
                mr: 2,
              }}
            />
            <Box
              alignContent="start"
              display="flex"
              flexDirection="column"
              justifyContent="start"
              alignItems="start"
              gap={1}
            >
              <Typography variant="h6" gutterBottom>
                No Trip Planned Yet
              </Typography>
              <Typography variant="body2">
                Use the controls on the left to enter your trip details, then
                click <strong>Plan Trip</strong> to get started.
              </Typography>
            </Box>
          </motion.div>
        )}
        {trip && trip.legs?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ width: "100%" }}
          >
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              width="100%"
              sx={{ overflow: "hidden" }}
            >
              <Button
                onClick={scrollLeft}
                variant="outlined"
                size="small"
                sx={{ minWidth: "40px", height: "40px", borderRadius: "20px" }}
              >
                <ArrowBackIosNewIcon fontSize="small" />
              </Button>

              <Box
                ref={scrollRef}
                display="flex"
                flexDirection="row"
                gap={2}
                padding={1}
                sx={{
                  maxWidth: {
                    xs: "100%",
                    sm: "calc(100vw - 530px)",
                  },
                  overflowX: "auto",
                  scrollbarWidth: "thin",
                  scrollSnapType: "x mandatory",
                  WebkitOverflowScrolling: "touch",
                  scrollPadding: "1rem",
                }}
              >
                {trip.legs.map((leg: TripLeg, index: number) => (
                  <motion.div
                    key={leg.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.3, duration: 0.4 }}
                    style={{ scrollSnapAlign: "start", flexShrink: 0 }}
                    onClick={() => handleLegCardClick(leg)}
                  >
                    <TripLegCard
                      leg={leg}
                      selected={selectedLegId === leg.id}
                      onClick={() => handleLegCardClick(leg)}
                    />
                  </motion.div>
                ))}
              </Box>

              <Button
                onClick={scrollRight}
                variant="outlined"
                size="small"
                sx={{ minWidth: "40px", height: "40px", borderRadius: "20px" }}
              >
                <ArrowForwardIosIcon fontSize="small" />
              </Button>
            </Box>
          </motion.div>
        )}
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
      <SvgLogbookModal
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        svgUrls={logSvgUrls}
        tripId={trip?.id}
      />
    </Box>
  );
};

export default TripPlanPage;
