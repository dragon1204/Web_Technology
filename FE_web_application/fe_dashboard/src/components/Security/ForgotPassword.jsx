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
import toast from "react-hot-toast";

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [formData, setFormData] = useState({
    email: "",
    otpCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await authAPI.sendOtp(formData.email, "FORGOT_PASSWORD");
      if (response.data?.success || response.data?.data) {
        setSuccess("OTP đã được gửi! Vui lòng kiểm tra email (hoặc console để test).");
        setStep(2);
        toast.success("OTP đã được gửi!");
        // Log OTP code for testing
        if (response.data?.data?.code) {
          console.log("🔐 OTP Code:", response.data.data.code);
        }
      } else {
        throw new Error("Failed to send OTP");
      }
    } catch (err) {
      let errorMsg = "Không thể gửi mã OTP. Vui lòng thử lại.";
      
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          errorMsg = data;
        } else if (typeof data?.message === "string") {
          errorMsg = data.message;
        } else if (Array.isArray(data?.message)) {
          errorMsg = data.message.join(", ");
        } else if (typeof data?.error === "string") {
          errorMsg = data.error;
        }
      } else if (typeof err?.message === "string") {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.verifyOtp(
        formData.email,
        formData.otpCode,
        "FORGOT_PASSWORD"
      );
      if (response.data?.success || response.data?.data) {
        setStep(3);
        toast.success("Mã OTP hợp lệ! Vui lòng nhập mật khẩu mới.");
      } else {
        throw new Error("OTP verification failed");
      }
    } catch (err) {
      let errorMsg = "Mã OTP không hợp lệ hoặc đã hết hạn.";
      
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          errorMsg = data;
        } else if (typeof data?.message === "string") {
          errorMsg = data.message;
        } else if (Array.isArray(data?.message)) {
          errorMsg = data.message.join(", ");
        } else if (typeof data?.error === "string") {
          errorMsg = data.error;
        }
      } else if (typeof err?.message === "string") {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      toast.error("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPassword({
        email: formData.email,
        code: formData.otpCode,
        newPassword: formData.newPassword,
      });

      if (response.data?.success || response.data?.data) {
        setSuccess("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
        toast.success("Đặt lại mật khẩu thành công!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        throw new Error("Password reset failed");
      }
    } catch (err) {
      let errorMsg = "Đặt lại mật khẩu thất bại. Vui lòng thử lại.";
      
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          errorMsg = data;
        } else if (typeof data?.message === "string") {
          errorMsg = data.message;
        } else if (Array.isArray(data?.message)) {
          errorMsg = data.message.join(", ");
        } else if (typeof data?.error === "string") {
          errorMsg = data.error;
        }
      } else if (typeof err?.message === "string") {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.sendOtp(formData.email, "FORGOT_PASSWORD");
      if (response.data?.success || response.data?.data) {
        toast.success("Đã gửi lại mã OTP!");
        if (response.data?.data?.code) {
          console.log("🔐 New OTP Code:", response.data.data.code);
        }
      }
    } catch (err) {
      let errorMsg = "Không thể gửi lại mã OTP.";
      
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          errorMsg = data;
        } else if (typeof data?.message === "string") {
          errorMsg = data.message;
        } else if (Array.isArray(data?.message)) {
          errorMsg = data.message.join(", ");
        } else if (typeof data?.error === "string") {
          errorMsg = data.error;
        }
      } else if (typeof err?.message === "string") {
        errorMsg = err.message;
      }
      
      toast.error(errorMsg);
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
                {step === 1 && "Nhập email để nhận mã OTP"}
                {step === 2 && "Nhập mã OTP đã gửi đến email"}
                {step === 3 && "Nhập mật khẩu mới"}
              </Typography>
            </Box>

            {/* Progress Steps */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, mb: 3, position: "relative" }}>
              {[1, 2, 3].map((s) => (
                <Box key={s} sx={{ flex: 1, position: "relative", zIndex: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: step >= s ? "primary.main" : "grey.700",
                      color: step >= s ? "white" : "grey.400",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      mx: "auto",
                      border: step >= s ? "2px solid" : "2px solid",
                      borderColor: step >= s ? "primary.main" : "grey.700",
                    }}
                  >
                    {s}
                  </Box>
                  {s < 3 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 20,
                        left: "50%",
                        width: "100%",
                        height: 2,
                        bgcolor: step > s ? "primary.main" : "grey.700",
                        zIndex: 0,
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {typeof error === "string" ? error : typeof error === "object" ? JSON.stringify(error) : String(error)}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}

            {/* Step 1: Email */}
            {step === 1 && (
              <Box component="form" onSubmit={handleSendOtp} sx={{ mt: 3 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setError("");
                  }}
                  disabled={loading}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, fontWeight: 600 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Gửi mã OTP"
                  )}
                </Button>
              </Box>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <Box component="form" onSubmit={handleVerifyOtp} sx={{ mt: 3 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Mã OTP (6 chữ số)"
                  type="text"
                  autoFocus
                  value={formData.otpCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                    setFormData({ ...formData, otpCode: value });
                    setError("");
                  }}
                  disabled={loading}
                  inputProps={{
                    style: { textAlign: "center", letterSpacing: "4px", fontSize: "18px" },
                  }}
                  helperText={`Mã OTP đã được gửi đến ${formData.email}`}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2, mb: 1, fontWeight: 600 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Xác thực OTP"
                  )}
                </Button>
                <Button
                  type="button"
                  fullWidth
                  variant="outlined"
                  onClick={handleResendOtp}
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  Gửi lại mã OTP
                </Button>
              </Box>
            )}

            {/* Step 3: Reset Password */}
            {step === 3 && (
              <Box component="form" onSubmit={handleResetPassword} sx={{ mt: 3 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Mật khẩu mới"
                  type="password"
                  autoFocus
                  value={formData.newPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, newPassword: e.target.value });
                    setError("");
                  }}
                  disabled={loading}
                  helperText="Tối thiểu 8 ký tự"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Xác nhận mật khẩu"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    setError("");
                  }}
                  disabled={loading}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, fontWeight: 600 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Đặt lại mật khẩu"
                  )}
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button
                color="primary"
                startIcon={<BackIcon />}
                onClick={() => navigate("/login")}
                sx={{ textTransform: "none" }}
              >
                Quay lại đăng nhập
              </Button>
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
