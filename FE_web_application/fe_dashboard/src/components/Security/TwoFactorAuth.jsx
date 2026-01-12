import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
  TextField,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Chip,
  Stack,
  Grid,
  Avatar,
  Paper,
} from "@mui/material";
import {
  SecurityOutlined as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  QrCode2 as QrCodeIcon,
  Shield as ShieldIcon,
  CloudDownload as DownloadIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  PowerSettingsNew as PowerIcon,
} from "@mui/icons-material";
import { authService } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";

const STEPS = ["Chọn phương thức", "Quét mã", "Nhập mã", "Lưu mã dự phòng"];

const TwoFactorAuth = () => {
  const { user, setUser } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);

  const isDarkHeader = true;

  const statusColor = useMemo(
    () => (isEnabled ? "success" : "warning"),
    [isEnabled]
  );

  useEffect(() => {
    setIsEnabled(Boolean(user?.isTwoFactorEnabled));
  }, [user]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleGenerate = async () => {
    try {
      clearMessages();
      setLoading(true);
      const { data } = await authService.generate2FA();
      if (data?.secret) setSecret(data.secret);
      if (data?.otpauthUrl) {
        const blob = await authService.get2FAQRCode(data.otpauthUrl);
        const url = URL.createObjectURL(blob);
        setQrCodeUrl(url);
      }
      setActiveStep(1);
    } catch (err) {
      setError(err.message || "Không thể tạo QR code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số");
      return;
    }
    try {
      clearMessages();
      setLoading(true);
      const response = await authService.enable2FA(totpCode);
      // Nếu backend trả backup codes thì lấy, nếu không thì để trống
      const codes = response?.data?.backupCodes || [];
      setBackupCodes(codes);
      setIsEnabled(true);
      setSuccess("Đã bật xác thực 2 bước thành công");
      setActiveStep(codes.length ? 3 : 3);
      // Cập nhật user local
      if (user) {
        const updated = { ...user, isTwoFactorEnabled: true };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      }
    } catch (err) {
      setError(err.message || "Mã xác thực không đúng");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    const ok = window.confirm("Bạn có chắc muốn tắt 2FA? Điều này giảm bảo mật tài khoản.");
    if (!ok) return;
    try {
      clearMessages();
      setLoading(true);
      await authService.disable2FA();
      setIsEnabled(false);
      setSuccess("Đã tắt xác thực 2 bước");
      setActiveStep(0);
      if (user) {
        const updated = { ...user, isTwoFactorEnabled: false };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      }
    } catch (err) {
      setError(err.message || "Không thể tắt 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBackup = () => {
    if (!backupCodes.length) return;
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setSuccess("Đã copy mã dự phòng");
  };

  const handleDownloadBackup = () => {
    if (!backupCodes.length) return;
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(backupCodes.join("\n"))
    );
    element.setAttribute("download", "backup-codes.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const resetFlow = () => {
    clearMessages();
    setQrCodeUrl("");
    setSecret("");
    setTotpCode("");
    setBackupCodes([]);
    setActiveStep(0);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1080, mx: "auto" }}>
      {/* Hero */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #102216 0%, #1a3a3a 60%, #4cbe00 120%)",
          color: "#fff",
          boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="center">
            <Avatar
              sx={{
                width: 76,
                height: 76,
                bgcolor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <ShieldIcon sx={{ fontSize: 40, color: "#fff" }} />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff" }}>
                Xác thực 2 bước (2FA)
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.75)", mt: 0.5 }}>
                Bảo vệ tài khoản bằng mã TOTP từ ứng dụng Authenticator (Google, Authy,...)
              </Typography>
            </Box>
            <Chip
              label={isEnabled ? "Đã bật" : "Chưa bật"}
              color={statusColor}
              variant="filled"
              sx={{
                fontWeight: 700,
                backgroundColor: isEnabled ? "#22c55e" : "#f59e0b",
                color: "#fff",
                px: 1.5,
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        {error && (
          <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess("")}>{success}</Alert>
        )}
      </Stack>

      <Grid container spacing={3}>
        {/* Left: Steps & actions */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                {STEPS.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Step 0 */}
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Chọn phương thức
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#444", mb: 3 }}>
                    Sử dụng ứng dụng Authenticator để tạo mã 6 chữ số đổi mỗi 30 giây.
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderColor: "#4cbe00",
                      backgroundColor: "#f7fbf4",
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                    }}
                  >
                    <QrCodeIcon sx={{ fontSize: 42, color: "#4cbe00" }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Ứng dụng Authenticator
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#4d4d4d" }}>
                        Hỗ trợ Google Authenticator, Microsoft Authenticator, Authy...
                      </Typography>
                    </Box>
                  </Paper>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={loading ? null : <RefreshIcon />}
                    onClick={handleGenerate}
                    disabled={loading}
                    sx={{ mt: 3, fontWeight: 700, textTransform: "none" }}
                  >
                    {loading ? <CircularProgress size={22} color="inherit" /> : "Bắt đầu thiết lập"}
                  </Button>
                </Box>
              )}

              {/* Step 1 */}
              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Quét mã QR
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#4d4d4d", mb: 2 }}>
                    Mở ứng dụng Authenticator và quét mã dưới đây.
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mb: 3,
                      p: 2,
                      backgroundColor: "#f8fafc",
                      borderRadius: 2,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {qrCodeUrl ? (
                      <Box component="img" src={qrCodeUrl} sx={{ maxWidth: 240, height: "auto" }} />
                    ) : (
                      <Typography>Đang tải QR...</Typography>
                    )}
                  </Box>
                  {secret && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                        Không quét được? Nhập thủ công:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "monospace",
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: "#f1f5f9",
                          color: "#0f172a",
                          wordBreak: "break-all",
                        }}
                      >
                        {secret}
                      </Typography>
                    </Alert>
                  )}
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => setActiveStep(2)}
                    sx={{ fontWeight: 700, textTransform: "none" }}
                  >
                    Tiếp tục: Nhập mã
                  </Button>
                </Box>
              )}

              {/* Step 2 */}
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Nhập mã 6 chữ số
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#4d4d4d", mb: 3 }}>
                    Lấy mã từ ứng dụng Authenticator, nhập đủ 6 số.
                  </Typography>

                  <TextField
                    fullWidth
                    label="Mã TOTP"
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) =>
                      setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
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
                    onClick={handleVerify}
                    disabled={loading || totpCode.length !== 6}
                    sx={{ fontWeight: 700, textTransform: "none" }}
                  >
                    {loading ? <CircularProgress size={22} color="inherit" /> : "Xác nhận & bật 2FA"}
                  </Button>
                </Box>
              )}

              {/* Step 3: Backup codes (optional) */}
              {activeStep === 3 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Lưu mã dự phòng
                  </Typography>
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    Nếu mất điện thoại, bạn dùng các mã này để đăng nhập. Lưu chúng ở nơi an toàn.
                  </Alert>

                  {backupCodes.length > 0 ? (
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: "#f8fafc",
                        borderRadius: 2,
                        border: "1px solid #e2e8f0",
                        mb: 2,
                      }}
                    >
                      <Grid container spacing={1.5}>
                        {backupCodes.map((code, idx) => (
                          <Grid item xs={12} sm={6} key={idx}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                border: "1px dashed #cbd5e1",
                                borderRadius: 1,
                                textAlign: "center",
                                fontFamily: "monospace",
                                fontWeight: 700,
                                color: "#0f172a",
                              }}
                            >
                              {code}
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<CopyIcon />}
                          onClick={handleCopyBackup}
                        >
                          Copy
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={handleDownloadBackup}
                        >
                          Tải txt
                        </Button>
                      </Stack>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: "#4d4d4d" }}>
                      Không nhận được mã dự phòng từ backend.
                    </Typography>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => setActiveStep(3)}
                    sx={{ fontWeight: 700, textTransform: "none", mt: 2 }}
                  >
                    Hoàn tất
                  </Button>
                </Box>
              )}

              {/* Enabled state action */}
              {isEnabled && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      2FA đang bật
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#4d4d4d" }}>
                      Bạn sẽ cần mã TOTP khi đăng nhập. Chỉ tắt 2FA khi thực sự cần thiết.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<PowerIcon />}
                      onClick={handleDisable}
                      disabled={loading}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      Tắt xác thực 2 bước
                    </Button>
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right: tips */}
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                  <SecurityIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Lưu ý bảo mật
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: "#4d4d4d", mb: 1 }}>
                  • Không chia sẻ secret hoặc mã dự phòng.
                </Typography>
                <Typography variant="body2" sx={{ color: "#4d4d4d", mb: 1 }}>
                  • Sao lưu mã dự phòng ở nơi an toàn (password manager).
                </Typography>
                <Typography variant="body2" sx={{ color: "#4d4d4d", mb: 1 }}>
                  • Mã TOTP thay đổi mỗi 30 giây; nhập mã mới nhất.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Khi nào cần 2FA?
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: "#4d4d4d", mb: 1 }}>
                  • Đăng nhập từ thiết bị mới hoặc lạ.
                </Typography>
                <Typography variant="body2" sx={{ color: "#4d4d4d", mb: 1 }}>
                  • Thao tác thay đổi bảo mật quan trọng.
                </Typography>
                <Typography variant="body2" sx={{ color: "#4d4d4d" }}>
                  • Khi nghi ngờ tài khoản bị xâm nhập.
                </Typography>
              </CardContent>
            </Card>

            {!isEnabled && (
              <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#f7fbf4" }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    Chưa bật 2FA?
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#4d4d4d", mb: 2 }}>
                    Chỉ mất khoảng 1 phút để tăng gấp đôi lớp bảo vệ.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleGenerate}
                    disabled={loading}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    Bắt đầu ngay
                  </Button>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* Footer actions */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={resetFlow} disabled={loading} sx={{ textTransform: "none" }}>
          Làm mới quy trình
        </Button>
        {activeStep > 0 && activeStep < 2 && (
          <Button
            variant="text"
            onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
            disabled={loading}
            sx={{ textTransform: "none" }}
          >
            Quay lại
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default TwoFactorAuth;
