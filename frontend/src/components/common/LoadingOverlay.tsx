import { Box, CircularProgress } from "@mui/material";

const LoadingOverlay = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 1300, // above everything, including drawer/snackbar
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress size={60} color="secondary" />
    </Box>
  );
};

export default LoadingOverlay;
