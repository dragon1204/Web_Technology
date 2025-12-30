# 📱 Hướng Dẫn Call API từ Frontend

## 📋 Tổng Quan

Frontend sử dụng Axios để gọi API. File `src/services/api.js` đã được cấu hình sẵn với:
- Base URL: `http://localhost:3000`
- Auto thêm token vào headers
- Error handling tự động
- Response interceptor

---

## 🔧 Cấu Hình

### 1. API Base URL

File `src/services/api.js`:

```javascript
const API_URL = "http://localhost:3000";
```

**Lưu ý:** Nếu backend chạy ở port khác, sửa lại URL này.

### 2. CORS

Backend đã được cấu hình CORS cho `http://localhost:3001`. Đảm bảo:
- Frontend chạy ở port 3001 (hoặc sửa CORS config trong backend)
- Backend chạy ở port 3000

---

## 🔐 Authentication

### Login và Lưu Token

```javascript
import { authAPI } from "../services/api";

// Login
const handleLogin = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    
    // Lưu token vào localStorage
    localStorage.setItem("token", response.data.access_token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    
    // Redirect
    navigate("/dashboard");
  } catch (error) {
    console.error("Login failed:", error.response?.data);
  }
};
```

### Token Tự Động Được Thêm

Token sẽ tự động được thêm vào mọi request qua interceptor:

```javascript
// Không cần thêm token thủ công
const response = await userAPI.getAll(); // Token tự động được thêm
```

### Logout

```javascript
import { authAPI } from "../services/api";

const handleLogout = async () => {
  await authAPI.logout(); // Xóa token và clear localStorage
  navigate("/login");
};
```

---

## 📚 Các API Có Sẵn

### 1. Authentication APIs

```javascript
import { authAPI } from "../services/api";

// Login
authAPI.login(email, password)

// Register
authAPI.register({ email, password, name })

// Refresh token
authAPI.refresh(refreshToken)

// Logout
authAPI.logout()
```

### 2. Users APIs

```javascript
import { userAPI } from "../services/api";

// Lấy tất cả users (Admin only)
userAPI.getAll()

// Lấy user theo ID
userAPI.getById(id)

// Lấy thông tin của mình
userAPI.getMe()

// Tạo user mới (Admin only)
userAPI.create({ email, password, name, role })

// Cập nhật user (Admin only)
userAPI.update(id, { name, role })

// Xóa user (Admin only)
userAPI.delete(id)
```

### 3. Gardens APIs

```javascript
import { gardenAPI } from "../services/api";

// Lấy danh sách vườn
gardenAPI.getAll()

// Lấy vườn theo ID
gardenAPI.getById(id)

// Tạo vườn mới
gardenAPI.create({
  name: "Vườn A",
  area: 100.5,
  location: "Hà Nội",
  description: "Mô tả"
})

// Cập nhật vườn
gardenAPI.update(id, { name: "Vườn B" })

// Xóa vườn (Admin only)
gardenAPI.delete(id)
```

### 4. Vegetables APIs

```javascript
import { vegetableAPI } from "../services/api";

// Lấy danh sách rau củ
vegetableAPI.getAll()

// Tạo rau củ mới
vegetableAPI.create({
  name: "Rau cải",
  imported: 100,
  sold: 0,
  price: 30000,
  category: "leafy",
  description: "Rau cải xanh"
})

// Cập nhật giá
vegetableAPI.updatePrice(id, 35000)

// Cập nhật số lượng nhập
vegetableAPI.updateImported(id, 150)

// Cập nhật số lượng đã bán
vegetableAPI.updateSold(id, 50)

// Lấy danh sách doanh thu
vegetableAPI.getRevenueList({ type: "month", gardenId: 1 })

// Lấy tổng doanh thu
vegetableAPI.getRevenueTotal({ type: "day" })

// Lấy lịch sử giá
vegetableAPI.getPriceHistory(id, { startDate: "2024-01-01", endDate: "2024-12-31" })
```

### 5. Sales APIs

```javascript
import { saleAPI } from "../services/api";

// Tạo giao dịch bán hàng
saleAPI.create(gardenId, {
  vegetableId: 1,
  quantity: 10,
  priceAtSale: 30000
})

// Lấy danh sách giao dịch của vườn
saleAPI.getByGarden(gardenId)

// Lấy doanh thu của vườn
saleAPI.getRevenue(gardenId)
```

### 6. Notifications APIs

```javascript
import { notificationAPI } from "../services/api";

// Lấy danh sách thông báo
notificationAPI.list({ isRead: false })

// Lấy số lượng chưa đọc
notificationAPI.unreadCount()

// Đánh dấu đã đọc
notificationAPI.markRead(id)

// Đánh dấu tất cả đã đọc
notificationAPI.markAllRead()

// Xóa thông báo
notificationAPI.delete(id)
```

### 7. Alerts APIs

```javascript
import { alertsAPI } from "../services/api";

// Lấy danh sách alerts
alertsAPI.list({ gardenId: 1, isResolved: false })

// Lấy số lượng alerts đang active
alertsAPI.activeCount({ gardenId: 1 })

// Giải quyết alert
alertsAPI.resolve(id)

// Tạo alert rule
alertsAPI.createRule({
  gardenId: 1,
  sensorId: 1,
  minValue: 15,
  maxValue: 35,
  alertOnMin: true,
  alertOnMax: true,
  severity: "warning"
})

// Lấy danh sách alert rules
alertsAPI.listRules({ gardenId: 1 })

// Lấy alert rule theo ID
alertsAPI.getRule(id)

// Cập nhật alert rule
alertsAPI.updateRule(id, { minValue: 20, isActive: true })

// Xóa alert rule
alertsAPI.deleteRule(id)
```

### 8. Sensors APIs

```javascript
import { sensorAPI } from "../services/api";

// Lấy dữ liệu sensor
sensorAPI.getData(sensorId, {
  startDate: "2024-12-01",
  endDate: "2024-12-31",
  limit: 100
})

// Lấy thống kê sensor
sensorAPI.getStats(sensorId, {
  startDate: "2024-12-01",
  endDate: "2024-12-31"
})
```

### 9. Analytics APIs

```javascript
import { analyticsAPI } from "../services/api";

// Doanh thu theo khoảng thời gian
analyticsAPI.getRevenueByPeriod({
  period: "month",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  gardenId: 1
})

// So sánh doanh thu giữa các vườn
analyticsAPI.compareRevenueBetweenGardens({
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  gardenIds: "1,2,3"
})

// Top sản phẩm bán chạy
analyticsAPI.getTopProducts({ limit: 10, gardenId: 1 })

// Năng suất theo loại rau
analyticsAPI.getProductivityByCategory({
  startDate: "2024-01-01",
  endDate: "2024-12-31"
})

// Tỷ lệ bán/tồn kho
analyticsAPI.getSalesInventoryRatio({ gardenId: 1 })

// Xu hướng sản xuất
analyticsAPI.getProductionTrend({
  period: "month",
  startDate: "2024-01-01",
  endDate: "2024-12-31"
})

// Phân tích sensor
analyticsAPI.getSensorAnalysis({
  sensorId: 1,
  period: "day",
  startDate: "2024-12-01",
  endDate: "2024-12-31"
})

// Điều kiện môi trường tối ưu
analyticsAPI.getOptimalConditions({ gardenId: 1 })

// Tạo báo cáo tùy chỉnh
analyticsAPI.generateCustomReport({
  type: "revenue",
  period: "month",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  filters: { gardenId: 1 }
})

// Report Templates
analyticsAPI.createTemplate({ name: "...", type: "revenue", config: {...} })
analyticsAPI.getTemplates()
analyticsAPI.getTemplate(id)
analyticsAPI.updateTemplate(id, { name: "..." })
analyticsAPI.deleteTemplate(id)
```

### 10. Audit APIs

```javascript
import { auditAPI } from "../services/api";

// Lấy audit logs gần đây (Admin only)
auditAPI.getRecent({ limit: 100 })

// Lấy audit logs của mình
auditAPI.getMyLogs({ limit: 50 })

// Lấy audit logs theo entity (Admin only)
auditAPI.getByEntity({
  entityType: "Garden",
  entityId: "1",
  limit: 50
})

// Lấy audit logs theo request ID (Admin only)
auditAPI.getByRequest({ requestId: "abc123" })
```

---

## 💡 Ví Dụ Sử Dụng

### Ví Dụ 1: Component Lấy Danh Sách Vườn

```javascript
import React, { useState, useEffect } from "react";
import { gardenAPI } from "../services/api";

function GardenList() {
  const [gardens, setGardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGardens = async () => {
      try {
        setLoading(true);
        const response = await gardenAPI.getAll();
        setGardens(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Lỗi khi tải danh sách vườn");
      } finally {
        setLoading(false);
      }
    };

    fetchGardens();
  }, []);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div>
      {gardens.map((garden) => (
        <div key={garden.id}>{garden.name}</div>
      ))}
    </div>
  );
}
```

### Ví Dụ 2: Component Tạo Vườn Mới

```javascript
import React, { useState } from "react";
import { gardenAPI } from "../services/api";

function CreateGarden() {
  const [formData, setFormData] = useState({
    name: "",
    area: "",
    location: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await gardenAPI.create({
        name: formData.name,
        area: parseFloat(formData.area),
        location: formData.location,
        description: formData.description
      });
      alert("Tạo vườn thành công!");
      // Reset form hoặc redirect
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tạo vườn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? "Đang tạo..." : "Tạo vườn"}
      </button>
    </form>
  );
}
```

### Ví Dụ 3: Component Hiển Thị Thông Báo

```javascript
import React, { useState, useEffect } from "react";
import { notificationAPI } from "../services/api";

function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationAPI.unreadCount();
        setUnreadCount(response.data.count || 0);
      } catch (err) {
        console.error("Lỗi khi lấy số thông báo:", err);
      }
    };

    fetchUnreadCount();
    // Refresh mỗi 30 giây
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {unreadCount > 0 && (
        <span className="badge">{unreadCount}</span>
      )}
    </div>
  );
}
```

### Ví Dụ 4: Component Analytics Dashboard

```javascript
import React, { useState, useEffect } from "react";
import { analyticsAPI } from "../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

function RevenueChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await analyticsAPI.getRevenueByPeriod({
          period: "month",
          startDate: "2024-01-01",
          endDate: "2024-12-31"
        });
        setData(response.data);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Đang tải...</div>;

  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="period" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="totalRevenue" stroke="#8884d8" />
    </LineChart>
  );
}
```

---

## ⚠️ Xử Lý Lỗi

### Error Handling Tự Động

API đã có interceptor xử lý lỗi tự động:

```javascript
// Lỗi 401 (Unauthorized) - Tự động redirect về login
// Các lỗi khác - Trả về Promise.reject để component xử lý
```

### Xử Lý Lỗi Trong Component

```javascript
try {
  const response = await userAPI.getAll();
  // Success
} catch (error) {
  if (error.response) {
    // Server trả về lỗi (4xx, 5xx)
    console.error("Status:", error.response.status);
    console.error("Data:", error.response.data);
    console.error("Message:", error.response.data?.message);
  } else if (error.request) {
    // Request được gửi nhưng không nhận được response
    console.error("Network error:", error.request);
  } else {
    // Lỗi khác
    console.error("Error:", error.message);
  }
}
```

### Hiển Thị Lỗi Cho User

```javascript
const [error, setError] = useState(null);

try {
  await gardenAPI.create(data);
} catch (err) {
  const errorMessage = 
    err.response?.data?.message || 
    err.message || 
    "Đã xảy ra lỗi. Vui lòng thử lại.";
  setError(errorMessage);
}

// Hiển thị trong UI
{error && (
  <Alert severity="error">{error}</Alert>
)}
```

---

## 🔄 Refresh Token (Tùy chọn)

Nếu muốn tự động refresh token khi hết hạn:

```javascript
// Thêm vào api.js
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const response = await authAPI.refresh(refreshToken);
        
        localStorage.setItem("token", response.data.access_token);
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 📝 Checklist Khi Call API

- [ ] Đã import API function cần dùng
- [ ] Đã xử lý loading state
- [ ] Đã xử lý error state
- [ ] Đã kiểm tra user đã login chưa (token có trong localStorage)
- [ ] Đã kiểm tra quyền truy cập (Admin/User)
- [ ] Đã format dữ liệu đúng (dates, numbers, etc.)
- [ ] Đã test với network error (tắt internet)
- [ ] Đã test với invalid token

---

## 🐛 Troubleshooting

### Lỗi: "Network Error" hoặc "CORS Error"

**Nguyên nhân:**
- Backend chưa chạy
- CORS chưa được config đúng
- Port không đúng

**Giải pháp:**
1. Kiểm tra backend đang chạy ở `http://localhost:3000`
2. Kiểm tra frontend đang chạy ở `http://localhost:3001`
3. Kiểm tra CORS config trong `main.ts`

### Lỗi: "401 Unauthorized"

**Nguyên nhân:**
- Token không có hoặc hết hạn
- Token không đúng format

**Giải pháp:**
1. Kiểm tra token trong localStorage: `localStorage.getItem("token")`
2. Login lại để lấy token mới
3. Kiểm tra format token: `Bearer ${token}`

### Lỗi: "403 Forbidden"

**Nguyên nhân:**
- User không có quyền truy cập
- Role không đúng

**Giải pháp:**
1. Kiểm tra role của user
2. Chỉ Admin mới có thể truy cập một số API
3. Kiểm tra permission trong backend

### Response Data Không Đúng Format

**Nguyên nhân:**
- Backend có response interceptor transform data
- Cần truy cập `response.data.data` thay vì `response.data`

**Giải pháp:**
```javascript
// Nếu backend transform response
const response = await userAPI.getAll();
const users = response.data.data; // Thay vì response.data

// Hoặc kiểm tra structure
console.log(response.data); // Xem structure thực tế
```

---

## 🎯 Best Practices

1. **Luôn xử lý loading và error states**
2. **Sử dụng try-catch cho mọi API call**
3. **Kiểm tra response.data trước khi sử dụng**
4. **Log errors để debug dễ hơn**
5. **Không hardcode API URLs, dùng constants**
6. **Sử dụng TypeScript nếu có thể để type-safe**

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra Network tab trong DevTools
2. Kiểm tra Console để xem lỗi
3. Kiểm tra token có trong localStorage không
4. Kiểm tra backend có đang chạy không
5. Kiểm tra CORS config


