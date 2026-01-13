import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Paper,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Grid,
  Chip,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Payment as PaymentIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { paymentService } from "../../services/paymentService";
import toast from "react-hot-toast";

const PaymentCheckout = ({ orderId, orderNumber, totalAmount, onPaymentSuccess, onCancel }) => {
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pollingActive, setPollingActive] = useState(false);

  // Helper: build QR image src
  const getQrImageSrc = (qrCodeValue) => {
    if (!qrCodeValue) return null;
    // If backend returns a data URI or base64 image, keep as is
    if (qrCodeValue.startsWith('data:')) return qrCodeValue;
    // PayOS trả về chuỗi QR (EMV) -> dùng dịch vụ QR server để hiển thị
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrCodeValue)}`;
  };

  // Create payment link
  const handleCreatePayment = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const returnUrl = `${window.location.origin}/payment/success?orderId=${orderId}`;
      const cancelUrl = `${window.location.origin}/payment/cancel?orderId=${orderId}`;

      const result = await paymentService.createPayment(orderId, returnUrl, cancelUrl);

      console.log('Payment result:', result);

      // Handle different response formats (flatten deep nesting)
      const outer = result?.data || result; // {HttpCode, success, data, ...} hoặc raw data
      const core = outer?.data || outer;    // {order, paymentInfo, ...} nếu lồng thêm một tầng

      if (!core) {
        throw new Error('Không nhận được dữ liệu thanh toán từ server');
      }

      // Extract order & paymentInfo
      const order = core.order || core.data?.order;
      const paymentInfo = core.paymentInfo || core.data?.paymentInfo;

      // Prefer QR in order (paymentQrCode), fallback to paymentInfo.qrCode
      const qrCodeValue =
        core.qrCode ||
        core.paymentQrCode ||
        order?.paymentQrCode ||
        paymentInfo?.qrCode;

      const qrImage = getQrImageSrc(qrCodeValue);

      // Bank info (may be absent)
      const accountNumber =
        core.accountNumber || order?.accountNumber || paymentInfo?.accountNumber || null;
      const accountName =
        core.accountName || order?.accountName || paymentInfo?.accountName || null;
      const bin =
        core.bin || order?.bin || paymentInfo?.bin || null;

      const mapped = {
        orderId: order?.id,
        orderNumber: order?.orderNumber,
        amount: order?.total || paymentInfo?.amount,
        paymentStatus: order?.paymentStatus || paymentInfo?.status,
        paymentMethod: order?.paymentMethod,
        paymentLink: order?.paymentLink || paymentInfo?.checkoutUrl,
        paymentQrCode: qrCodeValue,
        qrCode: qrCodeValue,
        qrImage,
        accountNumber,
        accountName,
        bin,
      };

      console.log('Setting payment data (flattened):', mapped, 'raw:', core);

      setPaymentData(mapped);
      setPaymentStatus(mapped.paymentStatus || "PENDING");
      setPollingActive(true);
      toast.success("Tạo liên kết thanh toán thành công!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Polling for payment status
  useEffect(() => {
    if (!pollingActive || !orderId) return;

    const interval = setInterval(async () => {
      try {
        const result = await paymentService.getPaymentStatus(orderId);
        const status = result.data?.order?.paymentStatus;

        setPaymentStatus(status);

        if (status === "PAID") {
          setPollingActive(false);
          clearInterval(interval);
          toast.success("Thanh toán thành công!");
          onPaymentSuccess?.();
        } else if (status === "CANCELLED" || status === "EXPIRED") {
          setPollingActive(false);
          clearInterval(interval);
          toast.error(`Thanh toán đã ${status === "CANCELLED" ? "bị hủy" : "hết hạn"}`);
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [pollingActive, orderId, onPaymentSuccess]);

  const handleCopyAccountNumber = (accountNumber) => {
    navigator.clipboard.writeText(accountNumber);
    toast.success("Đã sao chép số tài khoản!");
  };

  // Before payment
  if (!paymentData) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #4cbe00 0%, #3da000 100%)",
              color: "white",
              p: 3,
              textAlign: "center",
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                margin: "0 auto",
                mb: 2,
                bgcolor: "rgba(255,255,255,0.2)",
              }}
            >
              <PaymentIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Thanh toán đơn hàng
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Sử dụng PayOS để thanh toán an toàn
            </Typography>
          </Box>

          <CardContent sx={{ p: 3 }}>
            {/* Order Info */}
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#f5f9f5",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Typography variant="body2" sx={{ color: "#666", mb: 0.5 }}>
                  Mã đơn hàng
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#102216" }}>
                  {orderNumber || `Order #${orderId}`}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  bgcolor: "#f5f9f5",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Typography variant="body2" sx={{ color: "#666", mb: 0.5 }}>
                  Số tiền thanh toán
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "#4cbe00",
                  }}
                >
                  {(totalAmount || 0).toLocaleString("vi-VN")} VNĐ
                </Typography>
              </Box>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            {/* Info Alert */}
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }} icon={<InfoIcon />}>
              Nhấn nút "Tạo mã thanh toán" để bắt đầu quá trình thanh toán
            </Alert>

            {/* Action Button */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCreatePayment}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
              sx={{
                bgcolor: "#4cbe00",
                color: "white",
                fontWeight: 700,
                textTransform: "none",
                fontSize: "16px",
                py: 1.5,
                "&:hover": {
                  bgcolor: "#3da000",
                },
                "&:disabled": {
                  bgcolor: "#ccc",
                },
              }}
            >
              {loading ? "Đang tạo mã thanh toán..." : "Tạo mã thanh toán"}
            </Button>

            {onCancel && (
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={onCancel}
                sx={{
                  mt: 1.5,
                  borderColor: "#ddd",
                  color: "#666",
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#999",
                    bgcolor: "#f5f5f5",
                  },
                }}
              >
                Hủy
              </Button>
            )}
          </CardContent>
        </Card>
      </Container>
    );
  }

  // After payment link created
  const statusMeta = {
    PENDING: { label: 'Đang chờ thanh toán', color: 'warning', icon: <RefreshIcon /> },
    PAID: { label: 'Đã thanh toán', color: 'success', icon: <CheckCircleIcon /> },
    CANCELLED: { label: 'Đã hủy', color: 'error', icon: <ErrorIcon /> },
    EXPIRED: { label: 'Hết hạn', color: 'default', icon: <ErrorIcon /> },
  }[paymentStatus] || { label: paymentStatus, color: 'default', icon: <RefreshIcon /> };

  const amountDisplay = (paymentData?.amount || totalAmount || 0).toLocaleString('vi-VN');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Stack spacing={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 12px 35px rgba(15,59,42,0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                  <Stack spacing={1}>
                    <Typography variant="overline" sx={{ color: '#7a7a7a', letterSpacing: 1 }}>
                      MÃ ĐƠN HÀNG
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {paymentData?.orderNumber || orderNumber || `Order #${orderId}`}
                    </Typography>
                  </Stack>
                  <Chip
                    icon={statusMeta.icon}
                    color={statusMeta.color}
                    label={statusMeta.label}
                    sx={{ fontWeight: 600, alignSelf: 'flex-start' }}
                  />
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'rgba(76,190,0,0.08)',
                        border: '1px solid rgba(76,190,0,0.2)',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#4A4A4A', mb: 0.5 }}>
                        Số tiền cần thanh toán
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#2f7d32' }}>
                        {amountDisplay} VNĐ
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" sx={{ color: '#4A4A4A', mb: 0.5 }}>
                        Liên kết thanh toán
                      </Typography>
                      <Button
                        fullWidth
                        variant="outlined"
                        endIcon={<OpenInNewIcon />}
                        onClick={() => paymentData?.paymentLink && window.open(paymentData.paymentLink, '_blank')}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Mở PayOS Checkout
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ color: '#4A4A4A' }}>
                    Ghi chú
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
                    Quét QR hoặc mở link PayOS để hoàn tất thanh toán. Hệ thống sẽ tự động cập nhật
                    trạng thái và thông báo cho bạn cũng như chủ shop.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, boxShadow: '0 12px 35px rgba(15,59,42,0.06)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Thông tin chuyển khoản
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      Số tài khoản
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                        {paymentData?.accountNumber || '—'}
                      </Typography>
                      {paymentData?.accountNumber && (
                        <Tooltip title="Sao chép">
                          <IconButton size="small" onClick={() => handleCopyAccountNumber(paymentData.accountNumber)}>
                            <ContentCopyIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      Chủ tài khoản
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {paymentData?.accountName || '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      Ngân hàng
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {paymentData?.bin || '—'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {paymentStatus === 'PENDING' && (
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Đang đợi thanh toán
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#777' }}>
                        Hệ thống sẽ tự động cập nhật sau khi PayOS xác nhận giao dịch thành công.
                      </Typography>
                    </Stack>
                    <CircularProgress size={40} sx={{ color: '#4cbe00' }} />
                  </Stack>
                </CardContent>
              </Card>
            )}

            {paymentStatus === 'PAID' && (
              <Card
                sx={{
                  borderRadius: 3,
                  border: '1px solid rgba(76,190,0,0.4)',
                  boxShadow: '0 8px 25px rgba(76,190,0,0.15)',
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: '#4cbe00', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#2f7d32' }}>
                    Thanh toán thành công!
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                    Cảm ơn bạn đã sử dụng dịch vụ. Chúng tôi đã gửi thông báo xác nhận đến bạn và chủ shop.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 20px 45px rgba(15,59,42,0.18)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #39b385 0%, #2f8f6b 100%)',
                color: 'white',
                p: 3,
                textAlign: 'center',
              }}
            >
              <QrCodeIcon sx={{ fontSize: 34, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Quét mã QR để thanh toán
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Sử dụng app ngân hàng hoặc ví điện tử để hoàn tất giao dịch
              </Typography>
            </Box>

            <CardContent
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                minHeight: 420,
              }}
            >
              {paymentData?.qrImage ? (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: '2px solid rgba(47,125,50,0.2)',
                    bgcolor: '#fdfdf3',
                  }}
                >
                  <img
                    src={paymentData.qrImage}
                    alt="QR Code"
                    style={{ width: 240, height: 240, borderRadius: 12 }}
                    onError={(e) => {
                      console.error('QR Code image error:', e);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </Box>
              ) : (
                <Stack
                  spacing={2}
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    width: '100%',
                    height: 260,
                    borderRadius: 3,
                    border: '1px dashed #c2c2c2',
                    bgcolor: '#fafafa',
                  }}
                >
                  <CircularProgress size={36} />
                  <Typography variant="body2" sx={{ color: '#777' }}>
                    Đang tạo mã QR...
                  </Typography>
                </Stack>
              )}

              <Stack spacing={1} alignItems="center" sx={{ width: '100%' }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Hạn thanh toán
                </Typography>
                <Chip
                  label="15 phút kể từ khi tạo"
                  color="warning"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>

              <Alert severity="info" sx={{ width: '100%', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ color: '#1f5c3d' }}>
                  Sau khi thanh toán thành công, bạn sẽ nhận được thông báo ngay lập tức.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PaymentCheckout;
