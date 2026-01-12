import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  LockOutlined as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { authAPI } from "../../services/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Get token from URL
    const token = searchParams.get("token");
    if (!token) {
      setError("Invalid reset link. Please request a new one.");
    } else {
      setResetToken(token);
    }
  }, [searchParams]);

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    setPasswordStrength(Math.min(5, strength));
  }, [password]);

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "error";
      case 2:
        return "warning";
      case 3:
      case 4:
        return "info";
      case 5:
        return "success";
      default:
        return "inherit";
    }
  };

  const getPasswordStrengthText = () => {
    const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
    return labels[passwordStrength];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (passwordStrength < 3) {
      setError("Password is too weak. Please use a stronger password.");
      return;
    }

    setLoading(true);

    try {
      // Assuming your backend has a reset-password endpoint
      await authAPI.resetPassword(resetToken, password);
      setSuccess("Password has been reset successfully. Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
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
                  bgcolor: "primary.main",
                  width: 56,
                  height: 56,
                }}
              >
                <LockIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mt: 2 }}>
                Reset Password
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 1, textAlign: "center" }}
              >
                Create a new strong password for your account
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
                label="New Password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !!success}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {password && (
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        height: 6,
                        bgcolor: "grey.300",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: `${(passwordStrength / 5) * 100}%`,
                          bgcolor: getPasswordStrengthColor() + ".main",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      color={getPasswordStrengthColor() + ".main"}
                      sx={{ fontWeight: 600, minWidth: 70 }}
                    >
                      {getPasswordStrengthText()}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Use uppercase, lowercase, numbers, and special characters
                  </Typography>
                </Box>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !!success}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {password && confirmPassword && password === confirmPassword && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2, color: "success.main" }}>
                  <CheckIcon sx={{ fontSize: 20 }} />
                  <Typography variant="caption">Passwords match</Typography>
                </Box>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, fontWeight: 600 }}
                disabled={loading || !!success || !resetToken}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Reset Password"
                )}
              </Button>

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Link
                  to="/login"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <Button color="primary" sx={{ textTransform: "none" }}>
                    Back to Login
                  </Button>
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default ResetPassword;
