// src/components/layout/MainSite.tsx
import { Route, Routes } from "react-router-dom";
import Box from "@mui/material/Box";
// import your pages
import TripPlanPage from "../pages/TripPlanPage";
// import ProfilePage from "../pages/ProfilePage";
import AuthGuard from "../common/AuthGuard";
// import your header & footer components
import HeaderTop from "./Header";
import Footer from "./Footer";

const MainSite = () => {
  return (
    // Use a Box container to leverage MUI’s flexbox utilities
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh" // so footer can “stick” to bottom if content is short
    >
      {/* Sticky header */}
      <HeaderTop />

      {/* Main content */}
      <Box component="main" flex="1 0 auto">
        <Routes>
          <Route path="/" element={<TripPlanPage />} />
          {/* Protected route for trip planning */}
          <Route
            path="/trip-plan"
            element={
              <AuthGuard>
                <TripPlanPage />
              </AuthGuard>
            }
          />
          {/* Another protected route for profile */}
          {/* <Route
            path="/profile"
            element={
              <AuthGuard>
                <ProfilePage />
              </AuthGuard>
            }
          /> */}
        </Routes>
      </Box>

      {/* Sticky footer */}
      <Footer />
    </Box>
  );
};

export default MainSite;
