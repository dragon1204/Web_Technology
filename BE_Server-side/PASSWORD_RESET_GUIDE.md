# 🔐 Password Reset & Forgot Password Guide

## 📋 Tổng Quan

Đã thêm chức năng **Forgot Password** và **Reset Password** vào hệ thống authentication.

## 🚀 API Endpoints

### 1. Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Throttle:** 3 requests per minute

**Mô tả:**
- Tạo reset token ngẫu nhiên (32 bytes hex)
- Lưu token và expiry time (1 giờ) vào database
- Log reset URL (trong development)
- Trong production, nên gửi email với reset link

### 2. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "token": "abc123xyz789...",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "message": "Password has been reset successfully. Please login with your new password."
}
```

**Throttle:** 5 requests per minute

**Mô tả:**
- Validate reset token
- Kiểm tra token chưa hết hạn (1 giờ)
- Hash và cập nhật password mới
- Xóa reset token và invalidate tất cả refresh tokens

## 📊 Database Schema

Đã thêm 2 fields vào `User` model:

```prisma
model User {
  // ... existing fields
  resetToken         String?
  resetTokenExpiry   DateTime?
}
```

## 🔧 Implementation Details

### Files Created/Modified

1. **DTOs:**
   - `src/modules/auth/dto/forgot-password.dto.ts`
   - `src/modules/auth/dto/reset-password.dto.ts`

2. **Service:**
   - `src/modules/auth/auth.service.ts` - Added `forgotPassword()` and `resetPassword()` methods

3. **Controller:**
   - `src/modules/auth/auth.controller.ts` - Added 2 new endpoints

4. **Users Service:**
   - `src/modules/users/users.service.ts` - Added `findUserByResetToken()` method

5. **Schema:**
   - `prisma/schema.prisma` - Added `resetToken` and `resetTokenExpiry` fields

## 🔒 Security Features

1. **Rate Limiting:**
   - Forgot password: 3 requests/minute
   - Reset password: 5 requests/minute

2. **Token Expiry:**
   - Reset token expires after 1 hour

3. **Email Enumeration Prevention:**
   - Always returns same success message regardless of email existence

4. **Token Invalidation:**
   - All refresh tokens are cleared after password reset

5. **Secure Token Generation:**
   - Uses `crypto.randomBytes(32)` for secure random tokens

## 📧 Email Integration (TODO)

Hiện tại reset token được log ra console. Trong production, cần:

1. **Cài đặt email service** (Nodemailer, SendGrid, etc.)
2. **Cấu hình SMTP** trong `.env`
3. **Tạo email template** cho reset password
4. **Gửi email** với reset link

**Example:**
```typescript
// In auth.service.ts forgotPassword()
const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
await this.emailService.sendPasswordResetEmail(user.email, resetUrl);
```

## 🧪 Testing

### Test Forgot Password

```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Test Reset Password

```bash
# 1. Get token from forgot-password response (check console logs)
# 2. Use token to reset password

curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_RESET_TOKEN_HERE",
    "newPassword": "NewPassword123!"
  }'
```

## 📝 Frontend Integration

### Forgot Password Flow

1. User enters email → Call `POST /auth/forgot-password`
2. Show success message (don't reveal if email exists)
3. User checks email for reset link
4. User clicks link → Navigate to reset password page with token in URL
5. User enters new password → Call `POST /auth/reset-password`
6. Show success → Redirect to login page

### Example Frontend Code

```typescript
// Forgot Password
const handleForgotPassword = async (email: string) => {
  const response = await fetch('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  alert(data.message);
};

// Reset Password
const handleResetPassword = async (token: string, newPassword: string) => {
  const response = await fetch('/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await response.json();
  if (response.ok) {
    alert(data.message);
    // Redirect to login
  }
};
```

## ⚠️ Important Notes

1. **Reset tokens are logged in development** - Remove console.log in production
2. **Email service not implemented** - Add email sending before production
3. **Frontend URL** - Set `FRONTEND_URL` in `.env` for reset links
4. **Token security** - Tokens are single-use and expire after 1 hour

## 🔄 Next Steps

1. ✅ Database schema updated
2. ✅ API endpoints created
3. ✅ Security measures implemented
4. ⏳ Email service integration (optional)
5. ⏳ Frontend implementation
6. ⏳ Add email templates
