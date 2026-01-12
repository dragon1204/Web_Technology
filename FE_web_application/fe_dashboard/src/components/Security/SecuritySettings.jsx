import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Avatar,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Edit as EditIcon,
  Password as PasswordIcon,
  Verified as VerifiedIcon,
  Error as ErrorIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { authAPI } from "../../services/api";

function SecuritySettings() {
  const [loading, setLoading] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [passwordChangeDialog, setPasswordChangeDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkSecurityStatus();
  }, []);

  const checkSecurityStatus = async () => {
    try {
      // const response = await authAPI.getTwoFAStatus();
      // setTwoFAEnabled(response.data?.data?.enabled || false);
    } catch (err) {
      console.error("Failed to check 2FA status:", err);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      // await authAPI.changePassword(currentPassword, newPassword);
      setSuccess("Password changed successfully!");
      setPasswordChangeDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    if (twoFAEnabled) {
      // Show disable confirmation
      if (
        !window.confirm(
          "Are you sure you want to disable 2FA? This reduces your account security."
        )
      ) {
        return;
      }
      setLoading(true);
      try {
        // await authAPI.disableTwoFA();
        setTwoFAEnabled(false);
        setSuccess("Two-factor authentication has been disabled.");
      } catch (err) {
        setError("Failed to disable 2FA.");
      } finally {
        setLoading(false);
      }
    } else {
      // Navigate to 2FA setup
      navigate("/security/2fa");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: "primary.main" }}>
            <SecurityIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Security Settings
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Manage your account security and privacy
            </Typography>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Password Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <PasswordIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Password
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Change your password regularly to keep your account secure.
              </Typography>

              <Box
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 2,
                  mb: 2,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="caption" color="textSecondary">
                  Last changed: <strong>2 months ago</strong>
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setPasswordChangeDialog(true)}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* 2FA Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <VerifiedIcon color={twoFAEnabled ? "success" : "warning"} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Two-Factor Authentication
                  </Typography>
                  {twoFAEnabled && (
                    <Chip
                      label="Active"
                      size="small"
                      color="success"
                      icon={<CheckIcon />}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                {twoFAEnabled
                  ? "Your account is protected with two-factor authentication."
                  : "Enable 2FA to add an extra layer of security to your account."}
              </Typography>

              <Button
                fullWidth
                variant={twoFAEnabled ? "outlined" : "contained"}
                color={twoFAEnabled ? "error" : "success"}
                onClick={handleToggle2FA}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : twoFAEnabled ? (
                  "Disable 2FA"
                ) : (
                  "Enable 2FA"
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Login Activity Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Login Activity
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Recent login activity on your account
              </Typography>

              <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                {[
                  {
                    device: "Chrome on Windows",
                    location: "Ho Chi Minh City, Vietnam",
                    time: "Today at 10:30 AM",
                    current: true,
                  },
                  {
                    device: "Safari on iPhone",
                    location: "Ha Noi, Vietnam",
                    time: "2 days ago",
                    current: false,
                  },
                  {
                    device: "Chrome on Windows",
                    location: "Da Nang, Vietnam",
                    time: "1 week ago",
                    current: false,
                  },
                ].map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      borderLeft: activity.current ? "4px solid" : "none",
                      borderColor: activity.current ? "primary.main" : "transparent",
                      bgcolor: activity.current ? "primary.light" : "transparent",
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {activity.device}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {activity.location} • {activity.time}
                        </Typography>
                      </Box>
                      {activity.current && (
                        <Typography
                          variant="caption"
                          sx={{ color: "primary.main", fontWeight: 600 }}
                        >
                          Current
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>

              <Button
                fullWidth
                variant="outlined"
                color="error"
                sx={{ mt: 2 }}
              >
                Sign Out All Other Sessions
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Sessions Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <SecurityIcon color="warning" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Connected Devices
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                {[
                  { name: "Main Laptop", type: "Desktop", active: true },
                  { name: "Work Tablet", type: "Tablet", active: true },
                  { name: "Old Phone", type: "Mobile", active: false },
                ].map((device, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: index < 2 ? "1px solid" : "none",
                      borderColor: "grey.200",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {device.name}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                        <Typography variant="caption" color="textSecondary">
                          {device.type}
                        </Typography>
                        {device.active ? (
                          <CheckIcon sx={{ fontSize: 14, color: "success.main" }} />
                        ) : (
                          <ErrorIcon sx={{ fontSize: 14, color: "error.main" }} />
                        )}
                      </Box>
                    </Box>
                    <Button size="small" color="error">
                      Remove
                    </Button>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordChangeDialog}
        onClose={() => setPasswordChangeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPasswordChangeDialog(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Change"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SecuritySettings;
