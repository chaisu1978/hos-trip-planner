// Footer React Component
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        position: "sticky",
        bottom: 0,
        zIndex: (theme) => theme.zIndex.appBar, // Ensure it stays above the main content
        backgroundColor: "primary.dark",
        color: "searchbox.contrastText",
        minHeight: "35px",
      }}
    >
      <Typography variant="body2">&copy; 2025 HOS Trip Planner</Typography>
    </Box>
  );
};

export default Footer;
