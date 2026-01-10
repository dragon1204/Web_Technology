# OAuth Google Setup Guide

## 🔐 OAuth là gì?

**OAuth (Open Authorization)** là một giao thức ủy quyền mở cho phép người dùng đăng nhập vào ứng dụng của bạn thông qua các dịch vụ bên thứ ba như Google, Facebook, GitHub mà không cần chia sẻ mật khẩu.

### Lợi ích của OAuth:

- **Bảo mật cao**: Không cần lưu trữ mật khẩu người dùng
- **Trải nghiệm tốt**: Đăng nhập nhanh chóng với tài khoản có sẵn
- **Tin cậy**: Sử dụng hệ thống xác thực của các nhà cung cấp lớn
- **Thông tin chính xác**: Lấy thông tin đã được xác minh từ Google

## 🚀 Cách hoạt động của Google OAuth

```
1. User clicks "Continue with Google"
2. Redirect to Google OAuth page
3. User logs in with Google account
4. Google redirects back with authorization code
5. Backend exchanges code for access token
6. Backend gets user info from Google
7. Backend creates/updates user in database
8. Backend returns JWT token to frontend
9. Frontend stores token and redirects to dashboard
```

## ⚙️ Cấu hình Backend (NestJS)

### 1. Cài đặt dependencies

```bash
npm install passport-google-oauth20 @nestjs/passport
```

### 2. Tạo Google OAuth App

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Bật Google+ API
4. Tạo OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/auth/google/redirect`

### 3. Cấu hình Environment Variables

Thêm vào file `.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 4. Google Strategy (đã có sẵn)

File: `BE_Server-side/src/modules/auth/strategy/google.strategy.ts`

```typescript
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/redirect",
      scope: ["email", "profile"],
    });
  }

  async validate(accessToken, refreshToken, profile, done) {
    const user = {
      provider: profile.provider,
      providerId: profile.id,
      email: profile.emails?.[0].value,
      name: profile.displayName,
      avatar: profile.photos?.[0].value,
      accessToken,
    };
    done(null, user);
  }
}
```

### 5. Auth Controller (đã có sẵn)

```typescript
@Get('google')
@UseGuards(AuthGuard('google'))
async googleAuth() {
  // Initiates Google OAuth flow
}

@Get('google/redirect')
@UseGuards(AuthGuard('google'))
async googleAuthRedirect(@Req() req) {
  return this.authService.googleLogin(req.user);
}
```

## 🎨 Frontend Implementation (React)

### 1. Google Login Button Component

File: `src/components/auth/GoogleLogin.jsx`

```jsx
const GoogleLogin = ({ onError, disabled }) => {
  const handleGoogleLogin = () => {
    const backendUrl =
      process.env.REACT_APP_API_URL || "http://159.223.61.25:3000";
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <Button onClick={handleGoogleLogin} disabled={disabled}>
      <GoogleIcon /> Continue with Google
    </Button>
  );
};
```

### 2. OAuth Callback Handler

File: `src/components/auth/OAuthCallback.jsx`

```jsx
const OAuthCallback = () => {
  useEffect(() => {
    // Handle OAuth callback
    // Extract token from URL or make API call
    // Redirect to dashboard on success
  }, []);

  return <LoadingScreen />;
};
```

### 3. Integration in Login Page

```jsx
// In Login.jsx
import GoogleLogin from "../auth/GoogleLogin";

// Add to login form
<GoogleLogin onError={handleGoogleError} disabled={loading} />;
```

## 🔧 API Endpoints

### Backend Endpoints (đã có sẵn)

- `GET /auth/google` - Khởi tạo OAuth flow
- `GET /auth/google/redirect` - Callback URL từ Google
- `POST /auth/login` - Login thường
- `GET /auth/profile` - Lấy thông tin user

### Frontend API Service

```javascript
// In api.js
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
  googleRedirect: () => api.get("/auth/google/redirect"), // Không dùng trực tiếp
};
```

## 🛠️ Cấu hình Production

### 1. Update Redirect URLs

Trong Google Cloud Console, thêm production URLs:

```
https://yourdomain.com/auth/google/redirect
```

### 2. Environment Variables

```env
# Production
GOOGLE_CLIENT_ID=prod_client_id
GOOGLE_CLIENT_SECRET=prod_client_secret

# Frontend
REACT_APP_API_URL=https://api.yourdomain.com
```

### 3. CORS Configuration

Đảm bảo backend cho phép requests từ frontend domain:

```typescript
app.enableCors({
  origin: ["https://yourdomain.com", "http://localhost:3000"],
  credentials: true,
});
```

## 🔍 Debugging OAuth

### 1. Check Backend Logs

```bash
# Xem logs khi user login với Google
console.log("📥 Received user from Google OAuth:", req.user);
```

### 2. Verify Google Console Setup

- Client ID và Secret đúng
- Redirect URI chính xác
- APIs được bật

### 3. Network Tab

- Check redirect flow trong browser
- Verify callback URL được gọi
- Check token response

## 🚨 Security Best Practices

### 1. Environment Variables

- Không commit credentials vào git
- Sử dụng different credentials cho dev/prod
- Rotate secrets định kỳ

### 2. Token Security

```javascript
// Secure token storage
localStorage.setItem("token", token); // OK for demo
// Production: Use httpOnly cookies
```

### 3. HTTPS Only

- Production phải dùng HTTPS
- Secure cookies
- CSRF protection

## 📱 User Experience

### 1. Loading States

```jsx
{
  loading && <CircularProgress />;
}
```

### 2. Error Handling

```jsx
{
  error && <Alert severity="error">{error}</Alert>;
}
```

### 3. Fallback Options

- Vẫn có form login thường
- Clear error messages
- Retry mechanisms

## 🎯 Testing OAuth

### 1. Development Testing

```bash
# Start backend
cd BE_Server-side
npm run start:dev

# Start frontend
cd FE_web_application/fe_dashboard
npm start
```

### 2. Test Flow

1. Click "Continue with Google"
2. Login with Google account
3. Verify redirect to dashboard
4. Check user data in localStorage
5. Test logout and re-login

### 3. Error Scenarios

- Invalid credentials
- Network errors
- Cancelled OAuth flow
- Missing permissions

## 📋 Checklist

### Backend Setup

- [ ] Google OAuth credentials configured
- [ ] Environment variables set
- [ ] Strategy implemented
- [ ] Controller endpoints working
- [ ] Database user creation/update

### Frontend Setup

- [ ] Google Login component created
- [ ] OAuth callback handler implemented
- [ ] Login page updated
- [ ] Routes configured
- [ ] Error handling added

### Testing

- [ ] OAuth flow works end-to-end
- [ ] User data stored correctly
- [ ] Error cases handled
- [ ] Production URLs configured
- [ ] Security measures in place

## 🔗 Useful Links

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Passport Google OAuth20 Strategy](https://www.passportjs.org/packages/passport-google-oauth20/)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)

OAuth Google đã được tích hợp hoàn chỉnh vào hệ thống! 🎉
