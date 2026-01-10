import React from "react";
import { Button, Box, Typography } from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";

const GoogleLogin = ({ onSuccess, onError, disabled = false }) => {
  const handleGoogleLogin = () => {
    try {
      // Redirect to backend Google OAuth endpoint
      const backendUrl =
        process.env.REACT_APP_API_URL || "http://159.223.61.25:3000";
      window.location.href = `${backendUrl}/auth/google`;
    } catch (error) {
      console.error("Error initiating Google login:", error);
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Button
        fullWidth
        variant="outlined"
        onClick={handleGoogleLogin}
        disabled={disabled}
        startIcon={<GoogleIcon />}
        sx={{
          py: 1.5,
          borderColor: "#dadce0",
          color: "#3c4043",
          textTransform: "none",
          fontSize: "14px",
          fontWeight: 500,
          "&:hover": {
            borderColor: "#dadce0",
            backgroundColor: "#f8f9fa",
          },
          "&:disabled": {
            borderColor: "#dadce0",
            color: "#9aa0a6",
          },
        }}
      >
        <Typography variant="body2" sx={{ ml: 1 }}>
          Continue with Google
        </Typography>
      </Button>
    </Box>
  );
};

export default GoogleLogin;
