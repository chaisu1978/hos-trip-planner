import { Box, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import HotelIcon from "@mui/icons-material/Hotel";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StraightenIcon from "@mui/icons-material/Straighten";
import { TripLeg } from "../../types/TripLeg";

const legIcons = {
  drive: <DirectionsCarIcon />,
  rest: <HotelIcon />,
  fuel: <LocalGasStationIcon />,
};

export default function TripLegCard({ leg }: { leg: TripLeg }) {
  const icon = legIcons[leg.leg_type as keyof typeof legIcons] ?? (
    <AccessTimeIcon />
  );

  return (
    <motion.div whileHover={{ scale: 1.02 }} style={{ width: "100%" }}>
      <Box
        borderRadius="16px"
        boxShadow={2}
        padding={2}
        bgcolor="background.paper"
        display="flex"
        flexDirection="column"
        gap={1}
        sx={{
          borderLeft: "8px solid",
          borderColor: (theme) => theme.palette.success.main,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          {icon}
          <Typography variant="h6" fontWeight={500}>
            {leg.leg_type.toUpperCase()}
          </Typography>
          <Chip
            label={`${Number(leg.duration_hours ?? 0).toFixed(2)} hrs`}
            size="small"
          />
          <Chip
            label={`${Number(leg.distance_miles ?? 0).toFixed(1)} mi`}
            size="small"
          />
        </Box>

        <Typography fontSize="0.9rem" color="text.secondary">
          {leg.start_label}
        </Typography>

        {leg.notes && (
          <Typography fontSize="0.85rem" color="text.secondary">
            {leg.notes}
          </Typography>
        )}
      </Box>
    </motion.div>
  );
}
