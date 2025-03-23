import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/auth";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/authSlice";
import { AppDispatch } from "../../store";
import axios from "axios";

const SignUpPage = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.post("/core/register/", {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        password: form.password,
        confirm_password: form.confirmPassword,
      });

      const { data: loginData } = await apiClient.post("/core/login/", {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("accessToken", loginData.access);
      localStorage.setItem("refreshToken", loginData.refresh);

      const { data: userDetails } = await apiClient.get("/core/me/");
      dispatch(loginSuccess(userDetails));

      navigate("/");
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        const responseError = err.response.data.error;
        if (Array.isArray(responseError)) {
          setError(responseError.join(" "));
        } else {
          setError(responseError || "Registration failed. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "background.paper",
      }}
    >
      <Box textAlign={"center"}>
        <Link href="/">
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            HOS Trip Planner
          </Typography>
        </Link>
        <Container
          maxWidth="xs"
          sx={{
            marginTop: 3,
            padding: 4,
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            backgroundColor: "background.default",
          }}
        >
          <Typography
            variant="h5"
            align="center"
            sx={{ marginBottom: 2, fontWeight: "bold" }}
          >
            Sign Up
          </Typography>
          <Typography
            align="center"
            sx={{ marginBottom: 3, color: "text.secondary" }}
          >
            Create an account to access the HOS Trip Planner.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              label="First Name"
              name="firstName"
              fullWidth
              variant="filled"
              required
              value={form.firstName}
              onChange={handleChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="Last Name"
              name="lastName"
              fullWidth
              variant="filled"
              required
              value={form.lastName}
              onChange={handleChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="Email"
              name="email"
              fullWidth
              variant="filled"
              required
              type="email"
              value={form.email}
              onChange={handleChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="Password"
              name="password"
              fullWidth
              variant="filled"
              required
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              sx={{ marginBottom: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              fullWidth
              variant="filled"
              required
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              sx={{ marginBottom: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={toggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Sign Up"}
            </Button>
          </form>
          <Box sx={{ marginTop: 2 }}>
            <Link href="/login" underline="hover">
              Already have an account? Sign In
            </Link>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default SignUpPage;
