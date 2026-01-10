import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Lấy token từ URL params (nếu backend redirect với token)
        const token = searchParams.get("token");
        const user = searchParams.get("user");
        const errorParam = searchParams.get("error");

        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setLoading(false);
          return;
        }

        if (token && user) {
          // Lưu token và user info
          localStorage.setItem("token", token);
          localStorage.setItem("user", decodeURIComponent(user));

          // Redirect to dashboard
          navigate("/dashboard");
        } else {
          // Nếu không có token trong URL, có thể backend đã set cookie
          // hoặc cần gọi API để lấy thông tin user
          const response = await fetch("/auth/profile", {
            credentials: "include", // Include cookies
          });

          if (response.ok) {
            const userData = await response.json();
            localStorage.setItem("user", JSON.stringify(userData));
            navigate("/dashboard");
          } else {
            setError("Failed to authenticate with Google");
          }
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError("Authentication failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Completing Google Sign-In...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we verify your account
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
        px={3}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Authentication Failed
          </Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
        <Typography
          variant="body2"
          color="primary"
          sx={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => navigate("/login")}
        >
          Return to Login
        </Typography>
      </Box>
    );
  }

  return null;
};

export default OAuthCallback;
