import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { authAPI } from "../../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(window.atob(base64));
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("=== BẮT ĐẦU ĐĂNG NHẬP ===");
      const response = await authAPI.login(email, password);

      console.log("Dữ liệu login trả về:", response.data);

      const resData = response.data?.data || response.data;
      const token = resData.access_token || resData.token;

      if (!token) throw new Error("Server không trả về token!");
      localStorage.setItem("token", token);

      let userData = resData.user || resData.userData;

      if (!userData) {
        console.log("🔡 Login ko có user info, đang giải mã Token...");
        const decoded = decodeToken(token);
        if (decoded) {
          console.log("Dữ liệu từ Token:", decoded);
          userData = {
            id: decoded.id || decoded.sub,
            email: decoded.email || email,
            role: decoded.role || decoded.roles?.[0] || "USER",
          };
        }
      }

      if (!userData) {
        userData = { id: "unknown", email: email, role: "USER" };
      }

      const userToSave = {
        id: userData.id,
        username: userData.username || userData.name || email.split("@")[0],
        email: userData.email || email,
        role: String(userData.role).toUpperCase(),
      };

      console.log("✅ Thông tin User cuối cùng:", userToSave);
      localStorage.setItem("user", JSON.stringify(userToSave));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("❌ Login Error:", err);
      localStorage.clear();
      let msg = err.response?.data?.message || err.message;
      setError(typeof msg === "object" ? msg.message || "Lỗi đăng nhập" : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 121, 218, 0.3), transparent 50%)",
        },
      }}
    >
      <Container component="main" maxWidth="xs" sx={{ position: "relative" }}>
        <Box
          sx={{
            mt: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Logo & Title */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 4,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              }}
            >
              🌱
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: "white", letterSpacing: "-1px" }}
              >
                Smart Garden
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.9)" }}
              >
                Manager View
              </Typography>
            </Box>
          </Box>

          {/* Login Card */}
          <Card
            sx={{
              width: "100%",
              borderRadius: 4,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              bgcolor: "#1e293b",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Box sx={{ p: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  color: "white",
                  textAlign: "center",
                }}
              >
                Welcome back
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#94a3b8",
                  textAlign: "center",
                  mb: 3,
                }}
              >
                Please enter your credentials to access the management
                dashboard.
              </Typography>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    bgcolor: "rgba(239, 68, 68, 0.1)",
                    color: "#fca5a5",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    "& .MuiAlert-icon": { color: "#f87171" },
                  }}
                >
                  {String(error)}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#94a3b8",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    mb: 1,
                    display: "block",
                  }}
                >
                  Username
                </Typography>
                <TextField
                  required
                  fullWidth
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "#64748b" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#0f172a",
                      color: "white",
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: "#334155",
                      },
                      "&:hover fieldset": {
                        borderColor: "#475569",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: "white",
                    },
                  }}
                />

                <Typography
                  variant="caption"
                  sx={{
                    color: "#94a3b8",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    mb: 1,
                    display: "block",
                  }}
                >
                  Password
                </Typography>
                <TextField
                  required
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "#64748b" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: "#64748b" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#0f172a",
                      color: "white",
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: "#334155",
                      },
                      "&:hover fieldset": {
                        borderColor: "#475569",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#22c55e",
                      cursor: "pointer",
                      fontWeight: 600,
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Forgot password?
                  </Typography>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: "1rem",
                    borderRadius: 2,
                    textTransform: "none",
                    background:
                      "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    boxShadow: "0 10px 30px rgba(34, 197, 94, 0.3)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                      boxShadow: "0 15px 40px rgba(34, 197, 94, 0.4)",
                    },
                    "&:disabled": {
                      background: "#334155",
                      color: "#64748b",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: "center",
                  color: "#64748b",
                  mt: 3,
                }}
              >
                © 2025 Smart Garden Corp. System Access Only
              </Typography>
            </Box>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}

export default Login;
