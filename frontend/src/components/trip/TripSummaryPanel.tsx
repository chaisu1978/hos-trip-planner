import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import TripLegCard from "./TripLegCard";
import { TripLeg } from "../../types/TripLeg";
import { useRef } from "react";

interface Props {
  trip: any;
  selectedLegId: number | null;
  onSelectLeg: (legId: number) => void;
  onShowLogs: () => void;
  logsLoading: boolean;
}

const TripSummaryPanel = ({
  trip,
  selectedLegId,
  onSelectLeg,
  onShowLogs,
  logsLoading,
}: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalMiles = trip?.legs?.reduce(
    (sum: number, leg: TripLeg) => sum + Number(leg.distance_miles ?? 0),
    0
  );
  const totalHoursRaw = trip?.legs?.reduce(
    (sum: number, leg: TripLeg) => sum + Number(leg.duration_hours ?? 0),
    0
  );
  const totalHours = Number.isFinite(totalHoursRaw) ? totalHoursRaw : 0;
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  const formattedDuration = `${hours} hrs ${minutes} min`;

  const scrollByAmount = 200;
  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -scrollByAmount, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: scrollByAmount, behavior: "smooth" });
  };

  return (
    <>
      <Box
        id="trip-summary-header"
        display={"flex"}
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent={"space-between"}
        alignItems={{ xs: "center", sm: "baseline" }}
        width={"100%"}
      >
        <Typography variant="h5" fontFamily={"typeography.h1"} fontWeight={400}>
          TRIP SUMMARY
        </Typography>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ display: "flex", gap: "8px" }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            fontSize="1.1rem"
            fontWeight={600}
          >
            {`${Number.isFinite(totalMiles) ? totalMiles.toFixed(0) : "0"} miles, ${formattedDuration}`}
          </Typography>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ display: "flex", gap: "8px" }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={
              logsLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <LibraryBooksIcon />
              )
            }
            sx={{
              borderRadius: "24px",
              padding: "8px 24px",
              backgroundColor: "tertiary.main",
              color: "text.primary",
            }}
            onClick={onShowLogs}
            disabled={logsLoading}
          >
            {logsLoading ? "GETTING LOGS" : "DAILY LOGS"}
          </Button>
        </motion.div>
      </Box>

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
            color="inherit"
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
                onClick={() => onSelectLeg(leg.id)}
              >
                <TripLegCard
                  leg={leg}
                  selected={selectedLegId === leg.id}
                  onClick={() => onSelectLeg(leg.id)}
                />
              </motion.div>
            ))}
          </Box>

          <Button
            onClick={scrollRight}
            variant="outlined"
            color="inherit"
            size="small"
            sx={{ minWidth: "40px", height: "40px", borderRadius: "20px" }}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </Button>
        </Box>
      </motion.div>
    </>
  );
};

export default TripSummaryPanel;
