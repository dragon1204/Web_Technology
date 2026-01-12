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
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from "@mui/material";
import {
  AccountCircle as AccountIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  Verified as VerifiedIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Devices as DevicesIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { authAPI } from "../../services/api";

function AccountSettings() {
  const [tabValue, setTabValue] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile
  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Password
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  // 2FA
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFADialog, setTwoFADialog] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  // Calculate password strength
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      return;
    }
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (newPassword.length >= 12) strength++;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[!@#$%^&*]/.test(newPassword)) strength++;
    setPasswordStrength(Math.min(5, strength));
  }, [newPassword]);

  const loadUserData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(userData);
      setProfileData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      });
      // Check 2FA status
      // const status = await authAPI.getTwoFAStatus();
      // setTwoFAEnabled(status.data?.data?.enabled || false);
    } catch (err) {
      console.error("Failed to load user data:", err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Profile handlers
  const handleEditProfile = () => {
    setEditProfile(true);
    setError("");
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // await authAPI.updateProfile(profileData);
      setSuccess("Profile updated successfully!");
      setEditProfile(false);
      // Update local storage
      localStorage.setItem("user", JSON.stringify({ ...user, ...profileData }));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Password handlers
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

    if (passwordStrength < 3) {
      setError("Password is too weak. Please use a stronger password.");
      return;
    }

    setLoading(true);

    try {
      // await authAPI.changePassword(currentPassword, newPassword);
      setSuccess("Password changed successfully!");
      setPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main" }}>
            <AccountIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Account Settings
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Manage your profile and security preferences
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<AccountIcon />} label="Profile" iconPosition="start" />
          <Tab icon={<LockIcon />} label="Password" iconPosition="start" />
          <Tab icon={<VerifiedIcon />} label="Two-Factor Auth" iconPosition="start" />
          <Tab icon={<DevicesIcon />} label="Sessions" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Profile Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Profile Information
                  </Typography>
                  {!editProfile && (
                    <Button
                      startIcon={<EditIcon />}
                      onClick={handleEditProfile}
                    >
                      Edit
                    </Button>
                  )}
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    disabled={!editProfile || loading}
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    disabled={!editProfile || loading}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    disabled={!editProfile || loading}
                  />

                  {editProfile && (
                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<CloseIcon />}
                        onClick={() => setEditProfile(false)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Account Info
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      User ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {user?.id || "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Account Type
                    </Typography>
                    <Chip
                      label={user?.role || "USER"}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Member Since
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Password Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Change Password
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    For your security, please use a strong password with uppercase, lowercase,
                    numbers, and special characters.
                  </Typography>
                </Alert>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Last changed: <strong>45 days ago</strong>
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<LockIcon />}
                    onClick={() => setPasswordDialog(true)}
                  >
                    Change Password
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Password Tips
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <List dense>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon sx={{ fontSize: 18, color: "success.main" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="At least 8 characters"
                      primaryTypographyProps={{ variant: "caption" }}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon sx={{ fontSize: 18, color: "success.main" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Mix of uppercase and lowercase"
                      primaryTypographyProps={{ variant: "caption" }}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon sx={{ fontSize: 18, color: "success.main" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Include numbers"
                      primaryTypographyProps={{ variant: "caption" }}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon sx={{ fontSize: 18, color: "success.main" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Special characters (!@#$%)"
                      primaryTypographyProps={{ variant: "caption" }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 2FA Tab */}
      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Two-Factor Authentication
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Add an extra layer of security to your account
                </Typography>
              </Box>
              {twoFAEnabled && (
                <Chip
                  icon={<CheckIcon />}
                  label="Enabled"
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 3 }}>
              {twoFAEnabled ? (
                <Alert severity="success">
                  Two-factor authentication is enabled on your account. You will need
                  to enter a verification code when logging in.
                </Alert>
              ) : (
                <Alert severity="warning">
                  Two-factor authentication is not enabled. We strongly recommend enabling
                  it to protect your account.
                </Alert>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant={twoFAEnabled ? "outlined" : "contained"}
                color={twoFAEnabled ? "error" : "success"}
                onClick={() => {
                  if (twoFAEnabled) {
                    if (window.confirm("Are you sure you want to disable 2FA?")) {
                      setTwoFAEnabled(false);
                      setSuccess("2FA has been disabled");
                    }
                  } else {
                    navigate("/security/2fa");
                  }
                }}
              >
                {twoFAEnabled ? "Disable 2FA" : "Setup 2FA"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Sessions Tab */}
      {tabValue === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Active Sessions
            </Typography>

            <List>
              {[
                {
                  device: "Chrome on Windows",
                  location: "Ho Chi Minh City, Vietnam",
                  time: "Active now",
                  current: true,
                },
                {
                  device: "Safari on iPhone",
                  location: "Ha Noi, Vietnam",
                  time: "2 hours ago",
                  current: false,
                },
                {
                  device: "Chrome on Windows",
                  location: "Da Nang, Vietnam",
                  time: "1 day ago",
                  current: false,
                },
              ].map((session, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    !session.current && (
                      <IconButton edge="end" aria-label="delete" color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                  sx={{
                    borderLeft: session.current ? "4px solid" : "none",
                    borderColor: session.current ? "primary.main" : "transparent",
                    pl: session.current ? 1 : 2,
                  }}
                >
                  <ListItemIcon>
                    <DevicesIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={session.device}
                    secondary={
                      <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <LocationIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption">{session.location}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption">{session.time}</Typography>
                        </Box>
                        {session.current && (
                          <Chip label="Current" size="small" color="primary" />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 3 }} />

            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
            >
              Sign Out All Other Sessions
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialog}
        onClose={() => setPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type={showPasswords.current ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="New Password"
              type={showPasswords.new ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />

            {newPassword && (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
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
                    sx={{
                      color: getPasswordStrengthColor() + ".main",
                      fontWeight: 600,
                      minWidth: 60,
                    }}
                  >
                    {getPasswordStrengthText()}
                  </Typography>
                </Box>
              </Box>
            )}

            <TextField
              fullWidth
              label="Confirm Password"
              type={showPasswords.confirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />

            {newPassword && confirmPassword && newPassword === confirmPassword && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "success.main" }}>
                <CheckIcon sx={{ fontSize: 20 }} />
                <Typography variant="caption">Passwords match</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)} disabled={loading}>
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

export default AccountSettings;
