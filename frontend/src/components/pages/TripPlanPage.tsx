import { useState } from "react";
import { useTheme, Box, Typography } from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TripInputPanel from "../trip/TripInputPanel";
import TripSummaryPanel from "../trip/TripSummaryPanel";
import LocationDrawer from "../trip/LocationDrawer";
import AnimatedTripMap from "../trip/AnimatedTripMap";
import { TripLeg } from "../../types/TripLeg";
import { useSnackbar } from "../common/SnackbarProvider";
import apiClient from "../../services/auth";
import { motion } from "framer-motion";
import { useRef } from "react";
import LoadingOverlay from "../common/LoadingOverlay";
import SvgLogbookModal from "../triplogs/SvgLogbookModal";

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
        current_cycle_hours: cycleHours.toFixed(2),
        departure_time: new Date().toISOString(),
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
      showSnackbar("Trip planned successfully!", "success");

      setTrip({ ...response.data, legs }); // override legs with normalized version
      if (mapSectionRef.current) {
        mapSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } catch (error) {
      showSnackbar("Failed to plan trip. Please try again.", "error");
    } finally {
      setSubmitting(false);
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

      <TripInputPanel
        currentLocation={currentLocation}
        pickupLocation={pickupLocation}
        dropoffLocation={dropoffLocation}
        cycleHours={cycleHours}
        setCurrentLocation={setCurrentLocation}
        setPickupLocation={setPickupLocation}
        setDropoffLocation={setDropoffLocation}
        setDrawerType={setDrawerType}
        setDrawerOpen={setDrawerOpen}
        setCycleHours={setCycleHours}
        submitting={submitting}
        tripPlanned={tripPlanned}
        onSubmitTrip={handleSubmitTrip}
        onResetTrip={handleResetTrip}
      />

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
        {trip?.legs?.length > 0 && (
          <TripSummaryPanel
            trip={trip}
            selectedLegId={selectedLegId}
            onSelectLeg={(id) => {
              const leg = trip.legs.find((l: TripLeg) => l.id === id);
              if (leg) handleLegCardClick(leg);
            }}
            onShowLogs={handleShowLogs}
            logsLoading={logsLoading}
          />
        )}
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
