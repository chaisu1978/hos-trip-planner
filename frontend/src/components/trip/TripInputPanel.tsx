import { Box, Typography, Button, CircularProgress } from "@mui/material";
import PersonPinCircleIcon from "@mui/icons-material/PersonPinCircle";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import LocationInput from "./LocationInput";
import CycleHoursInput from "./CycleHoursInput";
import { motion } from "framer-motion";

interface LocationData {
  label: string;
  lat: number;
  lon: number;
}

interface TripInputPanelProps {
  currentLocation: LocationData | null;
  pickupLocation: LocationData | null;
  dropoffLocation: LocationData | null;
  cycleHours: number;
  setCurrentLocation: (val: LocationData | null) => void;
  setPickupLocation: (val: LocationData | null) => void;
  setDropoffLocation: (val: LocationData | null) => void;
  setDrawerType: (val: "current" | "pickup" | "dropoff" | null) => void;
  setDrawerOpen: (val: boolean) => void;
  setCycleHours: (val: number) => void;
  submitting: boolean;
  tripPlanned: boolean;
  onSubmitTrip: () => void;
  onResetTrip: () => void;
}

const TripInputPanel = ({
  currentLocation,
  pickupLocation,
  dropoffLocation,
  cycleHours,
  setCurrentLocation,
  setPickupLocation,
  setDropoffLocation,
  setDrawerType,
  setDrawerOpen,
  setCycleHours,
  submitting,
  tripPlanned,
  onSubmitTrip,
  onResetTrip,
}: TripInputPanelProps) => {
  const handleOpenDrawer = (type: "current" | "pickup" | "dropoff") => {
    setDrawerType(type);
    setDrawerOpen(true);
  };

  const allSet = currentLocation && pickupLocation && dropoffLocation;

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="center"
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
      }}
    >
      <Typography variant="h5" fontFamily={"typeography.h1"} fontWeight={400}>
        TRIP DETAILS
      </Typography>

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
          scale: allSet ? 1 : 0.95,
          opacity: allSet ? 1 : 0.5,
        }}
        transition={{ duration: 0.2 }}
        style={{ width: "100%" }}
      >
        {tripPlanned ? (
          <Button
            variant="contained"
            size="large"
            startIcon={<RestartAltIcon />}
            color="primary"
            onClick={onResetTrip}
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
            disabled={!allSet || submitting}
            sx={{ borderRadius: "24px", padding: "8px" }}
            onClick={onSubmitTrip}
          >
            PLAN TRIP
          </Button>
        )}
      </motion.div>
    </Box>
  );
};

export default TripInputPanel;
