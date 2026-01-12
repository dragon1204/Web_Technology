# Hướng Dẫn Tích Hợp Two-Factor Authentication (2FA)

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [API Endpoints](#api-endpoints)
3. [Flow Diagram](#flow-diagram)
4. [Implementation Guide](#implementation-guide)
5. [Code Examples](#code-examples)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## 📖 Tổng Quan

Two-Factor Authentication (2FA) sử dụng TOTP (Time-based One-Time Password) để tăng cường bảo mật cho tài khoản người dùng. Người dùng cần sử dụng ứng dụng authenticator (Google Authenticator, Authy, Microsoft Authenticator) để tạo mã 6 chữ số.

### Các Trạng Thái 2FA:
- **Chưa kích hoạt**: `isTwoFactorEnabled: false`, `totpSecret: null`
- **Đang thiết lập**: `isTwoFactorEnabled: false`, `totpSecret: có giá trị`
- **Đã kích hoạt**: `isTwoFactorEnabled: true`, `totpSecret: có giá trị`

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/auth
```

### 1. Generate 2FA Secret
**Endpoint:** `POST /auth/2fa/generate`

**Authentication:** Required (Bearer Token)

**Description:** Tạo secret key và otpauth URL để hiển thị QR code

**Request:**
```http
POST /auth/2fa/generate
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "HttpCode": 200,
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "otpauthUrl": "otpauth://totp/WebTechnology:user@example.com?secret=JBSWY3DPEHPK3PXP&period=30&digits=6&algorithm=SHA1&issuer=WebTechnology"
  },
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Token không hợp lệ hoặc đã hết hạn
- `500 Internal Server Error`: Lỗi server

---

### 2. Generate QR Code Image
**Endpoint:** `POST /auth/2fa/qrcode`

**Authentication:** Required (Bearer Token)

**Description:** Tạo QR code image từ otpauth URL

**Request:**
```http
POST /auth/2fa/qrcode
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "otpauthUrl": "otpauth://totp/WebTechnology:user@example.com?secret=JBSWY3DPEHPK3PXP&period=30&digits=6&algorithm=SHA1&issuer=WebTechnology"
}
```

**Response (200 OK):**
- Content-Type: `image/png`
- Body: PNG image binary data

**Error Responses:**
- `400 Bad Request`: otpauthUrl không được cung cấp
- `401 Unauthorized`: Token không hợp lệ

**Usage Example:**
```javascript
const response = await fetch(`${API_BASE}/auth/2fa/qrcode`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ otpauthUrl: otpauthUrl })
});

const blob = await response.blob();
const imageUrl = URL.createObjectURL(blob);
// Hiển thị imageUrl trong <img src={imageUrl} />
```

---

### 3. Enable 2FA
**Endpoint:** `POST /auth/2fa/enable`

**Authentication:** Required (Bearer Token)

**Description:** Kích hoạt 2FA sau khi người dùng đã quét QR code và nhập mã xác thực

**Request:**
```http
POST /auth/2fa/enable
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "code": "123456"
}
```

**Request Body:**
```typescript
{
  code: string; // 6-digit TOTP code từ authenticator app
}
```

**Response (200 OK):**
```json
{
  "HttpCode": 200,
  "success": true,
  "data": {
    "message": "Two-factor authentication enabled"
  },
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: 
  - `"2FA secret not generated"` - Chưa generate secret trước đó
- `401 Unauthorized`: 
  - `"Invalid two-factor code"` - Mã TOTP không đúng
  - Token không hợp lệ
- `500 Internal Server Error`: Lỗi server

---

### 4. Disable 2FA
**Endpoint:** `POST /auth/2fa/disable`

**Authentication:** Required (Bearer Token)

**Description:** Tắt 2FA cho tài khoản người dùng

**Request:**
```http
POST /auth/2fa/disable
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "HttpCode": 200,
  "success": true,
  "data": {
    "message": "Two-factor authentication disabled"
  },
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Token không hợp lệ
- `500 Internal Server Error`: Lỗi server

---

### 5. Login với 2FA
**Endpoint:** `POST /auth/login`

**Description:** Khi user đã bật 2FA, cần cung cấp `totpCode` trong request login

**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "totpCode": "123456" // Required nếu user đã bật 2FA
}
```

**Response khi thiếu 2FA code (401 Unauthorized):**
```json
{
  "HttpCode": 401,
  "success": false,
  "message": "Two-factor code is required",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

**Response khi 2FA code sai (401 Unauthorized):**
```json
{
  "HttpCode": 401,
  "success": false,
  "message": "Invalid two-factor code",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

---

## 🔄 Flow Diagram

### Flow 1: Thiết Lập 2FA (Setup Flow)
```
User clicks "Enable 2FA"
    ↓
1. POST /auth/2fa/generate
    ↓
2. Nhận secret và otpauthUrl
    ↓
3. POST /auth/2fa/qrcode với otpauthUrl
    ↓
4. Hiển thị QR code image
    ↓
5. User quét QR code bằng authenticator app
    ↓
6. User nhập mã 6 chữ số từ app
    ↓
7. POST /auth/2fa/enable với code
    ↓
8. 2FA được kích hoạt thành công
```

### Flow 2: Đăng Nhập với 2FA (Login Flow)
```
User nhập email + password
    ↓
1. POST /auth/login (không có totpCode)
    ↓
2. Backend kiểm tra: user có 2FA enabled?
    ↓
   ├─ NO → Login thành công
   └─ YES → Trả về 401 "Two-factor code is required"
    ↓
3. Frontend hiển thị input cho TOTP code
    ↓
4. User nhập mã từ authenticator app
    ↓
5. POST /auth/login với email, password, totpCode
    ↓
6. Backend verify TOTP code
    ↓
   ├─ Valid → Login thành công
   └─ Invalid → Trả về 401 "Invalid two-factor code"
```

### Flow 3: Tắt 2FA (Disable Flow)
```
User clicks "Disable 2FA"
    ↓
1. Hiển thị confirmation dialog
    ↓
2. User xác nhận
    ↓
3. POST /auth/2fa/disable
    ↓
4. 2FA được tắt thành công
```

---

## 💻 Implementation Guide

### Bước 1: Cập Nhật AuthService

Thêm các methods vào `src/services/authService.js`:

```javascript
// Generate 2FA secret
async generate2FA() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/auth/2fa/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate 2FA secret");
  }

  return response.json();
},

// Get QR code image
async get2FAQRCode(otpauthUrl) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/auth/2fa/qrcode`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ otpauthUrl }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to get QR code");
  }

  // Return blob để tạo image URL
  return await response.blob();
},

// Enable 2FA
async enable2FA(totpCode) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/auth/2fa/enable`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code: totpCode }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to enable 2FA");
  }

  return response.json();
},

// Disable 2FA
async disable2FA() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/auth/2fa/disable`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to disable 2FA");
  }

  return response.json();
},
```

### Bước 2: Cập Nhật Login Component

Cập nhật `src/components/Login.jsx` để xử lý 2FA:

```javascript
const [show2FAInput, setShow2FAInput] = useState(false);
const [totpCode, setTotpCode] = useState("");

const handleLogin = async (email, password) => {
  try {
    const credentials = { email, password };
    
    // Nếu đã có TOTP code, thêm vào request
    if (show2FAInput && totpCode) {
      credentials.totpCode = totpCode;
    }
    
    const result = await authService.login(credentials);
    
    if (result.success) {
      // Login thành công
      navigate("/dashboard");
    }
  } catch (error) {
    // Kiểm tra nếu lỗi là "Two-factor code is required"
    if (error.message.includes("Two-factor code is required")) {
      setShow2FAInput(true);
      // Hiển thị input cho TOTP code
    } else if (error.message.includes("Invalid two-factor code")) {
      // Hiển thị lỗi mã không đúng
      toast.error("Mã xác thực không đúng. Vui lòng thử lại.");
    } else {
      toast.error(error.message || "Đăng nhập thất bại");
    }
  }
};
```

### Bước 3: Tạo Component TwoFactorAuth

Tạo `src/components/Security/TwoFactorAuth.jsx`:

```javascript
import React, { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from "@mui/material";
import QRCode from "qrcode.react"; // hoặc sử dụng QR code library khác

const TwoFactorAuth = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [otpauthUrl, setOtpauthUrl] = useState(null);
  const [secret, setSecret] = useState(null);
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const is2FAEnabled = user?.isTwoFactorEnabled || false;

  // Generate secret và QR code
  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.generate2FA();
      const { secret, otpauthUrl } = response.data;
      
      setSecret(secret);
      setOtpauthUrl(otpauthUrl);
      
      // Tạo QR code image
      const blob = await authService.get2FAQRCode(otpauthUrl);
      const imageUrl = URL.createObjectURL(blob);
      setQrCodeUrl(imageUrl);
    } catch (err) {
      setError(err.message || "Không thể tạo mã QR");
    } finally {
      setLoading(false);
    }
  };

  // Enable 2FA
  const handleEnable = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError("Vui lòng nhập mã 6 chữ số");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await authService.enable2FA(totpCode);
      setSuccess("Đã bật xác thực 2 bước thành công!");
      
      // Refresh user data
      await refreshUser();
      
      // Reset form
      setTotpCode("");
      setQrCodeUrl(null);
      setOtpauthUrl(null);
      setSecret(null);
    } catch (err) {
      setError(err.message || "Không thể bật xác thực 2 bước");
    } finally {
      setLoading(false);
    }
  };

  // Disable 2FA
  const handleDisable = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn tắt xác thực 2 bước?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await authService.disable2FA();
      setSuccess("Đã tắt xác thực 2 bước thành công!");
      
      // Refresh user data
      await refreshUser();
    } catch (err) {
      setError(err.message || "Không thể tắt xác thực 2 bước");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Xác Thực 2 Bước (2FA)
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {is2FAEnabled ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Xác thực 2 bước đã được bật cho tài khoản của bạn.
            </Alert>
            
            <Button
              variant="outlined"
              color="error"
              onClick={handleDisable}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Tắt Xác Thực 2 Bước"}
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" paragraph>
              Bảo vệ tài khoản của bạn bằng xác thực 2 bước. Quét mã QR bằng ứng dụng
              Google Authenticator hoặc Microsoft Authenticator.
            </Typography>

            {!qrCodeUrl ? (
              <Button
                variant="contained"
                onClick={handleGenerate}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : "Bắt Đầu Thiết Lập"}
              </Button>
            ) : (
              <Box>
                <Box sx={{ mb: 2, textAlign: "center" }}>
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    style={{ maxWidth: "256px", height: "auto" }}
                  />
                </Box>

                {secret && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Mã dự phòng:</strong> {secret}
                    </Typography>
                    <Typography variant="caption">
                      Lưu mã này ở nơi an toàn để khôi phục tài khoản nếu mất điện thoại.
                    </Typography>
                  </Alert>
                )}

                <Typography variant="body2" paragraph>
                  Sau khi quét mã QR, nhập mã 6 chữ số từ ứng dụng:
                </Typography>

                <TextField
                  label="Mã Xác Thực"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputProps={{ maxLength: 6 }}
                  sx={{ mb: 2, width: "100%", maxWidth: "200px" }}
                  placeholder="123456"
                />

                <Box>
                  <Button
                    variant="contained"
                    onClick={handleEnable}
                    disabled={loading || totpCode.length !== 6}
                    sx={{ mr: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : "Kích Hoạt"}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setQrCodeUrl(null);
                      setOtpauthUrl(null);
                      setSecret(null);
                      setTotpCode("");
                    }}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;
```

---

## ⚠️ Error Handling

### Các Lỗi Thường Gặp:

1. **"2FA secret not generated"**
   - **Nguyên nhân:** Chưa gọi `/auth/2fa/generate` trước khi enable
   - **Giải pháp:** Luôn gọi generate trước khi enable

2. **"Invalid two-factor code"**
   - **Nguyên nhân:** Mã TOTP không đúng hoặc đã hết hạn
   - **Giải pháp:** Yêu cầu user nhập lại mã mới (mã TOTP thay đổi mỗi 30 giây)

3. **"Two-factor code is required"**
   - **Nguyên nhân:** User đã bật 2FA nhưng không cung cấp mã khi login
   - **Giải pháp:** Hiển thị input cho TOTP code

4. **401 Unauthorized**
   - **Nguyên nhân:** Token hết hạn hoặc không hợp lệ
   - **Giải pháp:** Redirect về login page

---

## ✅ Best Practices

### 1. UX/UI Recommendations

- ✅ Hiển thị trạng thái 2FA rõ ràng (Đã bật / Chưa bật)
- ✅ Hiển thị mã dự phòng (backup code) để user lưu lại
- ✅ Validation: Mã TOTP phải đúng 6 chữ số
- ✅ Auto-format input: Chỉ cho phép nhập số, tự động giới hạn 6 ký tự
- ✅ Hiển thị countdown timer cho mã TOTP (mã thay đổi mỗi 30 giây)
- ✅ Confirmation dialog khi disable 2FA

### 2. Security Recommendations

- ✅ Không lưu secret key ở frontend
- ✅ Luôn sử dụng HTTPS trong production
- ✅ Validate mã TOTP ở cả frontend (UX) và backend (security)
- ✅ Rate limiting: Giới hạn số lần nhập sai mã
- ✅ Logging: Ghi log các thao tác enable/disable 2FA

### 3. Code Organization

```javascript
// Tổ chức code theo cấu trúc:
src/
  services/
    authService.js        // API calls
  components/
    Security/
      TwoFactorAuth.jsx   // Main component
      TwoFactorSetup.jsx  // Setup flow
      TwoFactorVerify.jsx // Verification flow
  contexts/
    AuthContext.js        // User state management
```

### 4. Testing Checklist

- [ ] Generate secret thành công
- [ ] Hiển thị QR code đúng
- [ ] Enable 2FA với mã hợp lệ
- [ ] Enable 2FA với mã không hợp lệ
- [ ] Disable 2FA thành công
- [ ] Login với 2FA enabled (có mã)
- [ ] Login với 2FA enabled (không có mã)
- [ ] Login với 2FA enabled (mã sai)
- [ ] Error handling cho tất cả các trường hợp

---

## 📚 Tài Liệu Tham Khảo

- [TOTP Specification (RFC 6238)](https://tools.ietf.org/html/rfc6238)
- [Google Authenticator](https://support.google.com/accounts/answer/1066447)
- [Microsoft Authenticator](https://www.microsoft.com/en-us/security/mobile-authenticator-app)

---

## 🆘 Support

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Backend có đang chạy không?
2. Token có hợp lệ không?
3. User đã đăng nhập chưa?
4. Network tab trong DevTools để xem request/response

---

**Last Updated:** 2026-01-12
**Version:** 1.0.0
