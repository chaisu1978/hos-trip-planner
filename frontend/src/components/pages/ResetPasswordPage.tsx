import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../services/auth";

const ResetPasswordPage = () => {
  const [form, setForm] = useState({
    token: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await apiClient.post("/core/password_reset/confirm/", {
        token: form.token,
        password: form.password,
      });
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000); // Redirect after success
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred.");
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
        <Link to="/">
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            HOS Trip Planner
          </Typography>
        </Link>
        <Container
          maxWidth="xs"
          sx={{
            padding: 4,
            marginTop: 3,
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            backgroundColor: "background.default",
          }}
        >
          <Typography variant="h5" align="center" sx={{ marginBottom: 2 }}>
            Reset Password
          </Typography>
          {error && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ marginBottom: 2 }}>
              {success}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Reset Token"
              name="token"
              fullWidth
              required
              value={form.token}
              onChange={handleChange}
              variant="filled"
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="New Password"
              name="password"
              type="password"
              fullWidth
              required
              value={form.password}
              onChange={handleChange}
              variant="filled"
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              fullWidth
              required
              value={form.confirmPassword}
              onChange={handleChange}
              variant="filled"
              sx={{ marginBottom: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Reset Password"}
            </Button>
          </form>
        </Container>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
