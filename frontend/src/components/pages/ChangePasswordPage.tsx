import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/auth";

const ChangePasswordPage = () => {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLogBackIn, setShowLogBackIn] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await apiClient.post("/core/me/password/", form);
      setSuccess(response.data.message || "Password changed successfully!");
      setForm({ current_password: "", new_password: "", confirm_password: "" });
      setShowLogBackIn(true); // Show the "Log Back In" button
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogBackIn = () => {
    // Redirect to the home page
    navigate("/");
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
      <Box textAlign="center">
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
            Change Password
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
          {!showLogBackIn ? (
            <form onSubmit={handleSubmit}>
              <TextField
                label="Current Password"
                name="current_password"
                type="password"
                fullWidth
                required
                variant="filled"
                value={form.current_password}
                onChange={handleChange}
                sx={{ marginBottom: 2 }}
              />
              <TextField
                label="New Password"
                name="new_password"
                type="password"
                fullWidth
                required
                variant="filled"
                value={form.new_password}
                onChange={handleChange}
                sx={{ marginBottom: 2 }}
              />
              <TextField
                label="Confirm New Password"
                name="confirm_password"
                type="password"
                fullWidth
                required
                variant="filled"
                value={form.confirm_password}
                onChange={handleChange}
                sx={{ marginBottom: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Change Password"}
              </Button>
            </form>
          ) : (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleLogBackIn}
            >
              Back To Home
            </Button>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default ChangePasswordPage;
