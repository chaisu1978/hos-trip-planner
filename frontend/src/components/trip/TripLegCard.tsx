import { Box, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import HotelIcon from "@mui/icons-material/Hotel";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
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
        borderRadius="0 16px 0 16px"
        boxShadow={1}
        padding={1}
        bgcolor="background.paper"
        display="flex"
        flexDirection="column"
        gap={0}
        marginRight={1}
        minHeight={"95px"}
        minWidth={"250px"}
        sx={{
          borderLeft: "4px solid",
          borderColor: (theme) => theme.palette.secondary.main,
        }}
      >
        <Box display="flex" alignItems="center" gap={0}>
          {icon}
          <Typography variant="body1" mr={1.5} fontWeight={500}>
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
