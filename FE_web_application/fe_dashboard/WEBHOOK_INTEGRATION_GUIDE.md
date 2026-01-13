# Webhook Integration Guide - Frontend

## Tổng quan

Hướng dẫn này mô tả cách frontend tích hợp xử lý webhook từ PayOS để cập nhật trạng thái thanh toán theo thời gian thực.

**Lưu ý quan trọng:**
- Webhook endpoint (`POST /payment/webhook`) là một backend endpoint - PayOS gọi trực tiếp tới backend
- Frontend **không nhận** webhook từ PayOS
- Frontend sử dụng **polling mechanism** hoặc **real-time subscriptions** để lắng nghe thay đổi trạng thái thanh toán

---

## Architecture

```
┌─────────────────┐
│   Frontend App  │
│                 │
│  1. Display QR  │
│  2. Show Payment│
│  3. Poll Status │
└────────┬────────┘
         │ GET /payment/status
         │
┌────────v────────────────────┐
│   Backend API               │
│                             │
│  GET /payment/status/:id    │
│  POST /payment/webhook ◄────┼─── PayOS Webhook
└────────┬────────────────────┘
         │ Update DB
┌────────v────────────┐
│   Database          │
│   (Order Status)    │
└─────────────────────┘
```

---

## Phương pháp 1: Polling Status (Recommended)

### Khái niệm

Frontend định kỳ gọi API `/payment/status/:orderId` để kiểm tra trạng thái thanh toán mới nhất.

### Workflow

```
1. User tạo payment link
   ↓
2. User quét QR/click link thanh toán
   ↓
3. Frontend bắt đầu polling
   └─ Mỗi 3 giây: GET /payment/status/{orderId}
   ↓
4. PayOS xử lý thanh toán
   ↓
5. PayOS gọi webhook tới backend
   └─ POST /payment/webhook
   ↓
6. Backend cập nhật database
   ↓
7. Frontend polling phát hiện status = PAID
   ↓
8. Frontend hiển thị success page

Duration: ~10-30 giây (tùy PayOS)
```

### Sử dụng webhookService

```javascript
import { webhookService } from "../services/webhookService";
import { useAuth } from "../contexts/AuthContext";

function PaymentCheckout({ orderId }) {
  const { token } = useAuth();

  useEffect(() => {
    // Subscribe to payment updates
    const unsubscribe = webhookService.subscribeToPaymentUpdates(
      orderId,
      token,
      (paymentInfo) => {
        console.log("Payment status:", paymentInfo.paymentStatus);

        if (paymentInfo.paymentStatus === "PAID") {
          // Thanh toán thành công
          navigate("/payment/success?orderId=" + orderId);
        }
      },
      3000 // Poll every 3 seconds
    );

    return () => unsubscribe();
  }, [orderId, token]);
}
```

### Sử dụng PaymentWebhookHandler Component

```javascript
import { PaymentWebhookHandler } from "./components/Payment";

function PaymentPage({ orderId }) {
  return (
    <div>
      <h1>Thanh toán</h1>

      {/* Hiển thị QR code và payment link */}
      <PaymentCheckout orderId={orderId} />

      {/* Hiển thị status updates */}
      <PaymentWebhookHandler
        orderId={orderId}
        onPaymentSuccess={(info) => {
          console.log("Payment success:", info);
          // Redirect hoặc update UI
        }}
        onPaymentFailed={(info) => {
          console.log("Payment failed:", info);
        }}
        onPaymentCancelled={(info) => {
          console.log("Payment cancelled:", info);
        }}
      />
    </div>
  );
}
```

---

## Phương pháp 2: WebSocket Real-time Updates (Advanced)

### Khái niệm

Backend phát sự kiện thanh toán tới frontend qua WebSocket khi nhận webhook từ PayOS.

### Setup

**Backend (Node.js + Socket.io)**

```javascript
// server.js
const io = require("socket.io")(server, {
  cors: { origin: "*" }
});

app.post("/payment/webhook", async (req, res) => {
  const { code, data } = req.body;

  if (code === "00") {
    const order = await Order.findOne({ paymentLinkId: data.paymentLinkId });

    // Emit event tới client
    io.emit("payment:success", {
      orderId: order.id,
      status: "PAID",
      data
    });

    // Update database
    order.paymentStatus = "PAID";
    await order.save();
  }

  // Webhook response
  res.json({ code: "00", desc: "SUCCESS" });
});
```

**Frontend (React)**

```javascript
import { useSocket } from "../hooks/useSocket";

function PaymentPage({ orderId }) {
  const { socket } = useSocket();
  const [status, setStatus] = useState("PENDING");

  useEffect(() => {
    socket.on("payment:success", (data) => {
      if (data.orderId === orderId) {
        setStatus("PAID");
        toast.success("Thanh toán thành công!");
      }
    });

    return () => {
      socket.off("payment:success");
    };
  }, [socket, orderId]);

  return (
    <div>
      <h2>Trạng thái: {status}</h2>
    </div>
  );
}
```

---

## Webhook Event Mapping

### PayOS Webhook → Frontend Update

```javascript
/**
 * PayOS gửi webhook tới backend
 */
POST /payment/webhook
{
  "code": "00",
  "desc": "SUCCESS",
  "data": {
    "orderCode": 1234567890,
    "amount": 150000,
    "status": "PAID",
    "transactionDateTime": "2026-01-13T10:05:00Z"
  }
}

/**
 * Frontend polling nhận status cập nhật
 */
GET /payment/status/:orderId
Response:
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "paymentStatus": "PAID",  // ← Updated
      "paidAt": "2026-01-13T10:05:00Z"
    }
  }
}

/**
 * Frontend cập nhật UI
 */
if (order.paymentStatus === "PAID") {
  // Show success
  // Redirect to success page
  // Update cart, orders list, etc.
}
```

---

## Handling Different Payment Status

### 1. PENDING (Đang chờ)

```javascript
// Hiển thị QR code
// Hiển thị payment link
// Bắt đầu polling

return (
  <div>
    <Alert severity="info">
      Đang chờ xác nhận thanh toán từ PayOS...
    </Alert>
    <img src={qrCode} alt="QR" />
    <a href={paymentLink}>Thanh toán qua link</a>
    <LinearProgress /> {/* Loading indicator */}
  </div>
);
```

### 2. PAID (Đã thanh toán)

```javascript
// Polling nhận được status = PAID

webhookService.subscribeToPaymentUpdates(orderId, token, (info) => {
  if (info.paymentStatus === "PAID") {
    // 1. Hiển thị success message
    toast.success("Thanh toán thành công!");

    // 2. Update order trong local state
    setOrder({ ...order, paymentStatus: "PAID", paidAt: info.paidAt });

    // 3. Redirect sau 2 giây
    setTimeout(() => {
      navigate(`/payment/success?orderId=${orderId}`);
    }, 2000);
  }
});
```

### 3. CANCELLED (Hủy)

```javascript
if (info.paymentStatus === "CANCELLED") {
  toast.error("Thanh toán đã bị hủy");
  
  // Cho phép user tạo payment link mới
  setPaymentData(null);
  setError("Thanh toán đã hủy. Vui lòng thử lại.");
}
```

### 4. EXPIRED (Hết hạn)

```javascript
if (info.paymentStatus === "EXPIRED") {
  toast.warning("Link thanh toán đã hết hạn");
  
  // Tạo payment link mới
  const newPayment = await paymentService.createPayment(
    orderId,
    returnUrl,
    cancelUrl
  );
  setPaymentData(newPayment.data);
}
```

---

## Polling Configuration

### Recommended Settings

```javascript
// 3 giây - good balance giữa responsiveness và server load
const POLLING_INTERVAL = 3000; // ms

// 5 phút - sufficient time for payment processing
const MAX_POLLING_TIME = 5 * 60 * 1000; // ms

// Auto-stop sau ~100 poll attempts (5 min)
const MAX_POLL_ATTEMPTS = 100;

webhookService.subscribeToPaymentUpdates(
  orderId,
  token,
  onStatusChange,
  POLLING_INTERVAL
);
```

### Custom Polling

```javascript
function usePaymentPolling(orderId, token) {
  const [status, setStatus] = useState("PENDING");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/payment/status/${orderId}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
          const { data } = await response.json();
          const newStatus = data.order.paymentStatus;

          setStatus(newStatus);

          // Stop polling when finalized
          if (
            newStatus === "PAID" ||
            newStatus === "CANCELLED" ||
            newStatus === "EXPIRED"
          ) {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }

      // Stop after max attempts
      setAttempt((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, token]);

  return status;
}
```

---

## Error Handling

### Network Errors

```javascript
webhookService.subscribeToPaymentUpdates(
  orderId,
  token,
  (info) => {
    // Update status
  }
).catch((error) => {
  if (error.message.includes("401")) {
    // Token expired
    navigate("/login");
  } else if (error.message.includes("404")) {
    // Order not found
    setError("Không tìm thấy đơn hàng");
  } else {
    // Network error
    toast.error("Lỗi kết nối. Vui lòng thử lại.");
  }
});
```

### Timeout Handling

```javascript
// Auto-redirect if no payment after 5 minutes
const PAYMENT_TIMEOUT = 5 * 60 * 1000;

useEffect(() => {
  const timeout = setTimeout(() => {
    if (status === "PENDING") {
      navigate("/payment/cancel?orderId=" + orderId);
      toast.error("Hết thời gian thanh toán");
    }
  }, PAYMENT_TIMEOUT);

  return () => clearTimeout(timeout);
}, [status, orderId]);
```

---

## Best Practices

### ✅ Do's

```javascript
// 1. Always cleanup subscriptions
useEffect(() => {
  const unsubscribe = webhookService.subscribeToPaymentUpdates(...);
  return () => unsubscribe();
}, []);

// 2. Handle all payment statuses
switch (status) {
  case "PAID":
  case "CANCELLED":
  case "EXPIRED":
  case "PENDING":
  // Handle each case
}

// 3. Show user feedback
toast.success("Thanh toán thành công!");
setLoadingIndicator(true);

// 4. Validate orderId
if (!orderId || !token) {
  console.error("Missing required data");
  return;
}

// 5. Implement exponential backoff for retries
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
```

### ❌ Don'ts

```javascript
// 1. Don't poll forever without cleanup
// Bad: while(true) { pollPaymentStatus() }
// Good: useEffect with cleanup

// 2. Don't ignore polling errors
// Bad: polling fails silently
// Good: log errors and notify user

// 3. Don't poll too frequently
// Bad: every 1 second (spams server)
// Good: every 3-5 seconds

// 4. Don't hardcode intervals
// Bad: const interval = 3000;
// Good: const POLLING_INTERVAL = config.POLLING_INTERVAL;

// 5. Don't expose sensitive data
// Bad: console.log(fullWebhookData)
// Good: log only necessary fields
```

---

## Integration Checklist

- [ ] Import webhookService in payment components
- [ ] Setup polling when payment is created
- [ ] Handle all 4 payment statuses (PENDING, PAID, CANCELLED, EXPIRED)
- [ ] Show appropriate UI for each status
- [ ] Cleanup subscriptions on unmount
- [ ] Handle errors and network failures
- [ ] Test with sandbox environment
- [ ] Configure polling interval (recommended 3-5 seconds)
- [ ] Add timeout handling (5-10 minutes)
- [ ] Log important events for debugging

---

## Testing Webhook Flow

### 1. Test with Mock Data

```javascript
// Test manual status change
const mockPaymentInfo = {
  orderId: 1,
  orderNumber: "ORD-001",
  paymentStatus: "PAID",
  total: 150000,
  paidAt: new Date().toISOString(),
};

onStatusChange(mockPaymentInfo); // Should show success
```

### 2. Test with PayOS Sandbox

```javascript
// 1. Use sandbox credentials
PAYOS_CLIENT_ID=sandbox_...
PAYOS_API_KEY=sandbox_...

// 2. Create test payment
const payment = await paymentService.createPayment(
  testOrderId,
  returnUrl,
  cancelUrl
);

// 3. Complete payment in sandbox
// 4. Monitor polling response
// 5. Verify status changes to PAID
```

### 3. Monitor Polling

```javascript
// Enable debug logging
webhookService.subscribeToPaymentUpdates(
  orderId,
  token,
  (info) => {
    console.log("[Webhook] Status update:", info);
  }
);

// Check browser DevTools Network tab
// Should see GET /payment/status every 3 seconds
```

---

## Troubleshooting

### Status not updating

```
1. Check token validity
2. Verify orderId is correct
3. Check network tab in DevTools
4. Enable console logging
5. Verify backend /payment/status endpoint works
```

### Polling never stops

```
1. Check if status is one of: PAID, CANCELLED, EXPIRED
2. Manual stop: unsubscribe()
3. Check browser DevTools → Network tab for excessive requests
4. Reduce polling interval if necessary
```

### Webhook response timeout

```
1. Backend may be slow
2. Check if backend is running
3. Check API_BASE_URL configuration
4. Increase timeout threshold
5. Show user "Processing..." message
```

---

**Last Updated**: 2026-01-13
