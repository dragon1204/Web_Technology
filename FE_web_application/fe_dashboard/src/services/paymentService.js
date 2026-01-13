import { config } from "../config";

const API_BASE = config.API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const paymentService = {
  // Create payment link and QR code
  async createPayment(orderId, returnUrl, cancelUrl) {
    console.log("PaymentService: Creating payment for order:", orderId);

    const body = {
      orderId,
      returnUrl: returnUrl || `${window.location.origin}/payment/success?orderId=${orderId}`,
      cancelUrl: cancelUrl || `${window.location.origin}/payment/cancel?orderId=${orderId}`,
    };

    const response = await fetch(`${API_BASE}/payment/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("PaymentService: Payment creation error:", error);
      throw new Error(error.message || "Failed to create payment");
    }

    const data = await response.json();
    console.log("PaymentService: Payment created successfully:", data);
    return data;
  },

  // Check payment status
  async getPaymentStatus(orderId) {
    console.log("PaymentService: Checking payment status for order:", orderId);

    const response = await fetch(`${API_BASE}/payment/status/${orderId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("PaymentService: Error getting payment status:", error);
      throw new Error(error.message || "Failed to get payment status");
    }

    const data = await response.json();
    console.log("PaymentService: Payment status:", data);
    return data;
  },

  // Get payment link details
  async getPaymentLink(paymentLinkId) {
    console.log("PaymentService: Getting payment link details:", paymentLinkId);

    const response = await fetch(`${API_BASE}/payment/link/${paymentLinkId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("PaymentService: Error getting payment link:", error);
      throw new Error(error.message || "Failed to get payment link");
    }

    return response.json();
  },
};
