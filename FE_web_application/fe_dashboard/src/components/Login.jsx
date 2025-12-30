import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
} from "@mui/material";
import { LockOutlined as LockIcon } from "@mui/icons-material";
import { authAPI } from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const payload = response.data?.data || response.data || {};
      const accessToken =
        payload.access_token ||
        payload.accessToken ||
        payload.token ||
        payload?.data?.access_token ||
        payload?.data?.accessToken;
      const refreshToken =
        payload.refresh_token || payload.refreshToken || payload?.data?.refresh_token;

      if (!accessToken) {
        throw new Error("Không nhận được access_token từ server");
      }

      localStorage.setItem("token", accessToken);
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
      if (payload.user) localStorage.setItem("user", JSON.stringify(payload.user));
      // đảm bảo axios instance có header ngay lập tức trước khi navigate
      try {
        const { default: apiInstance } = await import("../services/api");
        apiInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      } catch (e) {
        console.warn("Cannot set default auth header immediately", e);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(
        typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : JSON.stringify(err.response?.data) ||
              "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Card sx={{ width: "100%", mt: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
                <LockIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Garden IOT Login
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Login;
