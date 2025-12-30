# 🔧 Troubleshooting - Frontend API Calls

## ❌ Các Lỗi Thường Gặp và Cách Sửa

### 1. Lỗi: "Network Error" hoặc "ERR_CONNECTION_REFUSED"

**Triệu chứng:**
```
Error: Network Error
ERR_CONNECTION_REFUSED
```

**Nguyên nhân:**
- Backend chưa chạy
- Backend chạy ở port khác
- URL không đúng

**Giải pháp:**

1. **Kiểm tra backend đang chạy:**
   ```bash
   # Terminal backend
   cd BE_Server-side
   npm run start:dev
   ```
   Backend phải chạy ở `http://localhost:3000`

2. **Kiểm tra API_URL trong `api.js`:**
   ```javascript
   // src/services/api.js
   const API_URL = "http://localhost:3000"; // Đảm bảo đúng
   ```

3. **Test backend trực tiếp:**
   ```bash
   curl http://localhost:3000/auth/login
   # Hoặc mở browser: http://localhost:3000/api (Swagger)
   ```

---

### 2. Lỗi: "CORS Error" hoặc "Access-Control-Allow-Origin"

**Triệu chứng:**
```
Access to XMLHttpRequest at 'http://localhost:3000/...' from origin 'http://localhost:3001' 
has been blocked by CORS policy
```

**Nguyên nhân:**
- CORS chưa được config đúng
- Frontend chạy ở port khác với port được allow

**Giải pháp:**

1. **Kiểm tra CORS config trong backend:**
   ```typescript
   // BE_Server-side/src/main.ts
   app.enableCors({
     origin: 'http://localhost:3001', // Phải match với frontend port
     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
     credentials: true,
   });
   ```

2. **Kiểm tra frontend đang chạy ở port nào:**
   ```bash
   # Frontend thường chạy ở port 3000 hoặc 3001
   # Kiểm tra package.json hoặc terminal khi start
   ```

3. **Nếu frontend chạy ở port khác, sửa CORS:**
   ```typescript
   // Cho phép nhiều origins
   app.enableCors({
     origin: ['http://localhost:3001', 'http://localhost:3000'],
     // ...
   });
   ```

---

### 3. Lỗi: "401 Unauthorized"

**Triệu chứng:**
```
Request failed with status code 401
Unauthorized
```

**Nguyên nhân:**
- Token không có trong localStorage
- Token hết hạn
- Token không đúng format

**Giải pháp:**

1. **Kiểm tra token:**
   ```javascript
   // Trong browser console
   console.log(localStorage.getItem("token"));
   ```

2. **Login lại để lấy token mới:**
   ```javascript
   const response = await authAPI.login("admin@example.com", "password123");
   localStorage.setItem("token", response.data.access_token);
   ```

3. **Kiểm tra token format:**
   ```javascript
   // Token phải là string, không phải object
   const token = localStorage.getItem("token");
   console.log("Token type:", typeof token);
   console.log("Token value:", token);
   ```

4. **Kiểm tra interceptor:**
   ```javascript
   // api.js đã tự động thêm Bearer prefix
   // Không cần thêm thủ công
   ```

---

### 4. Lỗi: "403 Forbidden"

**Triệu chứng:**
```
Request failed with status code 403
Forbidden
```

**Nguyên nhân:**
- User không có quyền truy cập (không phải Admin)
- API yêu cầu quyền Admin nhưng user là USER

**Giải pháp:**

1. **Kiểm tra role của user:**
   ```javascript
   const user = JSON.parse(localStorage.getItem("user") || "{}");
   console.log("User role:", user.role);
   ```

2. **Login với Admin account:**
   ```javascript
   // Admin: admin@example.com / password123
   await authAPI.login("admin@example.com", "password123");
   ```

3. **Kiểm tra API có yêu cầu quyền gì:**
   - Xem trong API_DOCUMENTATION.md
   - Một số API chỉ dành cho Admin

---

### 5. Lỗi: "Cannot read property 'data' of undefined"

**Triệu chứng:**
```
TypeError: Cannot read property 'data' of undefined
```

**Nguyên nhân:**
- Response structure không như mong đợi
- Backend có response interceptor transform data
- Chưa kiểm tra null/undefined

**Giải pháp:**

1. **Kiểm tra response structure:**
   ```javascript
   try {
     const response = await gardenAPI.getAll();
     console.log("Full response:", response);
     console.log("Response.data:", response.data);
     console.log("Response.data.data:", response.data?.data);
   } catch (error) {
     console.error("Error:", error);
   }
   ```

2. **Sử dụng optional chaining và default values:**
   ```javascript
   // ✅ Đúng
   const data = response.data?.data || response.data || [];
   
   // ❌ Sai
   const data = response.data.data; // Có thể undefined
   ```

3. **Kiểm tra backend response interceptor:**
   - Backend có thể wrap response trong `{ data: ... }`
   - Cần truy cập `response.data.data` thay vì `response.data`

---

### 6. Lỗi: "400 Bad Request" - Validation Error

**Triệu chứng:**
```
Request failed with status code 400
Bad Request
Validation failed
```

**Nguyên nhân:**
- Dữ liệu gửi lên không đúng format
- Thiếu required fields
- Type không đúng (string thay vì number, etc.)

**Giải pháp:**

1. **Kiểm tra request body:**
   ```javascript
   console.log("Sending data:", data);
   ```

2. **Kiểm tra API documentation:**
   - Xem trong API_DOCUMENTATION.md
   - Xem required fields
   - Xem data types

3. **Ví dụ sửa lỗi:**
   ```javascript
   // ❌ Sai - area là string
   await gardenAPI.create({
     name: "Vườn A",
     area: "100.5" // String
   });
   
   // ✅ Đúng - area là number
   await gardenAPI.create({
     name: "Vườn A",
     area: 100.5 // Number
   });
   ```

---

### 7. Response Data Không Hiển Thị

**Triệu chứng:**
- API call thành công (status 200)
- Nhưng không có dữ liệu hiển thị
- Console không có lỗi

**Nguyên nhân:**
- Response structure khác với mong đợi
- Data nằm ở nested property
- Array rỗng nhưng code expect có data

**Giải pháp:**

1. **Log response để xem structure:**
   ```javascript
   const response = await gardenAPI.getAll();
   console.log("Response:", JSON.stringify(response, null, 2));
   ```

2. **Kiểm tra data structure:**
   ```javascript
   // Có thể là:
   response.data           // Direct data
   response.data.data      // Nested data
   response.data.results   // Results array
   response.data.items     // Items array
   ```

3. **Sử dụng với fallback:**
   ```javascript
   const gardens = 
     response.data?.data || 
     response.data?.results || 
     response.data?.items || 
     response.data || 
     [];
   ```

---

### 8. Token Tự Động Bị Xóa

**Triệu chứng:**
- Đang dùng app bình thường
- Đột nhiên bị redirect về login
- Token biến mất khỏi localStorage

**Nguyên nhân:**
- Response interceptor phát hiện 401
- Tự động xóa token và redirect

**Giải pháp:**

1. **Đây là tính năng, không phải bug:**
   - Khi token hết hạn (401), app tự động logout
   - User cần login lại

2. **Nếu muốn refresh token tự động:**
   - Xem phần "Refresh Token" trong FRONTEND_API_GUIDE.md
   - Implement auto refresh token

---

## 🔍 Debug Checklist

Khi API không hoạt động, kiểm tra:

- [ ] Backend đang chạy ở `http://localhost:3000`
- [ ] Frontend đang chạy (thường `http://localhost:3001`)
- [ ] CORS đã được config đúng
- [ ] Token có trong localStorage
- [ ] Token chưa hết hạn
- [ ] User có đúng quyền (Admin/User)
- [ ] Request body đúng format
- [ ] Response structure đúng như mong đợi
- [ ] Network tab không có lỗi
- [ ] Console không có lỗi JavaScript

---

## 🛠️ Debug Tools

### 1. Browser DevTools

```javascript
// Mở DevTools (F12)
// Tab Network:
// - Xem request được gửi
// - Xem response nhận về
// - Xem status code
// - Xem headers

// Tab Console:
// - Xem lỗi JavaScript
// - Log response data
```

### 2. Thêm Logging

```javascript
// Thêm vào api.js để log mọi request
api.interceptors.request.use((config) => {
  console.log("🚀 Request:", {
    method: config.method.toUpperCase(),
    url: config.url,
    data: config.data,
    headers: config.headers
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error("❌ Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);
```

### 3. Test API Trực Tiếp

```bash
# Test với curl
curl -X GET http://localhost:3000/garden \
  -H "Authorization: Bearer YOUR_TOKEN"

# Hoặc dùng Postman/Thunder Client
# Import từ API_DOCUMENTATION.md
```

---

## 📞 Quick Fixes

### Fix 1: Reset và Login Lại

```javascript
// Clear tất cả và login lại
localStorage.clear();
// Sau đó login lại
await authAPI.login("admin@example.com", "password123");
```

### Fix 2: Kiểm Tra Backend

```bash
# Terminal 1: Backend
cd BE_Server-side
npm run start:dev

# Terminal 2: Test
curl http://localhost:3000/api
# Nếu thấy Swagger UI => Backend OK
```

### Fix 3: Kiểm Tra Frontend

```bash
# Terminal: Frontend
cd FE_web_application/fe_dashboard
npm start
# Mở http://localhost:3001
```

### Fix 4: Kiểm Tra CORS

```javascript
// Thêm vào backend main.ts để allow tất cả (chỉ cho dev)
app.enableCors({
  origin: '*', // ⚠️ Chỉ dùng cho dev
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});
```

---

## ✅ Test API Đơn Giản

Tạo file test để kiểm tra API:

```javascript
// test-api.js (tạo trong frontend root)
import { authAPI, gardenAPI } from "./src/services/api";

async function testAPI() {
  try {
    // 1. Login
    console.log("1. Testing login...");
    const loginRes = await authAPI.login("admin@example.com", "password123");
    console.log("✅ Login success:", loginRes.data);
    
    // 2. Get gardens
    console.log("2. Testing get gardens...");
    const gardensRes = await gardenAPI.getAll();
    console.log("✅ Gardens:", gardensRes.data);
    
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testAPI();
```

---

## 🎯 Common Patterns

### Pattern 1: Fetch với Loading

```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction();
      setData(response.data?.data || response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### Pattern 2: Create với Form

```javascript
const [formData, setFormData] = useState({});
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  
  try {
    await apiFunction.create(formData);
    // Success - reset form hoặc redirect
  } catch (err) {
    setError(err.response?.data?.message || "Lỗi");
  } finally {
    setLoading(false);
  }
};
```

---

Nếu vẫn không giải quyết được, hãy:
1. Kiểm tra Network tab trong DevTools
2. Copy request/response để debug
3. Kiểm tra backend logs
4. Xem API_DOCUMENTATION.md để đảm bảo dùng đúng API


