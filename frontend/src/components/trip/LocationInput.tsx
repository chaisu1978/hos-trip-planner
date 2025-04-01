import { Box, Typography, Button, Badge } from "@mui/material";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WhereToVoteIcon from "@mui/icons-material/WhereToVote";

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
}

const LocationInput = ({
  icon,
  baseLabel,
  description,
  onClick,
  size = "medium",
  value,
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
      gap="8px"
      width="100%"
      sx={{
        backgroundColor: "highlight.main",
        color: "highlight.contrastText",
        borderRadius: "0px 12px 0px 12px",
      }}
    >
      <Badge
        color="secondary"
        variant="standard"
        badgeContent={<WhereToVoteIcon />}
        invisible={!value}
        sx={{
          alignSelf: "flex-end",
          ".MuiBadge-badge": {
            transform: "scale(1.5) translate(50%, -50%)",
          },
        }}
      />

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
