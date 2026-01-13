/**
 * Complete Payment & Webhook Integration Example
 * 
 * This file demonstrates how to fully integrate payment processing
 * with webhook handling in your checkout flow.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Step,
  Stepper,
  StepLabel,
  Alert,
  Stack,
} from "@mui/material";
import toast from "react-hot-toast";
import {
  PaymentCheckout,
  PaymentWebhookHandler,
} from "../components/Payment";
import { useAuth } from "../contexts/AuthContext";
import { orderService } from "../services/orderService";

/**
 * Complete Payment Flow Example
 * 
 * Steps:
 * 1. Verify order exists
 * 2. Display payment options (QR/Link)
 * 3. Handle real-time payment status
 * 4. Redirect on success/failure
 */
const PaymentFlowExample = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  // State management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0); // 0: Loading, 1: Payment, 2: Confirming
  const [paymentStatus, setPaymentStatus] = useState("PENDING");

  // Load order data
  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrderDetail(orderId, token);
        
        if (!response.data) {
          throw new Error("Không tìm thấy đơn hàng");
        }

        const orderData = response.data;

        // Check if order is already paid
        if (orderData.paymentStatus === "PAID") {
          toast.success("Đơn hàng đã được thanh toán");
          navigate(`/orders/${orderId}`);
          return;
        }

        setOrder(orderData);
        setStep(1); // Move to payment step
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId && token) {
      loadOrder();
    }
  }, [orderId, token, navigate]);

  // Handle payment success callback
  const handlePaymentSuccess = async (paymentInfo) => {
    console.log("Payment successful:", paymentInfo);
    
    setStep(2); // Move to confirmation step
    setPaymentStatus("PAID");

    // Update local order state
    setOrder((prev) => ({
      ...prev,
      paymentStatus: "PAID",
      paidAt: paymentInfo.paidAt,
    }));

    // Optional: Fetch updated order from backend
    try {
      const response = await orderService.getOrderDetail(orderId, token);
      setOrder(response.data);
    } catch (err) {
      console.error("Error refreshing order:", err);
    }

    // Redirect after 2 seconds
    setTimeout(() => {
      navigate(`/payment/success?orderId=${orderId}`);
    }, 2000);
  };

  // Handle payment cancellation
  const handlePaymentCancelled = (paymentInfo) => {
    console.log("Payment cancelled:", paymentInfo);
    toast.error("Thanh toán đã bị hủy. Vui lòng thử lại.");
    
    // Reset to payment step
    setStep(1);
    setPaymentStatus("CANCELLED");
  };

  // Handle payment failure
  const handlePaymentFailed = (paymentInfo) => {
    console.log("Payment failed:", paymentInfo);
    toast.error("Thanh toán thất bại hoặc hết hạn. Vui lòng tạo lại yêu cầu.");
    
    // Reset to payment step or create new payment link
    setStep(1);
    setPaymentStatus("FAILED");
  };

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography>Đang tải thông tin đơn hàng...</Typography>
        </Paper>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate("/orders")}
        >
          Quay lại đơn hàng
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Progress Steps */}
      <Stepper activeStep={step} sx={{ mb: 4 }}>
        <Step completed={step > 0}>
          <StepLabel>Tải đơn hàng</StepLabel>
        </Step>
        <Step completed={step > 1}>
          <StepLabel>Thanh toán</StepLabel>
        </Step>
        <Step completed={step > 2}>
          <StepLabel>Xác nhận</StepLabel>
        </Step>
      </Stepper>

      {/* Order Summary */}
      {order && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: "#f5f5f5" }}>
          <Stack spacing={1}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle2" color="textSecondary">
                Mã đơn hàng:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {order.orderNumber}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle2" color="textSecondary">
                Tổng tiền:
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#4cbe00" }}
              >
                {order.total?.toLocaleString("vi-VN")} VNĐ
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle2" color="textSecondary">
                Trạng thái:
              </Typography>
              <Typography variant="body2">
                {order.status === "CONFIRMED" ? "✓ Xác nhận" : order.status}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Payment Section */}
      {step === 1 && order && (
        <Stack spacing={3}>
          {/* Real-time Status Display */}
          <PaymentWebhookHandler
            orderId={orderId}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailed={handlePaymentFailed}
            onPaymentCancelled={handlePaymentCancelled}
          />

          {/* Payment Link & QR Code */}
          <PaymentCheckout
            orderId={orderId}
            orderNumber={order.orderNumber}
            totalAmount={order.total}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={() => {
              navigate("/orders");
            }}
          />
        </Stack>
      )}

      {/* Success State */}
      {step === 2 && (
        <Alert severity="success" sx={{ textAlign: "center" }}>
          <Typography sx={{ fontWeight: 600 }}>
            ✓ Thanh toán thành công!
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Đang chuyển hướng...
          </Typography>
        </Alert>
      )}
    </Container>
  );
};

export default PaymentFlowExample;

/**
 * Usage in Router:
 * 
 * import PaymentFlowExample from './pages/PaymentFlowExample';
 * 
 * <Route path="/payment/:orderId" element={<PaymentFlowExample />} />
 */

/**
 * Alternative: Minimal Integration Example
 * 
 * If you want a simpler integration without full flow control:
 */
const MinimalPaymentExample = ({ orderId }) => {
  return (
    <Box>
      {/* Just display QR and status */}
      <PaymentCheckout
        orderId={orderId}
        onPaymentSuccess={(info) => {
          console.log("Payment success!");
          window.location.href = `/payment/success?orderId=${orderId}`;
        }}
      />

      {/* Show real-time status updates */}
      <PaymentWebhookHandler
        orderId={orderId}
        onPaymentSuccess={(info) => {
          window.location.href = `/payment/success?orderId=${orderId}`;
        }}
      />
    </Box>
  );
};

export { MinimalPaymentExample };

/**
 * Advanced: Custom Webhook Status Handler
 * 
 * Use this if you need custom logic beyond standard notifications
 */
import { webhookService } from "../services/webhookService";

const AdvancedPaymentExample = ({ orderId, onStatusChange }) => {
  const { token } = useAuth();

  useEffect(() => {
    console.log("Starting payment polling for order:", orderId);

    // Subscribe to updates with custom logic
    const stopPolling = webhookService.subscribeToPaymentUpdates(
      orderId,
      token,
      (paymentInfo) => {
        console.log("[Payment Update]", paymentInfo);

        // Custom business logic
        switch (paymentInfo.paymentStatus) {
          case "PAID":
            // 1. Update inventory
            // 2. Send confirmation email
            // 3. Update user account
            // 4. Log transaction
            handlePaidStatus(paymentInfo);
            break;

          case "CANCELLED":
            // Release reserved items
            handleCancelledStatus(paymentInfo);
            break;

          case "EXPIRED":
            // Notify user to retry
            handleExpiredStatus(paymentInfo);
            break;

          default:
            // PENDING: Do nothing, continue polling
            break;
        }

        // Call parent callback
        if (onStatusChange) {
          onStatusChange(paymentInfo);
        }
      },
      3000 // Poll every 3 seconds
    );

    return () => {
      console.log("Stopping payment polling");
      stopPolling();
    };
  }, [orderId, token, onStatusChange]);

  const handlePaidStatus = async (info) => {
    console.log("Processing paid order:", info.orderId);

    // Update inventory
    await inventoryService.deductStock(info.orderId);

    // Send emails
    await emailService.sendOrderConfirmation(info.orderId);
    await emailService.sendPaymentReceipt(info.orderId, info);

    // Update analytics
    analytics.trackPayment({
      orderId: info.orderId,
      amount: info.total,
      method: "PAYOS",
      status: "SUCCESS",
    });
  };

  const handleCancelledStatus = async (info) => {
    console.log("Payment cancelled:", info.orderId);

    // Update inventory
    await inventoryService.releaseReservedStock(info.orderId);

    // Notify user
    await emailService.sendPaymentCancelledNotice(info.orderId);
  };

  const handleExpiredStatus = async (info) => {
    console.log("Payment link expired:", info.orderId);

    // Send reminder email
    await emailService.sendPaymentExpiredReminder(info.orderId);
  };

  return (
    <Box>
      <Typography>Payment is being processed...</Typography>
      <PaymentWebhookHandler orderId={orderId} />
    </Box>
  );
};

export { AdvancedPaymentExample };
