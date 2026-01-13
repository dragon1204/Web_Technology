import React, { useState } from "react";
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
} from "@mui/material";
import {
  Error as ErrorIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const [retrying, setRetrying] = useState(false);

  const handleRetryPayment = async () => {
    setRetrying(true);
    try {
      // Redirect back to payment page
      navigate(`/checkout?orderId=${orderId}`);
      toast.info("Đang chuyển hướng đến trang thanh toán...");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(244,67,54,0.15)",
          border: "2px solid #f44336",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
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
            <ErrorIcon sx={{ fontSize: 48 }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Thanh toán bị hủy
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Bạn đã hủy quá trình thanh toán
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Info */}
          <Stack spacing={2.5}>
            {orderId && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#ffebee",
                  borderRadius: 2,
                  border: "1px solid #ffcdd2",
                }}
              >
                <Typography variant="body2" sx={{ color: "#666", mb: 0.5, fontWeight: 600 }}>
                  Mã đơn hàng
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#c62828",
                    fontFamily: "monospace",
                  }}
                >
                  Order #{orderId}
                </Typography>
              </Box>
            )}

            <Divider />

            {/* Warning Alert */}
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                Đơn hàng của bạn vẫn chưa được thanh toán. Vui lòng hoàn thành thanh toán để
                xác nhận đơn hàng.
              </Typography>
            </Alert>

            {/* Info Text */}
            <Box
              sx={{
                p: 2,
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                <strong>Điều gì sẽ xảy ra tiếp theo?</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", lineHeight: 1.6 }}>
                • Đơn hàng của bạn sẽ được giữ trong 15 phút
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", lineHeight: 1.6 }}>
                • Bạn có thể thanh toán lại bất kỳ lúc nào
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", lineHeight: 1.6 }}>
                • Hãy liên hệ hỗ trợ nếu cần giúp đỡ
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<RefreshIcon />}
                onClick={handleRetryPayment}
                disabled={retrying}
                sx={{
                  bgcolor: "#f44336",
                  color: "white",
                  fontWeight: 700,
                  textTransform: "none",
                  py: 1.2,
                  "&:hover": {
                    bgcolor: "#d32f2f",
                  },
                  "&:disabled": {
                    bgcolor: "#ccc",
                  },
                }}
              >
                {retrying ? "Đang chuyển hướng..." : "Thử thanh toán lại"}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<HomeIcon />}
                onClick={() => navigate("/customer")}
                sx={{
                  borderColor: "#999",
                  color: "#666",
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#666",
                    bgcolor: "#f5f5f5",
                  },
                }}
              >
                Trang chủ
              </Button>
            </Stack>

            {/* Help Text */}
            <Typography variant="caption" sx={{ color: "#999", textAlign: "center", mt: 2 }}>
              Cần giúp đỡ? Liên hệ{" "}
              <Typography
                component="a"
                href="mailto:support@example.com"
                variant="caption"
                sx={{ color: "#4cbe00", textDecoration: "none", fontWeight: 600 }}
              >
                bộ phận hỗ trợ
              </Typography>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PaymentCancel;
