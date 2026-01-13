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
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  Container,
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
  PhotoCamera as PhotoCameraIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Shield as ShieldIcon,
  VpnKey as VpnKeyIcon,
} from "@mui/icons-material";
import { authAPI } from "../services/api";
import storageService from "../services/storageService";
import toast from "react-hot-toast";

function AccountSettings() {
  const [tabValue, setTabValue] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Avatar
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

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

      // 1) Nếu user đã có avatar (Google OAuth hoặc đã lưu trong DB) → ưu tiên dùng trực tiếp
      if (userData.avatar) {
        const avatarPath = userData.avatar;
        const isAbsolute = /^https?:\/\//i.test(avatarPath);
        if (isAbsolute) {
          // Avatar từ Google (URL đầy đủ)
          setAvatarUrl(avatarPath);
        } else {
          // Avatar là path trong MinIO (ví dụ: avatars/user-<id>.jpg)
          try {
            const url = await storageService.getImageUrl(avatarPath);
            if (url && typeof url === "string") {
              setAvatarUrl(url);
            }
          } catch (e) {
            console.error("Failed to resolve avatar path from storage:", e);
            setAvatarUrl("");
          }
        }
      }
      // 2) Nếu chưa có avatar trong user nhưng có id → thử load từ MinIO theo convention cũ
      else if (userData.id) {
        loadAvatar(userData.id);
      }

      // (Tùy chọn) Check 2FA status sau này nếu cần
    } catch (err) {
      console.error("Failed to load user data:", err);
    }
  };

  const loadAvatar = async (userId) => {
    try {
      console.log('🔍 Loading avatar for user:', userId);
      const fileName = `avatars/user-${userId}.jpg`;
      console.log('📁 Checking file:', fileName);
      
      const existsResult = await storageService.fileExists(fileName);
      console.log('✅ File exists result:', existsResult);
      
      // existsResult có thể là { exists: true/false } hoặc trực tiếp là boolean
      const exists = existsResult?.exists !== undefined ? existsResult.exists : existsResult;
      
      if (exists) {
        console.log('🖼️ File exists, getting URL...');
        const url = await storageService.getImageUrl(fileName);
        console.log('🔗 URL result:', url);
        
        // getImageUrl should return URL string directly now
        if (url && typeof url === 'string' && url.trim() !== '') {
          console.log('✅ Setting avatar URL:', url);
          setAvatarUrl(url);
        } else {
          console.warn('⚠️ No valid URL returned, got:', url);
          setAvatarUrl(''); // Clear to show icon
        }
      } else {
        console.log('❌ Avatar file does not exist');
        setAvatarUrl(''); // Clear to show icon
      }
    } catch (err) {
      console.error("❌ Failed to load avatar:", err);
      console.error("Error details:", err.response?.data || err.message);
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
      const result = await storageService.uploadAvatar(file);
      console.log('📤 Upload result:', result);
      
      // Extract fileName from result (could be { fileName: ... } or just fileName string)
      const fileName = result?.fileName || result?.data?.fileName || result;
      console.log('📁 Using fileName:', fileName);
      
      const url = await storageService.getImageUrl(fileName);
      console.log('🔗 Got URL:', url);
      
      // Ensure URL is valid string
      if (url && typeof url === 'string' && url.trim() !== '') {
        setAvatarUrl(url);

        // Cập nhật user local với avatar path mới để header cũng nhận được
        const updatedUser = { ...(user || {}), avatar: fileName };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setSuccess('Cập nhật avatar thành công!');
        setTimeout(() => setSuccess(""), 3000);
      } else {
        console.warn('⚠️ Invalid URL returned:', url);
        setError('Không thể lấy URL ảnh. Vui lòng thử lại!');
      }
    } catch (err) {
      console.error('❌ Upload error:', err);
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
      await authAPI.changePassword(currentPassword, newPassword);
      setSuccess("Password changed successfully!");
      setPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to change password. Please try again."
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a2e1a", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <AccountIcon sx={{ fontSize: 40 }} />
          Account Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your profile, security, and preferences
        </Typography>
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
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{
            "& .MuiTab-root": {
              py: 2,
              fontSize: "0.95rem",
              fontWeight: 600,
              textTransform: "none",
            },
          }}
        >
          <Tab icon={<PersonIcon />} label="Profile" iconPosition="start" />
          <Tab icon={<VpnKeyIcon />} label="Security" iconPosition="start" />
          <Tab icon={<ShieldIcon />} label="Two-Factor Auth" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Profile Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", height: "100%" }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon color="primary" />
                    Profile Information
                  </Typography>
                  {!editProfile && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleEditProfile}
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      Edit
                    </Button>
                  )}
                </Box>

                {/* Avatar Section */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "center", sm: "flex-start" },
                    gap: 3,
                    mb: 4,
                    pb: 4,
                    borderBottom: 1,
                    borderColor: "divider",
                  }}
                >
                  <Box sx={{ position: "relative", flexShrink: 0 }}>
                    <Avatar
                      src={avatarUrl || undefined}
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: "primary.main",
                        border: "4px solid #e8f5e9",
                      }}
                      imgProps={{
                        onError: (e) => {
                          console.error("❌ Avatar image load error");
                        },
                        onLoad: () => {
                          console.log("✅ Avatar image loaded successfully");
                        },
                        crossOrigin: "anonymous",
                      }}
                    >
                      {(!avatarUrl || avatarUrl === "") && <AccountIcon sx={{ fontSize: 70 }} />}
                    </Avatar>
                    {uploadingAvatar && (
                      <CircularProgress
                        size={120}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          zIndex: 1,
                        }}
                      />
                    )}
                  </Box>
                  <Stack spacing={2} sx={{ flex: 1, width: { xs: "100%", sm: "auto" }, alignItems: { xs: "center", sm: "flex-start" } }}>
                    <Typography variant="h5" fontWeight={700} sx={{ textAlign: { xs: "center", sm: "left" } }}>
                      {user?.name || "User"}
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ width: "100%" }}>
                      <Button
                        size="medium"
                        variant="contained"
                        component="label"
                        disabled={uploadingAvatar}
                        startIcon={<PhotoCameraIcon />}
                        sx={{ textTransform: "none", fontWeight: 600, flex: { xs: 1, sm: "none" } }}
                      >
                        Upload Photo
                        <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                      </Button>
                      {avatarUrl && (
                        <Button
                          size="medium"
                          variant="outlined"
                          color="error"
                          onClick={handleRemoveAvatar}
                          disabled={uploadingAvatar}
                          startIcon={<DeleteIcon />}
                          sx={{ textTransform: "none", fontWeight: 600, flex: { xs: 1, sm: "none" } }}
                        >
                          Remove
                        </Button>
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: { xs: "center", sm: "left" } }}>
                      JPG, PNG or GIF (MAX. 5MB)
                    </Typography>
                  </Stack>
                </Box>

                {/* Profile Form */}
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    disabled={!editProfile || loading}
                    sx={{ 
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
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
                    sx={{ 
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    disabled={!editProfile || loading}
                    placeholder="+84 xxx xxx xxx"
                    sx={{ 
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {editProfile && (
                    <Stack direction="row" spacing={2} sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: "divider" }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={loading ? null : <SaveIcon />}
                        onClick={handleSaveProfile}
                        disabled={loading}
                        sx={{ textTransform: "none", fontWeight: 600, px: 4 }}
                      >
                        {loading ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<CloseIcon />}
                        onClick={() => setEditProfile(false)}
                        disabled={loading}
                        sx={{ textTransform: "none", fontWeight: 600, px: 4 }}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Account Info Card */}
          <Grid item xs={12} md={4}>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 2, 
                border: "1px solid", 
                borderColor: "divider", 
                background: "linear-gradient(135deg, #f8fcf8 0%, #e8f5e9 100%)",
                height: "100%",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <CardContent sx={{ p: 4, flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 4, display: "flex", alignItems: "center", gap: 1 }}>
                  <AccountIcon color="primary" />
                  Account Info
                </Typography>

                <Stack spacing={3.5} sx={{ flex: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5, fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      User ID
                    </Typography>
                    <Chip
                      label={user?.id || "N/A"}
                      size="medium"
                      sx={{ 
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        height: 32,
                        bgcolor: "rgba(255, 255, 255, 0.8)",
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5, fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Account Type
                    </Typography>
                    <Chip
                      label={user?.role || "USER"}
                      color={user?.role === "ADMIN" ? "error" : "primary"}
                      size="medium"
                      sx={{ 
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        height: 32,
                      }}
                    />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5, fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Member Since
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary" }}>
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      }) : "N/A"}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Password Tab */}
      {tabValue === 1 && (
        <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <VpnKeyIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Security & Password
              </Typography>
            </Box>

            <Alert severity="info" icon={<LockIcon />} sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={500}>
                Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
              </Typography>
            </Alert>

            <Button
              variant="contained"
              size="large"
              startIcon={<LockIcon />}
              onClick={() => setPasswordDialog(true)}
              sx={{ textTransform: "none", fontWeight: 600, px: 3 }}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 2FA Tab */}
      {tabValue === 2 && (
        <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ShieldIcon color="primary" sx={{ fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Two-Factor Authentication
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add an extra layer of security to your account
                  </Typography>
                </Box>
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

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              {twoFAEnabled ? (
                <Alert severity="success" icon={<VerifiedIcon />}>
                  <Typography variant="body2" fontWeight={500}>
                    Two-factor authentication is enabled on your account. Your account is protected with an additional security layer.
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="warning" icon={<LockIcon />}>
                  <Typography variant="body2" fontWeight={500}>
                    Two-factor authentication is not enabled. We strongly recommend enabling it to protect your account.
                  </Typography>
                </Alert>
              )}
            </Box>

            <Button
              variant={twoFAEnabled ? "outlined" : "contained"}
              size="large"
              color={twoFAEnabled ? "error" : "success"}
              startIcon={twoFAEnabled ? <CloseIcon /> : <VerifiedIcon />}
              onClick={() => {
                if (twoFAEnabled) {
                  if (window.confirm("Are you sure you want to disable 2FA?")) {
                    setTwoFAEnabled(false);
                    toast.success("2FA has been disabled");
                  }
                } else {
                  navigate("/security/2fa");
                }
              }}
              sx={{ textTransform: "none", fontWeight: 600, px: 3 }}
            >
              {twoFAEnabled ? "Disable 2FA" : "Setup 2FA"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialog}
        onClose={() => !loading && setPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LockIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Change Password
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type={showPasswords.current ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                      }
                      edge="end"
                    >
                      {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="New Password"
              type={showPasswords.new ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                      }
                      edge="end"
                    >
                      {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {newPassword && (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Box
                    sx={{
                      flex: 1,
                      height: 8,
                      bgcolor: "grey.200",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${(passwordStrength / 5) * 100}%`,
                        bgcolor: getPasswordStrengthColor() + ".main",
                        transition: "all 0.3s ease",
                        borderRadius: 4,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: getPasswordStrengthColor() + ".main",
                      fontWeight: 700,
                      minWidth: 80,
                      textAlign: "right",
                    }}
                  >
                    {getPasswordStrengthText()}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Use 8+ characters with mix of letters, numbers & symbols
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPasswords.confirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              error={confirmPassword && newPassword !== confirmPassword}
              helperText={
                confirmPassword && newPassword !== confirmPassword
                  ? "Passwords do not match"
                  : ""
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                      }
                      edge="end"
                    >
                      {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {newPassword && confirmPassword && newPassword === confirmPassword && (
              <Alert severity="success" icon={<CheckIcon />}>
                <Typography variant="body2" fontWeight={500}>
                  Passwords match
                </Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setPasswordDialog(false)}
            disabled={loading}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={
              loading ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              passwordStrength < 2
            }
            startIcon={loading ? null : <SaveIcon />}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Update Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AccountSettings;
