// src/components/layout/HeaderTop.tsx
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Button, Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { logout } from "../../services/auth";
import { Link } from "react-router-dom";
import LightLogo from "../../assets/hos-icon-light.svg";

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
        <Link to="/">
          <img
            src={LightLogo}
            alt="HOS Trip Planner Logo"
            style={{
              height: "35px",
              marginRight: "16px",
            }}
          />
        </Link>
        {/* Spacer that always pushes buttons to the right */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{
              display: { xs: "none", sm: "block" },
            }}
          >
            HOS Trip Planner
          </Typography>
        </Box>
        {/* Right side: conditional buttons */}
        {!isAuthenticated ? (
          <Box>
            <Button
              variant="contained"
              color="primary"
              size="small"
              component={Link}
              to="/login"
              sx={{ marginRight: 1 }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              component={Link}
              to="/sign-up"
            >
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
