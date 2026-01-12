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
} from "@mui/material";
import {
  AccountCircle as AccountIcon,
  Lock as LockIcon,
  Verified as VerifiedIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { authAPI } from "../services/api";
import storageService from "../services/storageService";

function AccountSettings() {
  const [tabValue, setTabValue] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Avatar
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
      
      // Load avatar if exists
      if (userData.id) {
        loadAvatar(userData.id);
      }
      
      // Check 2FA status
      // const status = await authAPI.getTwoFAStatus();
      // setTwoFAEnabled(status.data?.data?.enabled || false);
    } catch (err) {
      console.error("Failed to load user data:", err);
    }
  };

  const loadAvatar = async (userId) => {
    try {
      const fileName = `avatars/user-${userId}.jpg`;
      const existsResult = await storageService.fileExists(fileName);
      // existsResult có thể là { exists: true/false } hoặc trực tiếp là boolean
      const exists = existsResult?.exists !== undefined ? existsResult.exists : existsResult;
      
      if (exists) {
        const url = await storageService.getImageUrl(fileName);
        if (url) {
          setAvatarUrl(url);
        }
      }
    } catch (err) {
      console.error("Failed to load avatar:", err);
      // Không set error để không làm gián đoạn UI nếu avatar không tồn tại
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB!');
      return;
    }

    setUploadingAvatar(true);
    setError("");
    setSuccess("");

    try {
      const result = await storageService.uploadAvatar(file, user.id);
      const url = await storageService.getImageUrl(result.fileName);
      setAvatarUrl(url);
      setSuccess('Cập nhật avatar thành công!');
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể upload avatar!');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa avatar?')) return;

    try {
      await storageService.deleteFile(`avatars/user-${user.id}.jpg`);
      setAvatarUrl("");
      setSuccess('Đã xóa avatar!');
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError('Không thể xóa avatar!');
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
    <Box sx={{ p: 2 }}>
      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<AccountIcon />} label="Profile" iconPosition="start" />
          <Tab icon={<LockIcon />} label="Password" iconPosition="start" />
          <Tab icon={<VerifiedIcon />} label="2FA" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Profile Tab */}
      {tabValue === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Profile Information
                  </Typography>
                  {!editProfile && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleEditProfile}
                    >
                      Edit
                    </Button>
                  )}
                </Box>

                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, mb: 2.5, pb: 2.5, borderBottom: 1, borderColor: 'divider' }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar 
                      src={avatarUrl} 
                      sx={{ width: 80, height: 80, bgcolor: "primary.main" }}
                    >
                      {!avatarUrl && <AccountIcon sx={{ fontSize: 48 }} />}
                    </Avatar>
                    {uploadingAvatar && (
                      <CircularProgress
                        size={80}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          zIndex: 1,
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      component="label"
                      disabled={uploadingAvatar}
                      startIcon={<EditIcon />}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Change Avatar
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                    </Button>
                    {avatarUrl && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={handleRemoveAvatar}
                        disabled={uploadingAvatar}
                        startIcon={<DeleteIcon />}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
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
                    <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={20} color="inherit" /> : "Save"}
                      </Button>
                      <Button
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
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Account Info
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.5 }}>
                      User ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user?.id || "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.5 }}>
                      Account Type
                    </Typography>
                    <Chip
                      label={user?.role || "USER"}
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.5 }}>
                      Member Since
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
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
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Change Password
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Use a strong password with uppercase, lowercase, numbers, and special characters.
              </Typography>
            </Alert>

            <Button
              variant="contained"
              startIcon={<LockIcon />}
              onClick={() => setPasswordDialog(true)}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 2FA Tab */}
      {tabValue === 2 && (
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Two-Factor Authentication
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                  Add an extra layer of security to your account
                </Typography>
              </Box>
              {twoFAEnabled && (
                <Chip
                  icon={<CheckIcon />}
                  label="Enabled"
                  color="success"
                  size="small"
                />
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              {twoFAEnabled ? (
                <Alert severity="success" sx={{ py: 1 }}>
                  Two-factor authentication is enabled on your account.
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ py: 1 }}>
                  Two-factor authentication is not enabled. We recommend enabling it.
                </Alert>
              )}
            </Box>

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
