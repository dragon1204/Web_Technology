# 📖 Hướng Dẫn Call API - Frontend

## 🎯 Bắt Đầu Nhanh

### 1. Import API Functions

```javascript
import { 
  authAPI, 
  gardenAPI, 
  vegetableAPI,
  notificationAPI,
  alertsAPI,
  analyticsAPI
} from "../services/api";
```

### 2. Call API

```javascript
// Ví dụ: Lấy danh sách vườn
const response = await gardenAPI.getAll();
const gardens = response.data?.data || response.data || [];
```

---

## 📦 Response Format

Backend có `TransformResponseInterceptor` nên response có format:

```json
{
  "HttpCode": 200,
  "success": true,
  "data": { ... },  // ⚠️ Dữ liệu thực tế ở đây
  "timestamp": "2024-12-20T10:00:00.000Z"
}
```

**Quan trọng:** 
- Dữ liệu thực tế nằm trong `response.data.data`
- Nếu không có `.data.data`, thử `response.data`
- Luôn có fallback: `response.data?.data || response.data || []`

---

## ✅ Ví Dụ Đúng vs Sai

### ❌ SAI

```javascript
// Không xử lý response format
const response = await gardenAPI.getAll();
const gardens = response.data; // Có thể undefined hoặc không đúng

// Không có error handling
const gardens = await gardenAPI.getAll();
```

### ✅ ĐÚNG

```javascript
// Có xử lý response format và error
try {
  const response = await gardenAPI.getAll();
  const gardens = response.data?.data || response.data || [];
  setGardens(Array.isArray(gardens) ? gardens : []);
} catch (error) {
  console.error("Error:", error);
  setError(error.response?.data?.message || "Lỗi");
}
```

---

## 🔑 Authentication Flow

### 1. Login

```javascript
import { authAPI } from "../services/api";

try {
  const response = await authAPI.login("admin@example.com", "password123");
  
  // Lưu token (kiểm tra cả 2 format)
  const token = response.data?.data?.access_token || response.data?.access_token;
  if (token) {
    localStorage.setItem("token", token);
  }
  
  // Lưu user info nếu có
  const user = response.data?.data?.user || response.data?.user;
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
  
  navigate("/dashboard");
} catch (error) {
  console.error("Login failed:", error);
}
```

### 2. Token Tự Động

Token tự động được thêm vào mọi request qua interceptor. Không cần thêm thủ công.

---

## 📚 Tài Liệu Chi Tiết

- **FRONTEND_API_GUIDE.md** - Hướng dẫn đầy đủ tất cả APIs
- **API_USAGE_EXAMPLES.md** - Ví dụ code cụ thể
- **TROUBLESHOOTING_API.md** - Sửa lỗi thường gặp
- **QUICK_API_REFERENCE.md** - Quick reference

---

## 🚀 Test Ngay

1. **Start Backend:**
   ```bash
   cd BE_Server-side
   npm run start:dev
   ```

2. **Start Frontend:**
   ```bash
   cd FE_web_application/fe_dashboard
   npm start
   ```

3. **Login:**
   - Email: `admin@example.com`
   - Password: `password123`

4. **Test API trong Console:**
   ```javascript
   // Mở browser console và test
   import { gardenAPI } from "./src/services/api";
   const response = await gardenAPI.getAll();
   console.log(response);
   ```

---

## ⚠️ Checklist Trước Khi Call API

- [ ] Backend đang chạy ở `http://localhost:3000`
- [ ] Frontend đang chạy (thường `http://localhost:3001`)
- [ ] Đã login và có token trong localStorage
- [ ] Đã import API function cần dùng
- [ ] Đã xử lý response format (`response.data?.data`)
- [ ] Đã có error handling (try-catch)
- [ ] Đã có loading state
- [ ] Đã kiểm tra quyền truy cập (Admin/User)

---

Nếu gặp vấn đề, xem **TROUBLESHOOTING_API.md**!


