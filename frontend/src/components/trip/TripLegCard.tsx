import { Box, Typography, Chip, ButtonBase, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import HotelIcon from "@mui/icons-material/Hotel";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { LegType, TripLeg } from "../../types/TripLeg";
import { PaletteColor } from "@mui/material";

export default function TripLegCard({
  leg,
  onClick,
}: {
  leg: TripLeg;
  onClick?: () => void;
}) {
  const theme = useTheme();

  const legIcons = {
    drive: <DirectionsCarIcon />,
    rest: <HotelIcon />,
    fuel: <LocalGasStationIcon />,
  };

  const legColors: Record<LegType, keyof typeof theme.palette> = {
    drive: "success",
    rest: "info",
    fuel: "error",
    break: "info",
    pickup: "warning",
    dropoff: "success",
    other: "info",
  };

  const icon = legIcons[leg.leg_type as keyof typeof legIcons] ?? (
    <AccessTimeIcon />
  );
  const paletteKey = legColors[leg.leg_type];
  const color = (theme.palette[paletteKey] as PaletteColor).main;

  return (
    <motion.div whileHover={{ scale: 1.02 }} style={{ width: "100%" }}>
      <ButtonBase
        onClick={onClick}
        sx={{
          width: "100%",
          textAlign: "left",
        }}
      >
        <Box
          boxShadow={1}
          padding={1}
          bgcolor="background.paper"
          display="flex"
          flexDirection="column"
          gap={0}
          minHeight={"95px"}
          minWidth={"250px"}
          sx={{
            width: "100%",
            borderLeft: "4px solid",
            borderColor: (theme) => theme.palette.secondary.main,
            borderRadius: "0 16px 0 16px",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              width={32}
              height={32}
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="50%"
              bgcolor={color}
              color="#fff"
            >
              {icon}
            </Box>

            <Typography variant="body1" fontWeight={500}>
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
      </ButtonBase>
    </motion.div>
  );
}
