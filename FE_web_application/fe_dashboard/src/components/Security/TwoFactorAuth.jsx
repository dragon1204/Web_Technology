import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
  Avatar,
  TextField,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Chip,
} from "@mui/material";
import {
  SecurityOutlined as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  PhoneAndroid as PhoneIcon,
  Key as KeyIcon,
  QrCode2 as QrCodeIcon,
} from "@mui/icons-material";
import { authAPI } from "../../services/api";

function TwoFactorAuth() {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const navigate = useNavigate();

  const steps = ["Choose Method", "Setup", "Verify", "Save Codes"];

  // Check if 2FA is already enabled
  useEffect(() => {
    checkTwoFAStatus();
  }, []);

  const checkTwoFAStatus = async () => {
    try {
      // Assuming your backend has a method to check 2FA status
      // const response = await authAPI.getTwoFAStatus();
      // setTwoFAEnabled(response.data?.data?.enabled || false);
    } catch (err) {
      console.error("Failed to check 2FA status:", err);
    }
  };

  const handleSetupQR = async () => {
    setLoading(true);
    setError("");

    try {
      // Assuming your backend has a method to generate QR code
      // const response = await authAPI.generateTwoFAQR();
      // setQrCode(response.data?.data?.qrCode);
      // setSecret(response.data?.data?.secret);

      // Mock data for demo
      setQrCode(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAALUSURBVHic7doxbsIwEAbgv3FhYGIAhMQG3bswwMgBGBkQE0wMMMEJnCAn6EyxwMiOxMTGhJgQEiVuaRlSYkRqHBz5nn++N4nfXdx3n+V/d//PGxk="
      );
      setSecret("JBSWY3DPEBLW64TMMQ======");

      setActiveStep(1);
    } catch (err) {
      setError("Failed to generate QR code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setError("");

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      setLoading(false);
      return;
    }

    try {
      // Assuming your backend has a method to verify the code
      // const response = await authAPI.verifyTwoFACode(verificationCode, secret);
      // setBackupCodes(response.data?.data?.backupCodes || []);

      // Mock backup codes for demo
      setBackupCodes([
        "ABC123-XXXX",
        "DEF456-XXXX",
        "GHI789-XXXX",
        "JKL012-XXXX",
        "MNO345-XXXX",
        "PQR678-XXXX",
      ]);

      setActiveStep(2);
    } catch (err) {
      setError("Verification code is invalid. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBackupCodes = async () => {
    setLoading(true);
    setError("");

    try {
      // Assuming your backend has a method to confirm 2FA setup
      // await authAPI.confirmTwoFASetup(backupCodes);

      setSuccess("Two-factor authentication has been enabled successfully!");
      setTwoFAEnabled(true);
      setActiveStep(3);

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setError("Failed to save backup codes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm("Are you sure you want to disable 2FA? This reduces your account security.")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // await authAPI.disableTwoFA();
      setSuccess("Two-factor authentication has been disabled.");
      setTwoFAEnabled(false);
      setActiveStep(0);
    } catch (err) {
      setError("Failed to disable 2FA. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "90vh",
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "primary.main",
              mx: "auto",
              mb: 2,
            }}
          >
            <SecurityIcon sx={{ fontSize: 48 }} />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Two-Factor Authentication
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
            Protect your account with an extra layer of security
          </Typography>
        </Box>

        {/* Status Alert */}
        {twoFAEnabled && !error && !success && (
          <Alert severity="success" sx={{ width: "100%", mb: 3 }}>
            ✓ Two-factor authentication is enabled on your account
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ width: "100%", mb: 3 }}>
            {success}
          </Alert>
        )}

        <Card sx={{ width: "100%", maxWidth: 600, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}>
          <CardContent sx={{ p: 4 }}>
            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step 0: Choose Method */}
            {activeStep === 0 && !twoFAEnabled && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Choose Your Verification Method
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      p: 2,
                      border: "2px solid",
                      borderColor: "primary.main",
                      borderRadius: 2,
                      cursor: "pointer",
                      mb: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "primary.light",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <QrCodeIcon sx={{ fontSize: 40, color: "primary.main" }} />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Authenticator App
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Use Google Authenticator, Microsoft Authenticator, or Authy
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      border: "2px solid",
                      borderColor: "grey.300",
                      borderRadius: 2,
                      cursor: "not-allowed",
                      opacity: 0.6,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <PhoneIcon sx={{ fontSize: 40, color: "grey.400" }} />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          SMS (Coming Soon)
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Receive codes via text message
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSetupQR}
                  disabled={loading}
                  sx={{ fontWeight: 600 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Continue with Authenticator"}
                </Button>
              </Box>
            )}

            {/* Step 1: Setup QR Code */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Scan QR Code
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 3,
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 2,
                  }}
                >
                  <Box
                    component="img"
                    src={qrCode}
                    sx={{ maxWidth: 250, height: "auto" }}
                  />
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Can't scan? Enter this code manually:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      bgcolor: "grey.100",
                      p: 1,
                      borderRadius: 1,
                      wordBreak: "break-all",
                    }}
                  >
                    {secret}
                  </Typography>
                </Alert>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => setActiveStep(1.5)}
                  sx={{ fontWeight: 600 }}
                >
                  Next: Enter Code
                </Button>
              </Box>
            )}

            {/* Step 1.5: Enter Verification Code */}
            {activeStep === 1.5 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Enter Verification Code
                </Typography>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Enter the 6-digit code from your authenticator app
                </Typography>

                <TextField
                  fullWidth
                  label="6-Digit Code"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputProps={{
                    maxLength: 6,
                    style: { textAlign: "center", fontSize: 24, letterSpacing: 8 },
                  }}
                  disabled={loading}
                  sx={{ mb: 3 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleVerifyCode}
                  disabled={loading || verificationCode.length !== 6}
                  sx={{ fontWeight: 600 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Verify Code"}
                </Button>
              </Box>
            )}

            {/* Step 2: Save Backup Codes */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Save Your Backup Codes
                </Typography>

                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    ⚠️ Important: Save these backup codes in a safe place
                  </Typography>
                  <Typography variant="caption">
                    If you lose access to your authenticator app, you can use these codes
                    to regain access to your account.
                  </Typography>
                </Alert>

                <Box
                  sx={{
                    p: 3,
                    bgcolor: "grey.50",
                    borderRadius: 2,
                    mb: 3,
                    border: "1px solid",
                    borderColor: "grey.200",
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 2,
                    }}
                  >
                    {backupCodes.map((code, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          bgcolor: "white",
                          border: "1px solid",
                          borderColor: "grey.300",
                          borderRadius: 1,
                          fontFamily: "monospace",
                          fontSize: 13,
                          textAlign: "center",
                          wordBreak: "break-all",
                        }}
                      >
                        {code}
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      const text = backupCodes.join("\n");
                      navigator.clipboard.writeText(text);
                      alert("Backup codes copied to clipboard!");
                    }}
                  >
                    Copy Codes
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      const element = document.createElement("a");
                      element.setAttribute(
                        "href",
                        "data:text/plain;charset=utf-8," +
                          encodeURIComponent(backupCodes.join("\n"))
                      );
                      element.setAttribute("download", "backup-codes.txt");
                      element.style.display = "none";
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                  >
                    Download
                  </Button>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSaveBackupCodes}
                  disabled={loading}
                  sx={{ fontWeight: 600, mt: 3 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              </Box>
            )}

            {/* Step 3: Complete */}
            {activeStep === 3 && (
              <Box sx={{ textAlign: "center" }}>
                <CheckCircleIcon
                  sx={{ fontSize: 80, color: "success.main", mb: 2 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Setup Complete!
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Two-factor authentication is now enabled on your account.
                  You will be asked to enter a code when you log in next time.
                </Typography>
              </Box>
            )}

            {/* Disable 2FA Button */}
            {twoFAEnabled && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Want to disable 2FA?
                  </Typography>
                  <Button
                    color="error"
                    onClick={handleDisable2FA}
                    disabled={loading}
                  >
                    Disable Two-Factor Authentication
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default TwoFactorAuth;
