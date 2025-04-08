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
  selected = false,
}: {
  leg: TripLeg;
  onClick?: () => void;
  selected?: boolean;
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
    <motion.div
      whileHover={{ scale: 1.05 }}
      animate={{
        scale: selected ? 1.05 : 1,
        backgroundColor: selected
          ? theme.palette.action.selected
          : "transparent",
      }}
      transition={{ duration: 0.3 }}
      style={{ width: "100%", borderRadius: "16px" }}
    >
      <ButtonBase onClick={onClick} sx={{ width: "100%", textAlign: "left" }}>
        <Box
          boxShadow={selected ? 3 : 1}
          padding={1.5}
          bgcolor={selected ? "highlight.main" : "background.paper"}
          color={selected ? "highlight.contrastText" : "text.primary"}
          minHeight={"108px"}
          minWidth={"200px"}
          sx={{
            width: "100%",
            borderLeft: "4px solid",
            borderColor: selected
              ? theme.palette.primary.main
              : theme.palette.secondary.main,
            borderRadius: "0 16px 0 16px",
            transition: "border-color 0.5s ease",
          }}
        >
          {/* Top-level layout: left = content, right = chips */}
          <Box display="flex" justifyContent="space-between" gap={2}>
            {/* Left column: icon + title + label + notes */}
            <Box display="flex" flexDirection="column" gap={0.75} flex={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  width={32}
                  height={32}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="50%"
                  bgcolor={color}
                  color="highlight.contrastText"
                >
                  {icon}
                </Box>
                <Typography
                  variant="body1"
                  fontWeight={500}
                  color={selected ? "highlight.contrastText" : "text.primary"}
                >
                  {leg.leg_type.toUpperCase()}
                </Typography>
              </Box>

              <Typography
                fontSize="0.9rem"
                color={selected ? "highlight.contrastText" : "text.primary"}
              >
                {leg.start_label}
              </Typography>
            </Box>

            {/* Right column: stacked chips */}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-end"
              justifyContent="flex-start"
              gap={0.5}
              minWidth="fit-content"
            >
              <Chip
                label={`${Number(leg.duration_hours ?? 0).toFixed(2)} hrs`}
                size="small"
                sx={{
                  color: selected ? "highlight.contrastText" : "text.primary",
                }}
              />
              <Chip
                label={`${Number(leg.distance_miles ?? 0).toFixed(1)} mi`}
                size="small"
                sx={{
                  color: selected ? "highlight.contrastText" : "text.primary",
                }}
              />
            </Box>
          </Box>
          {leg.notes && (
            <Typography
              fontSize="0.75rem"
              color={selected ? "highlight.contrastText" : "text.primary"}
            >
              {leg.notes}
            </Typography>
          )}
        </Box>
      </ButtonBase>
    </motion.div>
  );
}
