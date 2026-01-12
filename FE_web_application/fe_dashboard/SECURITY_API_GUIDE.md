# Hướng Dẫn Tích Hợp API Bảo Mật (Security API)

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [API Endpoints](#api-endpoints)
3. [Data Structure](#data-structure)
4. [Implementation Guide](#implementation-guide)
5. [Code Examples](#code-examples)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)
8. [Security Considerations](#security-considerations)

---

## 📖 Tổng Quan

Module Bảo Mật cung cấp các API để quản lý:
- **Forgot Password**: Gửi email reset password
- **Reset Password**: Đặt lại mật khẩu bằng token
- **Change Password**: Đổi mật khẩu khi đã đăng nhập
- **Two-Factor Authentication (2FA)**: Bảo mật 2 lớp

### Base URL
```
http://localhost:3000/auth
```

### Authentication
- Hầu hết endpoints yêu cầu Bearer Token (trừ Forgot/Reset Password)
- Token được lấy từ `localStorage.getItem("token")`

---

## 🔌 API Endpoints

### 1. Forgot Password (Quên Mật Khẩu)

**Endpoint:** `POST /auth/forgot-password`

**Authentication:** Không cần (Public endpoint)

**Description:** Gửi email chứa link reset password đến email của user

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Request:**
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "HttpCode": 200,
  "success": true,
  "message": "Password reset link has been sent to your email",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

**Error Responses:**

- `400 Bad Request`: Email không hợp lệ
```json
{
  "HttpCode": 400,
  "success": false,
  "message": "Please provide a valid email address",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

- `404 Not Found`: Email không tồn tại trong hệ thống
```json
{
  "HttpCode": 404,
  "success": false,
  "message": "Email not found",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

**Note:** 
- Backend sẽ gửi email chứa reset token
- Token thường có thời hạn (ví dụ: 1 giờ)
- Link reset có format: `http://localhost:3001/reset-password?token={resetToken}`

---

### 2. Reset Password (Đặt Lại Mật Khẩu)

**Endpoint:** `POST /auth/reset-password`

**Authentication:** Không cần (Public endpoint, nhưng cần token từ email)

**Description:** Đặt lại mật khẩu mới bằng reset token nhận được từ email

**Request Body:**
```json
{
  "token": "abc123xyz789",
  "newPassword": "NewSecurePassword123!"
}
```

**Request:**
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "abc123xyz789",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "HttpCode": 200,
  "success": true,
  "message": "Password has been reset successfully",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

**Error Responses:**

- `400 Bad Request`: Token hoặc password không hợp lệ
```json
{
  "HttpCode": 400,
  "success": false,
  "message": "Reset token is required",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

```json
{
  "HttpCode": 400,
  "success": false,
  "message": "Password must be at least 6 characters long",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

- `401 Unauthorized`: Token không hợp lệ hoặc đã hết hạn
```json
{
  "HttpCode": 401,
  "success": false,
  "message": "Invalid or expired reset token",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

**Validation Rules:**
- `token`: Required, string
- `newPassword`: Required, string, minimum 6 characters

---

### 3. Change Password (Đổi Mật Khẩu)

**Endpoint:** `PUT /users/me/password` hoặc `POST /auth/change-password`

**Authentication:** Required (Bearer Token)

**Description:** Đổi mật khẩu khi user đã đăng nhập (cần nhập mật khẩu cũ)

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

**Request:**
```http
POST /auth/change-password
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "HttpCode": 200,
  "success": true,
  "message": "Password has been changed successfully",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

**Error Responses:**

- `400 Bad Request`: Mật khẩu không hợp lệ
```json
{
  "HttpCode": 400,
  "success": false,
  "message": "Password must be at least 6 characters long",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

- `401 Unauthorized`: Mật khẩu hiện tại không đúng
```json
{
  "HttpCode": 401,
  "success": false,
  "message": "Current password is incorrect",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

**Note:** 
- Endpoint này có thể chưa được implement trong backend
- Có thể sử dụng `PUT /users/{id}` với password field như một workaround (không khuyến khích)

---

### 4. Generate 2FA Secret (Tạo Secret cho 2FA)

**Endpoint:** `POST /auth/2fa/generate`

**Authentication:** Required (Bearer Token)

**Description:** Tạo TOTP secret và otpauth URL để setup 2FA

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
    "secret": "NB2W45DFOIZA====",
    "otpauthUrl": "otpauth://totp/WebTechnology:user@example.com?secret=NB2W45DFOIZA====&issuer=WebTechnology"
  },
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

**Error Responses:**

- `401 Unauthorized`: Token không hợp lệ
- `500 Internal Server Error`: Lỗi server

**Note:**
- Secret được lưu tạm thời trong database nhưng 2FA chưa được enable
- Cần gọi `enable` endpoint để kích hoạt 2FA

---

### 5. Get 2FA QR Code (Lấy QR Code)

**Endpoint:** `POST /auth/2fa/qrcode`

**Authentication:** Required (Bearer Token)

**Description:** Tạo QR code PNG từ otpauth URL để user scan bằng authenticator app

**Request Body:**
```json
{
  "otpauthUrl": "otpauth://totp/WebTechnology:user@example.com?secret=NB2W45DFOIZA====&issuer=WebTechnology"
}
```

**Request:**
```http
POST /auth/2fa/qrcode
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "otpauthUrl": "otpauth://totp/WebTechnology:user@example.com?secret=NB2W45DFOIZA====&issuer=WebTechnology"
}
```

**Response (200 OK):**
- **Content-Type:** `image/png`
- **Body:** PNG image binary data

**Error Responses:**

- `400 Bad Request`: Thiếu otpauthUrl
```json
{
  "HttpCode": 400,
  "success": false,
  "message": "otpauthUrl is required",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

- `401 Unauthorized`: Token không hợp lệ

**Note:**
- Response là PNG image, không phải JSON
- Frontend cần xử lý như blob và hiển thị bằng `<img>` tag

---

### 6. Enable 2FA (Kích Hoạt 2FA)

**Endpoint:** `POST /auth/2fa/enable`

**Authentication:** Required (Bearer Token)

**Description:** Kích hoạt 2FA sau khi user đã scan QR code và nhập TOTP code để verify

**Request Body:**
```json
{
  "code": "123456"
}
```

**Request:**
```http
POST /auth/2fa/enable
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "code": "123456"
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

- `400 Bad Request`: Secret chưa được generate
```json
{
  "HttpCode": 400,
  "success": false,
  "message": "2FA secret not generated",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

- `401 Unauthorized`: TOTP code không hợp lệ
```json
{
  "HttpCode": 401,
  "success": false,
  "message": "Invalid two-factor code",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

**Flow:**
1. User gọi `generate` để lấy secret và otpauthUrl
2. User scan QR code bằng authenticator app (Google Authenticator, Authy, etc.)
3. User nhập TOTP code từ app
4. User gọi `enable` với code để verify và kích hoạt

---

### 7. Disable 2FA (Tắt 2FA)

**Endpoint:** `POST /auth/2fa/disable`

**Authentication:** Required (Bearer Token)

**Description:** Tắt 2FA cho user hiện tại

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

**Note:**
- Sau khi disable, `totpSecret` sẽ bị xóa (`null`)
- User có thể enable lại bằng cách generate secret mới

---

## 📊 Data Structure

### ForgotPasswordDto

```typescript
interface ForgotPasswordDto {
  email: string;  // Required, valid email format
}
```

### ResetPasswordDto

```typescript
interface ResetPasswordDto {
  token: string;        // Required, reset token from email
  newPassword: string;  // Required, minimum 6 characters
}
```

### ChangePasswordDto (Recommended)

```typescript
interface ChangePasswordDto {
  currentPassword: string;  // Required, current password
  newPassword: string;      // Required, minimum 6 characters
}
```

### VerifyTotpDto

```typescript
interface VerifyTotpDto {
  code: string;  // Required, 6-digit TOTP code
}
```

### QrDto

```typescript
interface QrDto {
  otpauthUrl: string;  // Required, otpauth URL from generate endpoint
}
```

### 2FA Generate Response

```typescript
interface Generate2FAResponse {
  secret: string;      // TOTP secret (base32 encoded)
  otpauthUrl: string; // otpauth:// URL for QR code
}
```

---

## 💻 Implementation Guide

### Bước 1: Cập Nhật AuthService

File `src/services/authService.js` hoặc `src/services/api.js`:

```javascript
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

export const securityService = {
  // Forgot Password
  async forgotPassword(email) {
    const response = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send reset link");
    }

    return response.json();
  },

  // Reset Password
  async resetPassword(token, newPassword) {
    const response = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to reset password");
    }

    return response.json();
  },

  // Change Password (if implemented)
  async changePassword(currentPassword, newPassword) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/auth/change-password`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to change password");
    }

    return response.json();
  },

  // Generate 2FA Secret
  async generate2FASecret() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/auth/2fa/generate`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate 2FA secret");
    }

    return response.json();
  },

  // Get 2FA QR Code
  async get2FAQRCode(otpauthUrl) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/auth/2fa/qrcode`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ otpauthUrl }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch (e) {
        error = { message: errorText || "Failed to get QR code" };
      }
      throw new Error(error.message || "Failed to get QR code");
    }

    // Response is PNG image, return as blob URL
    const imageBlob = await response.blob();
    return URL.createObjectURL(imageBlob);
  },

  // Enable 2FA
  async enable2FA(totpCode) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/auth/2fa/enable`, {
      method: "POST",
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to disable 2FA");
    }

    return response.json();
  },
};
```

---

## 💡 Code Examples

### Example 1: Forgot Password Flow

```javascript
import { securityService } from "../services/securityService";
import { toast } from "react-toastify";

const handleForgotPassword = async (email) => {
  try {
    setLoading(true);
    setError(null);

    await securityService.forgotPassword(email);
    
    toast.success("Password reset link has been sent to your email");
    // Redirect to login or show success message
    navigate("/login");
  } catch (error) {
    setError(error.message);
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Example 2: Reset Password Flow

```javascript
import { useSearchParams } from "react-router-dom";
import { securityService } from "../services/securityService";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Get token from URL
    const token = searchParams.get("token");
    if (!token) {
      setError("Invalid reset link");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await securityService.resetPassword(token, password);
      
      toast.success("Password has been reset successfully");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Form JSX...
  );
};
```

### Example 3: Enable 2FA Flow

```javascript
import { securityService } from "../services/securityService";
import { useState } from "react";

const TwoFactorAuth = () => {
  const [secret, setSecret] = useState(null);
  const [otpauthUrl, setOtpauthUrl] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Generate secret
  const handleGenerateSecret = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await securityService.generate2FASecret();
      const { secret, otpauthUrl } = response.data;

      setSecret(secret);
      setOtpauthUrl(otpauthUrl);

      // Step 2: Get QR code
      const qrUrl = await securityService.get2FAQRCode(otpauthUrl);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Enable 2FA
  const handleEnable2FA = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await securityService.enable2FA(totpCode);
      
      toast.success("Two-factor authentication enabled successfully");
      // Refresh user data or redirect
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {!secret ? (
        <Button onClick={handleGenerateSecret} disabled={loading}>
          Generate 2FA Secret
        </Button>
      ) : (
        <>
          {qrCodeUrl && (
            <img src={qrCodeUrl} alt="2FA QR Code" />
          )}
          <TextField
            label="Enter 6-digit code"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            inputProps={{ maxLength: 6 }}
          />
          <Button onClick={handleEnable2FA} disabled={loading}>
            Enable 2FA
          </Button>
        </>
      )}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
};
```

### Example 4: Disable 2FA

```javascript
const handleDisable2FA = async () => {
  if (!window.confirm("Are you sure you want to disable 2FA?")) {
    return;
  }

  try {
    setLoading(true);
    setError(null);

    await securityService.disable2FA();
    
    toast.success("Two-factor authentication disabled");
    // Refresh user data
  } catch (error) {
    setError(error.message);
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Example 5: Change Password (if implemented)

```javascript
const handleChangePassword = async (currentPassword, newPassword) => {
  // Validation
  if (newPassword.length < 6) {
    setError("Password must be at least 6 characters");
    return;
  }

  try {
    setLoading(true);
    setError(null);

    await securityService.changePassword(currentPassword, newPassword);
    
    toast.success("Password changed successfully");
    // Clear form or redirect
  } catch (error) {
    setError(error.message);
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};
```

---

## ⚠️ Error Handling

### Common Error Scenarios

#### 1. Forgot Password Errors

```javascript
try {
  await securityService.forgotPassword(email);
} catch (error) {
  if (error.message.includes("not found")) {
    // Email không tồn tại - nhưng không nên reveal điều này cho attacker
    toast.success("If email exists, reset link has been sent");
  } else if (error.message.includes("valid email")) {
    toast.error("Please enter a valid email address");
  } else {
    toast.error("Failed to send reset link. Please try again.");
  }
}
```

#### 2. Reset Password Errors

```javascript
try {
  await securityService.resetPassword(token, newPassword);
} catch (error) {
  if (error.message.includes("expired") || error.message.includes("Invalid")) {
    toast.error("Reset link is invalid or expired. Please request a new one.");
    navigate("/forgot-password");
  } else if (error.message.includes("6 characters")) {
    toast.error("Password must be at least 6 characters long");
  } else {
    toast.error("Failed to reset password. Please try again.");
  }
}
```

#### 3. 2FA Errors

```javascript
try {
  await securityService.enable2FA(totpCode);
} catch (error) {
  if (error.message.includes("Invalid")) {
    toast.error("Invalid code. Please check your authenticator app and try again.");
  } else if (error.message.includes("not generated")) {
    toast.error("Please generate 2FA secret first");
  } else {
    toast.error("Failed to enable 2FA. Please try again.");
  }
}
```

### Error Response Structure

Tất cả endpoints trả về format chuẩn:

```json
{
  "HttpCode": 400,
  "success": false,
  "message": "Error message here",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

---

## ✅ Best Practices

### 1. Security Best Practices

- ✅ **Rate Limiting**: Implement rate limiting cho forgot password (tránh spam)
- ✅ **Token Expiry**: Reset token nên có thời hạn (ví dụ: 1 giờ)
- ✅ **Password Strength**: Validate password strength ở frontend và backend
- ✅ **HTTPS Only**: Luôn sử dụng HTTPS trong production
- ✅ **Token Storage**: Không lưu reset token trong localStorage
- ✅ **Email Verification**: Verify email trước khi gửi reset link

### 2. UX Best Practices

- ✅ **Loading States**: Hiển thị loading khi đang xử lý
- ✅ **Success Messages**: Hiển thị message rõ ràng khi thành công
- ✅ **Error Messages**: Hiển thị error message cụ thể và actionable
- ✅ **Password Strength Indicator**: Hiển thị độ mạnh của password
- ✅ **QR Code Display**: Hiển thị QR code rõ ràng, có thể zoom
- ✅ **Copy Secret**: Cho phép copy secret để nhập thủ công

### 3. Password Validation

```javascript
const validatePassword = (password) => {
  const errors = [];

  if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (password.length < 8) {
    errors.push("Consider using at least 8 characters for better security");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Add lowercase letters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Add uppercase letters");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Add numbers");
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Add special characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: calculateStrength(password),
  };
};

const calculateStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*]/.test(password)) strength++;
  return Math.min(5, strength);
};
```

### 4. 2FA Best Practices

- ✅ **Generate Secret First**: Luôn generate secret trước khi enable
- ✅ **Verify Code**: Luôn verify code trước khi enable
- ✅ **Show Backup Codes**: Cung cấp backup codes (nếu có)
- ✅ **Clear Instructions**: Hướng dẫn rõ ràng cách scan QR code
- ✅ **Test Before Enable**: Cho phép test code trước khi enable

---

## 🔒 Security Considerations

### 1. Password Security

- **Hashing**: Backend sử dụng bcrypt với salt rounds = 10
- **Never Store Plain Text**: Không bao giờ lưu password dạng plain text
- **Password History**: Có thể implement để tránh reuse password cũ
- **Password Complexity**: Enforce password complexity rules

### 2. Token Security

- **Reset Token**: 
  - Random, cryptographically secure
  - Single-use (invalidate sau khi dùng)
  - Time-limited (expire sau 1 giờ)
  - Không expose trong logs

- **JWT Token**:
  - Access token: 15 phút expiry
  - Refresh token: 7 ngày expiry
  - Stored in httpOnly cookies (recommended) hoặc localStorage

### 3. 2FA Security

- **TOTP Secret**: 
  - Generated server-side
  - Base32 encoded
  - Stored hashed trong database
  - Never expose trong API response

- **QR Code**:
  - Generated on-demand
  - Not cached
  - Display only once

### 4. Rate Limiting

Implement rate limiting cho:
- Forgot password: Max 3 requests per hour per IP
- Reset password: Max 5 attempts per token
- 2FA enable: Max 5 attempts per session
- Login: Max 5 attempts per 15 minutes

### 5. Email Security

- **Email Verification**: Verify email ownership trước khi gửi reset link
- **Email Content**: Không expose reset token trong email preview
- **Link Expiry**: Reset link có expiry time
- **HTTPS**: Luôn sử dụng HTTPS cho reset links

---

## 🔄 Complete Flow Examples

### Flow 1: Forgot Password → Reset Password

```
1. User clicks "Forgot Password"
   ↓
2. User enters email
   ↓
3. Frontend calls POST /auth/forgot-password
   ↓
4. Backend sends email with reset link
   ↓
5. User clicks link in email
   ↓
6. Frontend navigates to /reset-password?token={token}
   ↓
7. User enters new password
   ↓
8. Frontend calls POST /auth/reset-password
   ↓
9. Backend validates token and updates password
   ↓
10. User redirected to login page
```

### Flow 2: Enable 2FA

```
1. User navigates to Security Settings
   ↓
2. User clicks "Enable 2FA"
   ↓
3. Frontend calls POST /auth/2fa/generate
   ↓
4. Backend returns secret and otpauthUrl
   ↓
5. Frontend calls POST /auth/2fa/qrcode with otpauthUrl
   ↓
6. Backend returns PNG QR code
   ↓
7. Frontend displays QR code
   ↓
8. User scans QR code with authenticator app
   ↓
9. User enters 6-digit code from app
   ↓
10. Frontend calls POST /auth/2fa/enable with code
   ↓
11. Backend verifies code and enables 2FA
   ↓
12. Frontend shows success message
```

### Flow 3: Login with 2FA (Chuẩn 2 bước)

```
1. User enters email and password
   ↓
2. Frontend calls POST /auth/login với body:
   { "email": "...", "password": "..." }
   ↓
3. Backend kiểm tra email + password
   ↓
4. Nếu user có bật 2FA:
     → Backend trả về 200 với payload:
       {
         "HttpCode": 200,
         "success": true,
         "requires2FA": true,
         "message": "Two-factor code is required",
         "data": {
           "email": "user@example.com",
           "hasTwoFactorEnabled": true
         }
       }
   ↓
5. Frontend hiển thị màn hình nhập mã 2FA (không lưu token, chưa coi là login thành công)
   ↓
6. User nhập TOTP code (6 số từ app Authenticator)
   ↓
7. Frontend gọi lại POST /auth/login với body:
   { "email": "...", "password": "...", "totpCode": "123456" }
   ↓
8. Backend verify TOTP code (so sánh với secret đã lưu)
   ↓
9. Nếu mã hợp lệ → Backend trả về:
     {
       "access_token": "...",
       "refresh_token": "..."
     }
   ↓
10. Frontend lưu token, user info và redirect tới dashboard
```

---

## 📝 Response Format

### Standard Success Response

```json
{
  "HttpCode": 200,
  "success": true,
  "data": {...},  // Optional, depends on endpoint
  "message": "...", // Optional
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

### Standard Error Response

```json
{
  "HttpCode": 400,
  "success": false,
  "message": "Error message here",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

---

## 🧪 Testing Checklist

- [ ] Forgot password với email hợp lệ
- [ ] Forgot password với email không tồn tại (không reveal)
- [ ] Reset password với token hợp lệ
- [ ] Reset password với token hết hạn
- [ ] Reset password với password quá ngắn
- [ ] Generate 2FA secret thành công
- [ ] Get QR code thành công
- [ ] Enable 2FA với code hợp lệ
- [ ] Enable 2FA với code không hợp lệ
- [ ] Disable 2FA thành công
- [ ] Login với 2FA enabled
- [ ] Login với 2FA disabled
- [ ] Error handling cho tất cả endpoints
- [ ] Loading states hiển thị đúng
- [ ] Success messages hiển thị đúng

---

## 📚 Related Documentation

- [2FA Integration Guide](./2FA_INTEGRATION_GUIDE.md) - Chi tiết về 2FA
- [Audit Log Guide](./AUDIT_LOG_INTEGRATION_GUIDE.md) - Audit logging
- [Authentication Guide](./AUTH_API_GUIDE.md) - Login, Register, OAuth

---

## 🆘 Support

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Backend có đang chạy không?
2. Token có hợp lệ không? (cho authenticated endpoints)
3. Email service có được config đúng không? (cho forgot password)
4. Network tab trong DevTools để xem request/response
5. Console logs để debug

---

**Last Updated:** 2026-01-12
**Version:** 1.0.0
