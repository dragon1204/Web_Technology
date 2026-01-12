import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  CircularProgress,
} from "@mui/material";
import {
  EmailOutlined as EmailIcon,
  ArrowBack as BackIcon,
} from "@mui/icons-material";
import { authAPI } from "../../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Assuming your backend has a forgot-password endpoint
      // If not, you may need to adjust this
      await authAPI.forgotPassword(email);
      setSuccess(
        "Password reset link has been sent to your email. Please check your inbox."
      );
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send reset link. Please try again."
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
          minHeight: "90vh",
        }}
      >
        <Card
          sx={{
            width: "100%",
            mt: 3,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                sx={{
                  m: 1,
                  bgcolor: "warning.main",
                  width: 56,
                  height: 56,
                }}
              >
                <EmailIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mt: 2 }}>
                Forgot Password
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 1, textAlign: "center" }}
              >
                Enter your email address and we'll send you a link to reset your
                password.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 3 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || !!success}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, fontWeight: 600 }}
                disabled={loading || !!success}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Button
                  color="primary"
                  startIcon={<BackIcon />}
                  onClick={() => navigate("/login")}
                  sx={{ textTransform: "none" }}
                >
                  Back to Login
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="caption" color="textSecondary" sx={{ mt: 3 }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: "inherit", textDecoration: "none", fontWeight: 700 }}
          >
            Sign up
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default ForgotPassword;
