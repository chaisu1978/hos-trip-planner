// src/components/layout/HeaderTop.tsx
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Button, Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { logout } from "../../services/auth";
import { Link } from "react-router-dom";

const Header = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const handleLogout = () => {
    logout();
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        {/* Left side: Logo or Title */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          HOS Trip Planner
        </Typography>

        {/* Right side: conditional buttons */}
        {!isAuthenticated ? (
          <Box>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/sign-up">
              Sign Up
            </Button>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={Link} to="/profile">
              Profile
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
