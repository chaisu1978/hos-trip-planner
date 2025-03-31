import { Box, Typography, Button } from "@mui/material";
import { ReactNode } from "react";

interface LocationInputProps {
  icon: ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  size?: "small" | "medium" | "large";
}

const LocationInput = ({
  icon,
  label,
  description,
  onClick,
  size = "medium",
}: LocationInputProps) => {
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
      <Typography fontSize={12} align="center">
        {description}
      </Typography>
    </Box>
  );
};

export default LocationInput;
