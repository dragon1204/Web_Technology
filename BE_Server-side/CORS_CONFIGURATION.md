# 🔒 Cấu Hình CORS

## ❌ Vấn Đề

Lỗi CORS xảy ra khi:
- Frontend chạy ở `http://localhost:3000`
- Backend chỉ cho phép `http://localhost:3001`

**Lỗi:**
```
Access to XMLHttpRequest at 'http://159.223.61.25:3000/auth/login' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
The 'Access-Control-Allow-Origin' header has a value 'http://localhost:3001' 
that is not equal to the supplied origin.
```

## ✅ Giải Pháp

### 1. Development (Mặc định)

Backend **tự động cho phép** các origins sau:
- `http://localhost:3000`
- `http://localhost:3001`

**Không cần cấu hình gì thêm!** Chỉ cần restart backend.

### 2. Production (Qua Environment Variable)

Thêm vào file `.env`:

```env
# Cho phép một origin
CORS_ORIGIN="https://yourdomain.com"

# Cho phép nhiều origins (phân cách bằng dấu phẩy)
CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com,https://admin.yourdomain.com"

# Cho phép tất cả origins (KHÔNG KHUYẾN NGHỊ cho production)
CORS_ORIGIN="*"
```

### 3. Cấu Hình Hiện Tại

File: `src/main.ts`

```typescript
// CORS Configuration
const corsOrigin = configService.get<string>('CORS_ORIGIN');
const allowedOrigins = corsOrigin 
  ? corsOrigin.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001']; // Default

app.enableCors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});
```

## 🚀 Cách Sử Dụng

### Development

1. **Không cần làm gì** - Backend tự động cho phép `localhost:3000` và `localhost:3001`

2. Restart backend:
   ```bash
   npm run start:dev
   ```

3. Test lại frontend - lỗi CORS sẽ biến mất!

### Production

1. **Cập nhật `.env` trên server:**
   ```bash
   cd /var/web/Web_Technology/BE_Server-side
   nano .env
   ```

2. **Thêm hoặc sửa:**
   ```env
   CORS_ORIGIN="https://your-frontend-domain.com"
   ```

3. **Restart backend:**
   ```bash
   pm2 restart all
   # hoặc
   npm run start:prod
   ```

## 📝 Ví Dụ

### Ví dụ 1: Frontend ở localhost:3000
```env
# Không cần CORS_ORIGIN (dùng default)
# Backend tự động cho phép localhost:3000
```

### Ví dụ 2: Frontend ở domain riêng
```env
CORS_ORIGIN="https://myapp.com"
```

### Ví dụ 3: Nhiều frontends
```env
CORS_ORIGIN="https://myapp.com,https://admin.myapp.com,https://mobile.myapp.com"
```

### Ví dụ 4: Development + Production
```env
# Development
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"

# Production
CORS_ORIGIN="https://myapp.com"
```

## 🔍 Kiểm Tra

### Test CORS với cURL

```bash
# Test preflight request
curl -X OPTIONS http://159.223.61.25:3000/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Kiểm tra header Access-Control-Allow-Origin trong response
```

### Test từ Browser Console

```javascript
fetch('http://159.223.61.25:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email: 'test@test.com', password: 'test' })
})
.then(res => console.log('Success:', res))
.catch(err => console.error('CORS Error:', err));
```

## ⚠️ Lưu Ý

1. **Không dùng `*` cho production** - Không an toàn, cho phép mọi domain
2. **Luôn chỉ định rõ ràng** các domains được phép
3. **Restart backend** sau khi thay đổi `.env`
4. **Kiểm tra firewall** nếu vẫn không kết nối được

## 🐛 Troubleshooting

### Vẫn bị lỗi CORS?

1. **Kiểm tra `.env` có `CORS_ORIGIN` không:**
   ```bash
   cat .env | grep CORS_ORIGIN
   ```

2. **Kiểm tra backend đã restart chưa:**
   ```bash
   # Xem logs
   pm2 logs
   # hoặc
   npm run start:dev
   ```

3. **Kiểm tra origin trong browser:**
   - Mở DevTools → Network tab
   - Xem request headers → `Origin: http://localhost:3000`
   - Xem response headers → `Access-Control-Allow-Origin: http://localhost:3000`

4. **Clear browser cache:**
   - Hard refresh: `Ctrl + Shift + R` (Windows) hoặc `Cmd + Shift + R` (Mac)

## 📚 Tham Khảo

- [NestJS CORS Documentation](https://docs.nestjs.com/security/cors)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)


