// Main Page Ract Component Placeholder
// This is a placeholder for the main page React component. You can replace the content with your own React component.

import { Box, Typography, Button, CircularProgress } from "@mui/material";

const TripPlanPage = () => {
  return (
    <Box
      id="trip-plan-page-start"
      display="flex"
      flex="1 0 auto"
      flexDirection={{ xs: "column", sm: "row" }}
      justifyContent="flex-start"
      alignItems="start"
      padding={{ xs: "24px", sm: "16px" }}
      gap={{ xs: "16px", sm: "32px" }}
      sx={{
        minHeight: "85vh", // Instead of fixed height
      }}
    >
      <Box
        id="inputs"
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"flex-start"}
        alignItems={"center"}
        padding={"11px 24px 24px 24px"}
        gap={"16px"}
        width={{ xs: "100%", sm: "25%" }}
        minWidth={{ xs: "100%", sm: "250px" }}
        sx={{
          borderRadius: { xs: "0px 16px 16px 0px", md: "0px 16px 0px 16px" },
          background: (theme) =>
            `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.highlight.main})`,
          position: { xs: "static", sm: "sticky" },
          top: { sm: "80px" },
          minHeight: "80vh",
        }}
      >
        <Typography variant="h5" fontFamily={"typeography.h1"} fontWeight={400}>
          TRIP DETAILS
        </Typography>
        {/* INPUT CARDS - TO MAKE INTO COMPONENT */}
        <Box
          id="trip-name"
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          padding={"10px"}
          gap={"8px"}
          width={"100%"}
          sx={{
            backgroundColor: "highlight.main",
            color: "highlight.contrastText",
            borderRadius: "0px 12px 0px 12px",
          }}
        >
          <Button
            variant="contained"
            size="medium"
            color="primary"
            fullWidth
            sx={{
              borderRadius: "24px",
              padding: "8px",
            }}
          >
            BUTTON LABEL
          </Button>
          <Typography fontSize={12}>Trip Name</Typography>
        </Box>
      </Box>
      <Box
        id="trip-summary"
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"flex-start"}
        alignItems={"flex-start"}
        padding={"11px 24px 24px 24px"}
        gap={"16px"}
        width={{ xs: "100%", sm: "75%" }}
        sx={{
          backgroundColor: "background.default",
          border: "0px solid transparent",
          boxShadow: 1,
          borderRadius: "4px",
          minHeight: "120vh",
          color: "text.primary",
        }}
      >
        2
      </Box>
    </Box>
  );
};

export default TripPlanPage;
