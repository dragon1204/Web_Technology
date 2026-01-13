/**
 * Webhook Service for PayOS Payment Integration
 * 
 * Note: This is a frontend service for handling webhook data and real-time updates.
 * The actual webhook endpoint (POST /payment/webhook) is on the backend and is
 * called directly by PayOS.
 * 
 * Frontend uses this service to:
 * 1. Process real-time payment status updates via WebSocket or polling
 * 2. Handle webhook event data when received
 * 3. Update UI based on payment status changes
 */

const { config } = require("../config");
const API_BASE = config.API_BASE_URL;

export const webhookService = {
  /**
   * Simulate webhook callback handling
   * (In production, this would come from backend via WebSocket or SSE)
   */
  async handlePaymentWebhookData(webhookData) {
    console.log("WebhookService: Processing webhook data:", webhookData);

    try {
      // Verify webhook signature (done on backend, but we can log it)
      const { code, desc, data } = webhookData;

      if (code !== "00") {
        console.warn("WebhookService: Non-success webhook:", { code, desc });
        return {
          success: false,
          message: desc || "Payment processing failed",
        };
      }

      // Process successful payment
      const { orderCode, amount, status } = data;

      return {
        success: true,
        message: "Payment processed successfully",
        data: {
          orderCode,
          amount,
          status,
          processedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("WebhookService: Error processing webhook:", error);
      throw error;
    }
  },

  /**
   * Subscribe to real-time payment status updates via polling
   * Frontend polls the backend for payment status changes
   */
  async subscribeToPaymentUpdates(orderId, token, onStatusChange, intervalMs = 3000) {
    console.log("WebhookService: Setting up polling for order:", orderId);

    let pollCount = 0;
    const maxPollAttempts = 100; // ~5 minutes with 3s interval

    const pollInterval = setInterval(async () => {
      pollCount++;

      try {
        const response = await fetch(`${API_BASE}/payment/status/${orderId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch payment status: ${response.status}`);
        }

        const result = await response.json();
        const { order } = result.data;

        // Call the callback with updated status
        if (onStatusChange) {
          onStatusChange({
            orderId: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus,
            total: order.total,
            paymentMethod: order.paymentMethod,
            paidAt: order.paidAt,
          });
        }

        // Stop polling if payment is completed or failed
        if (
          order.paymentStatus === "PAID" ||
          order.paymentStatus === "CANCELLED" ||
          order.paymentStatus === "EXPIRED"
        ) {
          console.log("WebhookService: Payment status finalized:", order.paymentStatus);
          clearInterval(pollInterval);
          return { clearInterval: true, status: order.paymentStatus };
        }

        // Stop polling after max attempts
        if (pollCount >= maxPollAttempts) {
          console.warn("WebhookService: Max polling attempts reached");
          clearInterval(pollInterval);
          return { clearInterval: true, reason: "Max attempts" };
        }
      } catch (error) {
        console.error("WebhookService: Polling error:", error);
        // Continue polling even with errors
      }
    }, intervalMs);

    // Return function to manually stop polling
    return () => {
      console.log("WebhookService: Stopping payment polling");
      clearInterval(pollInterval);
    };
  },

  /**
   * Webhook event types from PayOS
   */
  WEBHOOK_EVENTS: {
    PAYMENT_SUCCESS: "00",
    PAYMENT_CANCELLED: "01",
    PAYMENT_EXPIRED: "EXPIRED",
  },

  /**
   * Format webhook response for PayOS
   * PayOS requires this specific format to confirm webhook receipt
   */
  formatWebhookResponse(success = true) {
    return {
      code: success ? "00" : "01",
      desc: success ? "SUCCESS" : "FAILED",
    };
  },

  /**
   * Process payment status change
   * Update local state based on webhook/polling data
   */
  async processPaymentStatusChange(orderId, newStatus, token) {
    console.log(`WebhookService: Order ${orderId} status changed to:`, newStatus);

    try {
      // Verify status with backend
      const response = await fetch(`${API_BASE}/payment/status/${orderId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to verify payment status");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("WebhookService: Error processing status change:", error);
      throw error;
    }
  },
};
