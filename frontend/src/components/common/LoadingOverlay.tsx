import { Box, CircularProgress, Typography, Portal } from "@mui/material";
import { motion } from "framer-motion";

const LoadingOverlay = ({
  message = "Planning trip...",
}: {
  message?: string;
}) => {
  return (
    <Portal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 1600,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={60} sx={{ color: "white" }} />
          <Typography mt={2} color="white" fontWeight={300}>
            {message}
          </Typography>
        </Box>
      </motion.div>
    </Portal>
  );
};

export default LoadingOverlay;
