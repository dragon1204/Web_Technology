import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
  Avatar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  ShoppingBag as ShoppingBagIcon,
} from "@mui/icons-material";
import { paymentService } from "../../services/paymentService";
import toast from "react-hot-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("Không tìm thấy mã đơn hàng");
      setLoading(false);
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const result = await paymentService.getPaymentStatus(orderId);
        console.log("PaymentSuccess: Full API response:", result);
        
        // Handle nested response format (data.data.order)
        const order = result.data?.data?.order || result.data?.order;
        const paymentInfo = result.data?.data?.paymentInfo || result.data?.paymentInfo;

        console.log("PaymentSuccess: Checking payment status:", { order, paymentInfo });
        
        // Check paymentInfo.status first (most accurate from PayOS)
        // If paymentInfo.status is PAID, consider payment successful even if order.paymentStatus is EXPIRED
        const paymentInfoStatus = paymentInfo?.status;
        const orderPaymentStatus = order?.paymentStatus;
        const orderStatus = order?.status;
        
        // Determine actual payment status: prefer paymentInfo.status if it's PAID
        // Consider paid if:
        // 1. paymentInfo.status is PAID
        // 2. OR order.paymentStatus is PAID
        // 3. OR order.status is CONFIRMED (indicates payment was processed)
        const isPaid = paymentInfoStatus === "PAID" || 
                      orderPaymentStatus === "PAID" ||
                      orderStatus === "CONFIRMED" ||
                      (paymentInfoStatus === "PAID" && paymentInfo?.amountPaid >= paymentInfo?.amount);
        
        console.log("PaymentSuccess: Payment check result:", {
          paymentInfoStatus,
          orderPaymentStatus,
          orderStatus,
          isPaid,
        });

        if (isPaid) {
          setOrderData(order);
          toast.success("Thanh toán thành công!");
        } else if (orderPaymentStatus === "PENDING" || paymentInfoStatus === "PENDING") {
          setError("Thanh toán vẫn đang xử lý. Vui lòng chờ...");
        } else {
          setError("Thanh toán không thành công");
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
        setError(err.message || "Lỗi khi kiểm tra trạng thái thanh toán");
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [orderId]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress size={48} sx={{ color: "#4cbe00", mb: 2 }} />
        <Typography variant="h6" sx={{ color: "#666" }}>
          Đang kiểm tra trạng thái thanh toán...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(76,190,0,0.15)",
          border: "2px solid #4cbe00",
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
              width: 80,
              height: 80,
              margin: "0 auto",
              mb: 2,
              bgcolor: "rgba(255,255,255,0.2)",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48 }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Thanh toán thành công!
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Đơn hàng của bạn đã được xác nhận
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {orderData && (
            <Stack spacing={2.5}>
              {/* Order Info */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#f5f9f5",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Typography variant="body2" sx={{ color: "#666", mb: 0.5, fontWeight: 600 }}>
                  Mã đơn hàng
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#102216",
                    fontFamily: "monospace",
                  }}
                >
                  {orderData.orderNumber || `Order #${orderId}`}
                </Typography>
              </Box>

              {/* Status Info */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ color: "#666", mb: 0.5, fontWeight: 600 }}>
                      Trạng thái đơn hàng
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#102216", fontWeight: 600 }}>
                      {orderData.status || "CONFIRMED"}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: "#4cbe00",
                    }}
                  >
                    <ShoppingBagIcon />
                  </Avatar>
                </Stack>
              </Box>

              <Divider />

              {/* Amount */}
              <Box>
                <Typography variant="body2" sx={{ color: "#666", mb: 0.5, fontWeight: 600 }}>
                  Số tiền đã thanh toán
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#4cbe00",
                    fontWeight: 700,
                  }}
                >
                  {(orderData.total || 0).toLocaleString("vi-VN")} VNĐ
                </Typography>
              </Box>

              {/* Paid Date */}
              {orderData.paidAt && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="body2" sx={{ color: "#666", mb: 0.5, fontWeight: 600 }}>
                      Thời gian thanh toán
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#102216" }}>
                      {new Date(orderData.paidAt).toLocaleString("vi-VN")}
                    </Typography>
                  </Box>
                </>
              )}

              {/* Info Alert */}
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                <Typography variant="body2">
                  Cảm ơn bạn đã mua hàng! Bạn sẽ nhận được email xác nhận.
                </Typography>
              </Alert>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<ShoppingBagIcon />}
                  onClick={() => navigate(`/customer/orders/${orderId}`)}
                  sx={{
                    bgcolor: "#4cbe00",
                    color: "white",
                    fontWeight: 700,
                    textTransform: "none",
                    py: 1.2,
                    "&:hover": {
                      bgcolor: "#3da000",
                    },
                  }}
                >
                  Xem chi tiết đơn hàng
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<HomeIcon />}
                  onClick={() => navigate("/customer")}
                  sx={{
                    borderColor: "#4cbe00",
                    color: "#4cbe00",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#3da000",
                      bgcolor: "rgba(76,190,0,0.05)",
                    },
                  }}
                >
                  Trang chủ
                </Button>
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default PaymentSuccess;
