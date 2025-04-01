import { Box, Typography, Button, Badge } from "@mui/material";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface LocationInputProps {
  icon: ReactNode;
  baseLabel: string;
  description: string;
  onClick: () => void;
  size?: "small" | "medium" | "large";
  value?: {
    label: string;
    lat: number;
    lon: number;
  };
  onClear?: () => void;
}

const LocationInput = ({
  icon,
  baseLabel,
  description,
  onClick,
  size = "medium",
  value,
  onClear,
}: LocationInputProps) => {
  const action = value ? "EDIT" : "SET";
  const label = `${action} ${baseLabel}`;

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      padding="10px"
      gap="0px"
      width="100%"
      sx={{
        backgroundColor: "highlight.main",
        color: "highlight.contrastText",
        borderRadius: "0px 12px 0px 12px",
        position: "relative",
      }}
    >
      <Badge
        color={
          baseLabel === "CURRENT LOCATION"
            ? "error"
            : baseLabel === "PICKUP LOCATION"
              ? "primary"
              : baseLabel === "DROPOFF LOCATION"
                ? "success"
                : "success"
        }
        variant="standard"
        badgeContent={
          <CheckCircleIcon
            sx={{
              color: "highlight.contrastText",
              width: 16,
              height: 16,
            }}
          />
        }
        invisible={!value}
        sx={{
          alignSelf: "flex-end",
          ".MuiBadge-badge": {
            transform: "scale(1.3) translate(50%, -50%)",
          },
        }}
      />
      {value && onClear && (
        <Button
          onClick={onClear}
          size="small"
          sx={{
            position: "absolute",
            top: 26,
            right: -16,
            padding: 0,
            backgroundColor: "rgba(70,0,0,0.75)",
            border: "1px solid rgba(70,0,0,0.75)",
            color: "highlight.contrastText",
            zIndex: 1,
            "&:hover": {
              backgroundColor: "rgba(70,0,0,0.9)",
            },
          }}
        >
          RESET
        </Button>
      )}
      <Button
        variant="contained"
        size={size}
        color="primary"
        startIcon={icon}
        fullWidth
        onClick={onClick}
        sx={{ borderRadius: "24px", padding: "8px" }}
      >
        {label}
      </Button>

      <AnimatePresence mode="wait">
        <motion.div
          key={value ? "set" : "default"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
        >
          <Typography
            fontSize={12}
            align="center"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              mt: 1,
            }}
          >
            {value ? value.label : description}
          </Typography>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default LocationInput;
