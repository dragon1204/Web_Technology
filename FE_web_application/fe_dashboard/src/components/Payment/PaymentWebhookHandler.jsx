import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  LinearProgress,
  Chip,
  Stack,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { webhookService } from "../../services/webhookService";
import { useAuth } from "../../contexts/AuthContext";

/**
 * PaymentWebhookHandler Component
 * 
 * Handles real-time payment status updates from PayOS.
 * Uses polling mechanism to check for payment status changes.
 */
const PaymentWebhookHandler = ({ orderId, onPaymentSuccess, onPaymentFailed, onPaymentCancelled }) => {
  const { token } = useAuth();
  const [status, setStatus] = useState("PENDING");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId || !token) {
      console.log("PaymentWebhookHandler: Missing orderId or token");
      return;
    }

    setIsListening(true);
    setError(null);

    // Subscribe to payment status updates
    const unsubscribe = webhookService.subscribeToPaymentUpdates(
      orderId,
      token,
      (updatedPaymentInfo) => {
        console.log("PaymentWebhookHandler: Status update received:", updatedPaymentInfo);
        setPaymentInfo(updatedPaymentInfo);
        setStatus(updatedPaymentInfo.paymentStatus);

        // Handle different payment statuses
        switch (updatedPaymentInfo.paymentStatus) {
          case "PAID":
            toast.success("✓ Thanh toán thành công!");
            if (onPaymentSuccess) {
              onPaymentSuccess(updatedPaymentInfo);
            }
            break;

          case "CANCELLED":
            toast.error("✗ Thanh toán đã bị hủy");
            if (onPaymentCancelled) {
              onPaymentCancelled(updatedPaymentInfo);
            }
            break;

          case "EXPIRED":
            toast.error("✗ Link thanh toán đã hết hạn");
            if (onPaymentFailed) {
              onPaymentFailed(updatedPaymentInfo);
            }
            break;

          default:
            break;
        }
      }
    );

    return () => {
      console.log("PaymentWebhookHandler: Cleaning up subscription");
      if (unsubscribe) {
        unsubscribe();
      }
      setIsListening(false);
    };
  }, [orderId, token, onPaymentSuccess, onPaymentFailed, onPaymentCancelled]);

  const getStatusIcon = () => {
    switch (status) {
      case "PAID":
        return <CheckCircleIcon sx={{ color: "#4caf50" }} />;
      case "CANCELLED":
        return <ErrorIcon sx={{ color: "#f44336" }} />;
      case "EXPIRED":
        return <WarningIcon sx={{ color: "#ff9800" }} />;
      case "PENDING":
      default:
        return <ScheduleIcon sx={{ color: "#2196f3" }} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "PAID":
        return "#4caf50";
      case "CANCELLED":
        return "#f44336";
      case "EXPIRED":
        return "#ff9800";
      case "PENDING":
      default:
        return "#2196f3";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "PAID":
        return "Đã thanh toán";
      case "CANCELLED":
        return "Hủy thanh toán";
      case "EXPIRED":
        return "Hết hạn";
      case "PENDING":
      default:
        return "Đang chờ thanh toán";
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Status Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {getStatusIcon()}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Trạng thái thanh toán
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {isListening ? "Đang theo dõi..." : "Chưa kết nối"}
              </Typography>
            </Box>
            <Chip
              label={getStatusLabel()}
              sx={{
                backgroundColor: getStatusColor(),
                color: "white",
                fontWeight: 600,
              }}
            />
          </Box>

          {/* Progress Bar for Pending Status */}
          {status === "PENDING" && <LinearProgress sx={{ height: 4, borderRadius: 2 }} />}

          {/* Payment Info */}
          {paymentInfo && (
            <Box sx={{ p: 1.5, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="textSecondary">
                    Mã đơn hàng:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {paymentInfo.orderNumber}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="textSecondary">
                    Số tiền:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {paymentInfo.total?.toLocaleString("vi-VN")} VNĐ
                  </Typography>
                </Box>

                {paymentInfo.paidAt && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="textSecondary">
                      Thời gian thanh toán:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {new Date(paymentInfo.paidAt).toLocaleString("vi-VN")}
                    </Typography>
                  </Box>
                )}

                {paymentInfo.paymentMethod && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="textSecondary">
                      Phương thức:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {paymentInfo.paymentMethod}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error">
              <Typography variant="body2">{error}</Typography>
            </Alert>
          )}

          {/* Status Messages */}
          {status === "PENDING" && (
            <Alert severity="info">
              <Typography variant="body2">
                Đang chờ xác nhận thanh toán từ PayOS. Vui lòng không đóng trang này.
              </Typography>
            </Alert>
          )}

          {status === "CANCELLED" && (
            <Alert severity="warning">
              <Typography variant="body2">
                Thanh toán đã bị hủy. Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ.
              </Typography>
            </Alert>
          )}

          {status === "EXPIRED" && (
            <Alert severity="error">
              <Typography variant="body2">
                Link thanh toán đã hết hạn. Vui lòng tạo yêu cầu thanh toán mới.
              </Typography>
            </Alert>
          )}

          {status === "PAID" && (
            <Alert severity="success">
              <Typography variant="body2">
                ✓ Thanh toán thành công! Cảm ơn bạn đã mua hàng.
              </Typography>
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PaymentWebhookHandler;
