# PayOS Payment API - Tài liệu cho Frontend

## Tổng quan

Hệ thống tích hợp PayOS để xử lý thanh toán trực tuyến cho đơn hàng. PayOS hỗ trợ thanh toán qua:
- **QR Code**: Quét mã QR để thanh toán
- **Payment Link**: Link thanh toán trực tiếp
- **Bank Transfer**: Chuyển khoản ngân hàng

**Base URL**: `http://localhost:3000` (hoặc domain production)

**Authentication**: Hầu hết endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer <access_token>
```

**Lưu ý**: Webhook endpoint là **PUBLIC** (không cần authentication)

---

## Cấu hình môi trường

### Backend (.env)
```env
# PayOS Credentials
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
```

### Lấy credentials từ PayOS
1. Đăng ký tài khoản tại [PayOS Dashboard](https://pay.payos.vn/)
2. Tạo ứng dụng và lấy:
   - **Client ID**: ID ứng dụng
   - **API Key**: Key để gọi API
   - **Checksum Key**: Key để verify webhook

---

## 1. Tạo Payment Link và QR Code

Tạo payment link và QR code cho đơn hàng. Endpoint này sẽ:
- Tạo payment link trên PayOS
- Tạo QR code để quét thanh toán
- Lưu thông tin payment vào database
- Trả về payment link và QR code cho frontend

### Endpoint
```
POST /payment/create
```

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body
```json
{
  "orderId": 1,
  "returnUrl": "https://yourdomain.com/payment/success",
  "cancelUrl": "https://yourdomain.com/payment/cancel",
  "expiredAt": 1735689600
}
```

### Request Parameters
| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `orderId` | number | Yes | ID của đơn hàng cần thanh toán |
| `returnUrl` | string | Yes | URL redirect sau khi thanh toán thành công (phải là HTTPS) |
| `cancelUrl` | string | No | URL redirect khi hủy thanh toán (mặc định = returnUrl) |
| `expiredAt` | number | No | Unix timestamp (seconds) - thời gian hết hạn payment link (mặc định: 15 phút) |

### Response

**Success (200 OK)**
```json
{
  "HttpCode": 200,
  "success": true,
  "message": "Payment link created successfully",
  "data": {
    "orderId": 1,
    "orderNumber": "ORD-20260113-001",
    "paymentLinkId": "abc123xyz789",
    "paymentLink": "https://pay.payos.vn/web/abc123xyz789",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "amount": 150000,
    "orderCode": 1234567890,
    "accountNumber": "970422",
    "accountName": "NGUYEN VAN A",
    "bin": "970422"
  },
  "timestamp": "2026-01-13T10:00:00.000Z"
}
```

**Error (400 Bad Request)**
```json
{
  "statusCode": 400,
  "message": "Đơn hàng đã được thanh toán",
  "error": "Bad Request"
}
```

**Error (401 Unauthorized)**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Ví dụ sử dụng

```javascript
// services/paymentService.js
const API_BASE_URL = 'http://localhost:3000';

export const createPayment = async (orderId, returnUrl, cancelUrl, token) => {
  const response = await fetch(`${API_BASE_URL}/payment/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderId,
      returnUrl: returnUrl || `${window.location.origin}/payment/success`,
      cancelUrl: cancelUrl || `${window.location.origin}/payment/cancel`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create payment');
  }

  return response.json();
};

// Component usage
import { createPayment } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function PaymentPage({ orderId }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreatePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      const returnUrl = `${window.location.origin}/payment/success?orderId=${orderId}`;
      const cancelUrl = `${window.location.origin}/payment/cancel?orderId=${orderId}`;
      
      const result = await createPayment(orderId, returnUrl, cancelUrl, token);
      
      if (result.success && result.data) {
        setPaymentData(result.data);
        
        // Có thể redirect đến payment link hoặc hiển thị QR code
        // Option 1: Redirect đến payment link
        // window.location.href = result.data.paymentLink;
        
        // Option 2: Hiển thị QR code trong component
      }
    } catch (err) {
      setError(err.message);
      console.error('Payment creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!paymentData ? (
        <div>
          <h2>Thanh toán đơn hàng</h2>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <button 
            onClick={handleCreatePayment} 
            disabled={loading}
          >
            {loading ? 'Đang tạo...' : 'Tạo mã thanh toán'}
          </button>
        </div>
      ) : (
        <div>
          <h2>Quét mã QR để thanh toán</h2>
          
          {/* Hiển thị QR Code */}
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <img 
              src={paymentData.qrCode} 
              alt="QR Code" 
              style={{ maxWidth: '300px', border: '1px solid #ddd' }}
            />
          </div>

          {/* Thông tin thanh toán */}
          <div style={{ margin: '20px 0' }}>
            <p><strong>Số tiền:</strong> {paymentData.amount.toLocaleString('vi-VN')} VNĐ</p>
            <p><strong>Mã đơn hàng:</strong> {paymentData.orderNumber}</p>
            <p><strong>Số tài khoản:</strong> {paymentData.accountNumber}</p>
            <p><strong>Tên tài khoản:</strong> {paymentData.accountName}</p>
            <p><strong>Ngân hàng:</strong> {paymentData.bin}</p>
          </div>

          {/* Link thanh toán */}
          <div style={{ margin: '20px 0' }}>
            <a 
              href={paymentData.paymentLink} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#4cbe00',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              Thanh toán qua link
            </a>
          </div>

          {/* Polling để kiểm tra trạng thái thanh toán */}
          <PaymentStatusChecker 
            orderId={orderId} 
            onPaymentSuccess={() => navigate(`/payment/success?orderId=${orderId}`)}
          />
        </div>
      )}
    </div>
  );
}

// Component để kiểm tra trạng thái thanh toán (polling)
function PaymentStatusChecker({ orderId, onPaymentSuccess }) {
  const { token } = useAuth();
  const [status, setStatus] = useState('PENDING');

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/payment/status/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          const paymentStatus = result.data?.order?.paymentStatus;
          
          setStatus(paymentStatus);
          
          if (paymentStatus === 'PAID') {
            clearInterval(interval);
            onPaymentSuccess();
          } else if (paymentStatus === 'CANCELLED' || paymentStatus === 'EXPIRED') {
            clearInterval(interval);
            alert('Thanh toán đã bị hủy hoặc hết hạn');
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 3000); // Check mỗi 3 giây

    return () => clearInterval(interval);
  }, [orderId, token, onPaymentSuccess]);

  return (
    <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
      <p>Trạng thái: <strong>{status}</strong></p>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        Đang kiểm tra trạng thái thanh toán...
      </p>
    </div>
  );
}
```

---

## 2. Kiểm tra trạng thái thanh toán

Kiểm tra trạng thái thanh toán của đơn hàng. Frontend có thể gọi endpoint này để:
- Kiểm tra xem đơn hàng đã thanh toán chưa
- Lấy thông tin payment link mới nhất
- Hiển thị trạng thái thanh toán cho user

### Endpoint
```
GET /payment/status/:orderId
```

### Headers
```
Authorization: Bearer <access_token>
```

### Path Parameters
| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `orderId` | number | Yes | ID của đơn hàng |

### Response

**Success (200 OK)**
```json
{
  "HttpCode": 200,
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "orderNumber": "ORD-20260113-001",
      "total": 150000,
      "status": "CONFIRMED",
      "paymentStatus": "PAID",
      "paymentMethod": "PAYOS",
      "paymentLink": "https://pay.payos.vn/web/abc123xyz789",
      "paymentQrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "paidAt": "2026-01-13T10:05:00.000Z"
    },
    "paymentInfo": {
      "orderCode": 1234567890,
      "amount": 150000,
      "description": "Thanh toán đơn hàng #ORD-20260113-001",
      "accountNumber": "970422",
      "accountName": "NGUYEN VAN A",
      "status": "PAID",
      "transactionDateTime": "2026-01-13T10:05:00.000Z"
    }
  },
  "timestamp": "2026-01-13T10:10:00.000Z"
}
```

### Payment Status Values
| Status | Mô tả |
|--------|-------|
| `PENDING` | Đang chờ thanh toán |
| `PAID` | Đã thanh toán thành công |
| `CANCELLED` | Đã hủy thanh toán |
| `EXPIRED` | Payment link đã hết hạn |

### Ví dụ sử dụng

```javascript
// services/paymentService.js
export const getPaymentStatus = async (orderId, token) => {
  const response = await fetch(`${API_BASE_URL}/payment/status/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get payment status');
  }

  return response.json();
};

// Component usage
function OrderPaymentStatus({ orderId }) {
  const { token } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const result = await getPaymentStatus(orderId, token);
      setPaymentStatus(result.data);
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Polling mỗi 5 giây
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading && !paymentStatus) {
    return <div>Đang tải...</div>;
  }

  if (!paymentStatus) {
    return <div>Không tìm thấy thông tin thanh toán</div>;
  }

  const { order, paymentInfo } = paymentStatus;

  return (
    <div>
      <h3>Trạng thái thanh toán</h3>
      <div>
        <p><strong>Mã đơn hàng:</strong> {order.orderNumber}</p>
        <p><strong>Số tiền:</strong> {order.total.toLocaleString('vi-VN')} VNĐ</p>
        <p><strong>Trạng thái:</strong> 
          <span style={{
            color: order.paymentStatus === 'PAID' ? 'green' : 
                   order.paymentStatus === 'CANCELLED' ? 'red' : 
                   order.paymentStatus === 'EXPIRED' ? 'orange' : 'blue'
          }}>
            {order.paymentStatus}
          </span>
        </p>
        {order.paidAt && (
          <p><strong>Thời gian thanh toán:</strong> {new Date(order.paidAt).toLocaleString('vi-VN')}</p>
        )}
      </div>

      {order.paymentStatus === 'PENDING' && order.paymentQrCode && (
        <div style={{ marginTop: '20px' }}>
          <h4>Quét mã QR để thanh toán</h4>
          <img src={order.paymentQrCode} alt="QR Code" style={{ maxWidth: '200px' }} />
        </div>
      )}
    </div>
  );
}
```

---

## 3. Lấy thông tin Payment Link

Lấy thông tin chi tiết của payment link từ PayOS.

### Endpoint
```
GET /payment/link/:paymentLinkId
```

### Headers
```
Authorization: Bearer <access_token>
```

### Path Parameters
| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `paymentLinkId` | string | Yes | Payment Link ID từ PayOS |

### Response

**Success (200 OK)**
```json
{
  "HttpCode": 200,
  "success": true,
  "data": {
    "paymentInfo": {
      "orderCode": 1234567890,
      "amount": 150000,
      "description": "Thanh toán đơn hàng #ORD-20260113-001",
      "accountNumber": "970422",
      "accountName": "NGUYEN VAN A",
      "status": "PAID",
      "transactionDateTime": "2026-01-13T10:05:00.000Z"
    },
    "order": {
      "id": 1,
      "orderNumber": "ORD-20260113-001",
      "status": "CONFIRMED",
      "paymentStatus": "PAID"
    }
  },
  "timestamp": "2026-01-13T10:10:00.000Z"
}
```

---

## 4. Webhook (PayOS Callback)

**Lưu ý quan trọng**: Endpoint này được PayOS gọi tự động khi có sự kiện thanh toán. Frontend **KHÔNG CẦN** gọi endpoint này.

### Endpoint
```
POST /payment/webhook
```

### Headers
```
Content-Type: application/json
```

**Không cần Authentication** - PayOS sẽ gọi trực tiếp

### Request Body (từ PayOS)
```json
{
  "code": "00",
  "desc": "SUCCESS",
  "data": {
    "orderCode": 1234567890,
    "amount": 150000,
    "description": "Thanh toán đơn hàng #ORD-20260113-001",
    "accountNumber": "970422",
    "accountName": "NGUYEN VAN A",
    "reference": "REF123456",
    "transactionDateTime": "2026-01-13T10:05:00.000Z",
    "currency": "VND",
    "paymentLinkId": "abc123xyz789",
    "code": "00",
    "desc": "SUCCESS"
  },
  "signature": "abc123xyz789..."
}
```

### Response (PayOS yêu cầu format này)
```json
{
  "code": "00",
  "desc": "SUCCESS"
}
```

### Webhook Events

| Code | Desc | Mô tả | Hành động |
|------|------|-------|-----------|
| `00` | `SUCCESS` | Thanh toán thành công | Cập nhật order: `paymentStatus = PAID`, `status = CONFIRMED`, `paidAt`; tạo bản ghi doanh thu (`Sale`) và gửi notification cho khách + chủ shop |
| `01` | `CANCELLED` | Thanh toán bị hủy | Cập nhật order: `paymentStatus = CANCELLED` |
| Khác | - | Thanh toán hết hạn/thất bại | Cập nhật order: `paymentStatus = EXPIRED` |

### Cấu hình Webhook URL trong PayOS Dashboard

1. Đăng nhập PayOS Dashboard
2. Vào **Settings** > **Webhook**
3. Thêm Webhook URL: `https://yourdomain.com/payment/webhook`
4. Lưu lại

**Lưu ý**: 
- Webhook URL phải là **HTTPS** (không hỗ trợ HTTP)
- PayOS sẽ retry nếu webhook trả về lỗi
- Backend phải trả về `{"code": "00", "desc": "SUCCESS"}` để PayOS không retry

---

## Workflow thanh toán hoàn chỉnh

### 1. User checkout đơn hàng
```javascript
// 1. User checkout (tạo order)
const checkoutResult = await orderService.checkout({
  shopId: 1,
  shippingAddressId: 1,
  notes: 'Giao hàng buổi sáng',
});

const orderId = checkoutResult.data.id;
```

### 2. Tạo payment link
```javascript
// 2. Tạo payment link và QR code
const paymentResult = await createPayment(
  orderId,
  `${window.location.origin}/payment/success?orderId=${orderId}`,
  `${window.location.origin}/payment/cancel?orderId=${orderId}`,
  token
);

// Lưu payment data
const { paymentLink, qrCode, paymentLinkId } = paymentResult.data;
```

### 3. Hiển thị QR code hoặc redirect
```javascript
// Option 1: Hiển thị QR code
<img src={qrCode} alt="QR Code" />

// Option 2: Redirect đến payment link
window.location.href = paymentLink;
```

### 4. User thanh toán
- User quét QR code hoặc click vào payment link
- Thanh toán trên PayOS
- PayOS redirect về `returnUrl` hoặc `cancelUrl`

### 5. Kiểm tra trạng thái (Polling)
```javascript
// Polling để kiểm tra trạng thái thanh toán
useEffect(() => {
  const interval = setInterval(async () => {
    const status = await getPaymentStatus(orderId, token);
    
    if (status.data.order.paymentStatus === 'PAID') {
      clearInterval(interval);
      // Redirect đến trang success
      navigate(`/payment/success?orderId=${orderId}`);
    }
  }, 3000); // Check mỗi 3 giây

  return () => clearInterval(interval);
}, [orderId]);
```

### 6. Webhook xử lý & Revenue (Backend tự động)
- PayOS gọi webhook khi thanh toán thành công
- Backend xác thực, cập nhật order, ghi nhận doanh thu, gửi thông báo
- Frontend có thể kiểm tra status qua polling hoặc nhận notification realtime

#### Backend Workflow khi `code = '00'`, `desc = 'SUCCESS'`

1. Xác thực chữ ký
2. Tìm `Order` theo `paymentLinkId` (kèm `customer`, `shop.owner`, `items.shopProduct`)
3. Transaction:
   ```ts
   await this.prisma.$transaction(async (tx) => {
     await tx.order.update({
       where: { id: order.id },
       data: {
         paymentStatus: 'PAID',
         status: 'CONFIRMED',
         paidAt: new Date(),
       },
     });

     for (const item of order.items) {
       const sp = item.shopProduct;
       if (!sp?.gardenId || !sp?.vegetableId) continue;

       await tx.sale.create({
         data: {
           gardenId: sp.gardenId,
           vegetableId: sp.vegetableId,
           quantity: item.quantity,
           priceAtSale: item.price,
           total: item.subtotal,
         },
       });
     }
   });
   ```
4. Notifications:
   ```ts
   await notificationService.createForUser(
     order.customer.id,
     'Thanh toán thành công',
     `Đơn hàng ${order.orderNumber} đã được thanh toán thành công.`,
     'success',
   );

   await notificationService.createForUser(
     order.shop.ownerId,
     'Đơn hàng mới đã thanh toán',
     `Khách hàng ${order.customer.name} đã thanh toán đơn hàng ${order.orderNumber} (${order.total.toLocaleString('vi-VN')} VNĐ).`,
     'info',
   );
   ```
5. Trả về `{ code: '00', desc: 'SUCCESS' }`

#### Sale record schema

| Field         | Source                                      |
|---------------|---------------------------------------------|
| `gardenId`    | `OrderItem.shopProduct.gardenId`            |
| `vegetableId` | `OrderItem.shopProduct.vegetableId`         |
| `quantity`    | `OrderItem.quantity`                        |
| `priceAtSale` | `OrderItem.price`                           |
| `total`       | `OrderItem.subtotal` (= quantity * price)   |

Các báo cáo doanh thu (Analytics) chỉ cần đọc bảng `Sale`.

---

## Xử lý các trường hợp

### 1. Thanh toán thành công
```javascript
// Sau khi nhận webhook thành công, FE có thể polling hoặc subscribe notification
const { data } = await getPaymentStatus(orderId, token);

if (data.order.paymentStatus === 'PAID') {
  toast.success('Thanh toán thành công!');
  navigate(`/customer/orders/${orderId}`);
}
```

### 2. Thanh toán bị hủy
```javascript
// Trong PaymentCancelPage
useEffect(() => {
  const orderId = new URLSearchParams(window.location.search).get('orderId');
  
  if (orderId) {
    toast.error('Thanh toán đã bị hủy');
    // Có thể cho phép user tạo payment link mới
    navigate(`/payment?orderId=${orderId}`);
  }
}, []);
```

### 3. Payment link hết hạn
```javascript
// Kiểm tra expired
if (paymentStatus === 'EXPIRED') {
  // Tạo payment link mới
  const newPayment = await createPayment(orderId, returnUrl, cancelUrl, token);
  setPaymentData(newPayment.data);
}
```

### 4. Lỗi khi tạo payment
```javascript
try {
  const payment = await createPayment(orderId, returnUrl, cancelUrl, token);
} catch (error) {
  if (error.message.includes('đã được thanh toán')) {
    // Order đã được thanh toán, redirect đến success
    navigate(`/payment/success?orderId=${orderId}`);
  } else {
    // Hiển thị lỗi và cho phép retry
    setError(error.message);
  }
}
```

---

## Best Practices

### 1. Error Handling
- Luôn xử lý lỗi khi gọi API
- Hiển thị thông báo rõ ràng cho user
- Cho phép user retry nếu có lỗi

### 2. Polling Strategy
- Polling mỗi 3-5 giây khi payment status là PENDING
- Dừng polling khi status là PAID, CANCELLED, hoặc EXPIRED
- Cleanup interval khi component unmount

### 3. User Experience
- Hiển thị QR code rõ ràng, đủ lớn để quét
- Cung cấp cả QR code và payment link
- Hiển thị thông tin thanh toán (số tiền, tài khoản, etc.)
- Có loading state khi đang tạo payment
- Có thông báo khi payment thành công/thất bại

### 4. Security
- Luôn verify orderId thuộc về user hiện tại
- Không expose sensitive data (API keys, etc.)
- Validate returnUrl và cancelUrl

### 5. Testing
- Test với PayOS sandbox trước khi deploy production
- Test các trường hợp: success, cancel, expired, error
- Test webhook với PayOS webhook tester

---

## PayOS Sandbox

Để test trong môi trường development:

1. Đăng ký tài khoản PayOS Sandbox
2. Lấy Sandbox credentials
3. Cấu hình trong `.env`:
   ```env
   PAYOS_CLIENT_ID=sandbox_client_id
   PAYOS_API_KEY=sandbox_api_key
   PAYOS_CHECKSUM_KEY=sandbox_checksum_key
   ```
4. Sử dụng PayOS Sandbox webhook URL cho testing

---

## Migration Database

Sau khi cập nhật schema, cần chạy migration:

```bash
cd BE_Server-side
npx prisma migrate dev --name add_payment_fields
```

Hoặc nếu không có quyền tạo shadow database:
```sql
ALTER TABLE "Order" ADD COLUMN "paymentId" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymentStatus" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymentMethod" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymentLink" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymentQrCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "paidAt" TIMESTAMP(3);

CREATE INDEX "Order_paymentId_idx" ON "Order"("paymentId");
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");
```

---

## Tổng hợp các Endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/payment/create` | Tạo payment link và QR code | Required |
| GET | `/payment/status/:orderId` | Kiểm tra trạng thái thanh toán | Required |
| GET | `/payment/link/:paymentLinkId` | Lấy thông tin payment link | Required |
| POST | `/payment/webhook` | Webhook từ PayOS | **Public** |

---

## Response Format

Tất cả responses đều theo format:
```json
{
  "HttpCode": 200,
  "success": true,
  "message": "Optional message",
  "data": { ... },
  "timestamp": "2026-01-13T10:00:00.000Z"
}
```

---

## Error Codes

| Status Code | Mô tả |
|-------------|-------|
| 200 | Success |
| 400 | Bad Request (invalid data, order already paid, etc.) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (order doesn't belong to user) |
| 404 | Not Found (order not found) |
| 500 | Internal Server Error |

---

**Tài liệu này được cập nhật lần cuối: 2026-01-13**
