# 💻 Ví Dụ Sử Dụng API - Frontend

## 🚀 Quick Start

### 1. Import API Functions

```javascript
import { 
  authAPI, 
  userAPI, 
  gardenAPI, 
  vegetableAPI,
  saleAPI,
  notificationAPI,
  alertsAPI,
  sensorAPI,
  analyticsAPI
} from "../services/api";
```

### 2. Basic Usage Pattern

```javascript
// Pattern chung cho mọi API call
const fetchData = async () => {
  try {
    setLoading(true);
    const response = await apiFunction(params);
    // Xử lý dữ liệu
    setData(response.data);
  } catch (error) {
    // Xử lý lỗi
    setError(error.response?.data?.message || "Có lỗi xảy ra");
  } finally {
    setLoading(false);
  }
};
```

---

## 📝 Ví Dụ Cụ Thể

### 1. Login Component

```javascript
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { TextField, Button, Alert } from "@mui/material";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      
      // Lưu token
      localStorage.setItem("token", response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem("refresh_token", response.data.refresh_token);
      }
      
      // Lưu user info nếu có
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      
      // Redirect
      navigate("/dashboard");
    } catch (err) {
      // Xử lý lỗi
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        required
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        required
      />
      {error && <Alert severity="error">{error}</Alert>}
      <Button type="submit" disabled={loading}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
}
```

### 2. Garden List Component

```javascript
import React, { useState, useEffect } from "react";
import { gardenAPI } from "../services/api";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress,
  Alert
} from "@mui/material";

function GardenList() {
  const [gardens, setGardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGardens();
  }, []);

  const fetchGardens = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await gardenAPI.getAll();
      
      // Kiểm tra response structure
      // Nếu backend có transform interceptor, có thể là response.data.data
      const data = response.data?.data || response.data || [];
      setGardens(Array.isArray(data) ? data : []);
      
    } catch (err) {
      console.error("Error fetching gardens:", err);
      setError(
        err.response?.data?.message || 
        "Không thể tải danh sách vườn"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Tên</TableCell>
            <TableCell>Diện tích</TableCell>
            <TableCell>Địa điểm</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {gardens.map((garden) => (
            <TableRow key={garden.id}>
              <TableCell>{garden.id}</TableCell>
              <TableCell>{garden.name}</TableCell>
              <TableCell>{garden.area || "N/A"} m²</TableCell>
              <TableCell>{garden.location || "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
```

### 3. Create Garden Form

```javascript
import React, { useState } from "react";
import { gardenAPI } from "../services/api";
import { 
  TextField, 
  Button, 
  Box, 
  Alert,
  CircularProgress
} from "@mui/material";

function CreateGarden() {
  const [formData, setFormData] = useState({
    name: "",
    area: "",
    location: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await gardenAPI.create({
        name: formData.name,
        area: formData.area ? parseFloat(formData.area) : null,
        location: formData.location || null,
        description: formData.description || null
      });
      
      setSuccess(true);
      // Reset form
      setFormData({
        name: "",
        area: "",
        location: "",
        description: ""
      });
      
      // Có thể redirect hoặc refresh list
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Không thể tạo vườn. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        name="name"
        label="Tên vườn"
        value={formData.name}
        onChange={handleChange}
        required
        fullWidth
        margin="normal"
      />
      <TextField
        name="area"
        label="Diện tích (m²)"
        type="number"
        value={formData.area}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        name="location"
        label="Địa điểm"
        value={formData.location}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        name="description"
        label="Mô tả"
        multiline
        rows={4}
        value={formData.description}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>Tạo vườn thành công!</Alert>}
      
      <Button 
        type="submit" 
        variant="contained" 
        fullWidth 
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : "Tạo vườn"}
      </Button>
    </Box>
  );
}
```

### 4. Notifications Component

```javascript
import React, { useState, useEffect } from "react";
import { notificationAPI } from "../services/api";
import { 
  List, 
  ListItem, 
  ListItemText, 
  Badge, 
  IconButton,
  Chip
} from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";

function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Refresh mỗi 30 giây
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.list({ isRead: false });
      const data = response.data?.data || response.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.unreadCount();
      setUnreadCount(response.data?.count || 0);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllRead();
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "alert": return "error";
      case "warning": return "warning";
      case "success": return "success";
      default: return "info";
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>
          Thông báo
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          )}
        </h2>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead}>
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      <List>
        {notifications.map((notification) => (
          <ListItem
            key={notification.id}
            secondaryAction={
              !notification.isRead && (
                <IconButton onClick={() => handleMarkAsRead(notification.id)}>
                  Đánh dấu đã đọc
                </IconButton>
              )
            }
          >
            <ListItemText
              primary={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {notification.title}
                  <Chip 
                    label={notification.type} 
                    color={getTypeColor(notification.type)}
                    size="small"
                  />
                </div>
              }
              secondary={notification.message}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
}
```

### 5. Analytics Dashboard

```javascript
import React, { useState, useEffect } from "react";
import { analyticsAPI } from "../services/api";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from "recharts";

function AnalyticsDashboard() {
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Lấy doanh thu theo tháng
      const revenueResponse = await analyticsAPI.getRevenueByPeriod({
        period: "month",
        startDate: "2024-01-01",
        endDate: "2024-12-31"
      });
      
      // Lấy top sản phẩm
      const topProductsResponse = await analyticsAPI.getTopProducts({
        limit: 10
      });
      
      // Format data cho chart
      const revenue = revenueResponse.data?.data || revenueResponse.data || [];
      const products = topProductsResponse.data?.data || topProductsResponse.data || [];
      
      setRevenueData(revenue.map(item => ({
        period: new Date(item.period).toLocaleDateString(),
        revenue: parseFloat(item.totalRevenue) || 0,
        quantity: parseInt(item.totalQuantity) || 0
      })));
      
      setTopProducts(products.map(item => ({
        name: item.vegetableName,
        revenue: parseFloat(item.totalRevenue) || 0,
        quantity: parseInt(item.totalQuantity) || 0
      })));
      
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h2>Analytics Dashboard</h2>
      
      <h3>Doanh thu theo tháng</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>

      <h3>Top sản phẩm bán chạy</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topProducts}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="quantity" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 6. Alerts Component

```javascript
import React, { useState, useEffect } from "react";
import { alertsAPI } from "../services/api";
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Button,
  Alert as MUIAlert
} from "@mui/material";

function AlertsList() {
  const [alerts, setAlerts] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    fetchActiveCount();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await alertsAPI.list({ isResolved: false });
      const data = response.data?.data || response.data || [];
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveCount = async () => {
    try {
      const response = await alertsAPI.activeCount();
      setActiveCount(response.data?.count || 0);
    } catch (err) {
      console.error("Error fetching active count:", err);
    }
  };

  const handleResolve = async (id) => {
    try {
      await alertsAPI.resolve(id);
      fetchAlerts();
      fetchActiveCount();
    } catch (err) {
      console.error("Error resolving alert:", err);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "error";
      case "warning": return "warning";
      default: return "info";
    }
  };

  return (
    <div>
      <Typography variant="h5">
        Alerts ({activeCount} active)
      </Typography>

      {alerts.map((alert) => (
        <Card key={alert.id} sx={{ mb: 2 }}>
          <CardContent>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <Typography variant="h6">{alert.message}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Giá trị: {alert.value} | Sensor: {alert.sensor?.name || "N/A"}
                </Typography>
                <Chip 
                  label={alert.severity} 
                  color={getSeverityColor(alert.severity)}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </div>
              {!alert.isResolved && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => handleResolve(alert.id)}
                >
                  Giải quyết
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## 🔍 Debug API Calls

### 1. Kiểm Tra Request/Response

```javascript
// Thêm vào api.js để log mọi request/response
api.interceptors.request.use((config) => {
  console.log("Request:", config.method.toUpperCase(), config.url, config.data);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("Response:", response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error("Error:", error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);
```

### 2. Kiểm Tra Network Tab

1. Mở DevTools (F12)
2. Vào tab Network
3. Gọi API từ frontend
4. Xem request/response trong Network tab

### 3. Kiểm Tra Console

```javascript
try {
  const response = await gardenAPI.getAll();
  console.log("Full response:", response);
  console.log("Response data:", response.data);
  console.log("Response status:", response.status);
} catch (error) {
  console.error("Error object:", error);
  console.error("Error response:", error.response);
  console.error("Error data:", error.response?.data);
  console.error("Error status:", error.response?.status);
}
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Network Error" hoặc không có response

**Nguyên nhân:**
- Backend chưa chạy
- CORS chưa được config
- URL không đúng

**Giải pháp:**
```javascript
// Kiểm tra backend đang chạy
// Kiểm tra API_URL trong api.js
// Kiểm tra CORS trong backend main.ts
```

### Issue 2: "401 Unauthorized"

**Nguyên nhân:**
- Token không có hoặc hết hạn
- Token không đúng format

**Giải pháp:**
```javascript
// Kiểm tra token
const token = localStorage.getItem("token");
console.log("Token:", token);

// Login lại để lấy token mới
```

### Issue 3: Response data không đúng format

**Nguyên nhân:**
- Backend có response interceptor transform data
- Cần truy cập `response.data.data` thay vì `response.data`

**Giải pháp:**
```javascript
// Kiểm tra structure
console.log("Response:", response);
console.log("Response.data:", response.data);

// Sử dụng
const data = response.data?.data || response.data || [];
```

### Issue 4: "Cannot read property of undefined"

**Nguyên nhân:**
- Response structure không như mong đợi
- Chưa kiểm tra null/undefined

**Giải pháp:**
```javascript
// Luôn kiểm tra và có default value
const data = response.data?.data || response.data || [];
const count = response.data?.count || 0;
const name = response.data?.name || "N/A";
```

---

## ✅ Best Practices

1. **Luôn có loading state**
2. **Luôn có error handling**
3. **Kiểm tra response structure trước khi dùng**
4. **Sử dụng optional chaining (`?.`)**
5. **Có default values**
6. **Log errors để debug**
7. **Kiểm tra token trước khi call API**
8. **Xử lý network errors**

---

## 🎯 Quick Reference

```javascript
// ✅ Đúng
const response = await gardenAPI.getAll();
const gardens = response.data?.data || response.data || [];

// ❌ Sai
const gardens = response.data; // Có thể undefined
```

```javascript
// ✅ Đúng
try {
  const response = await api();
  setData(response.data);
} catch (error) {
  setError(error.response?.data?.message || "Lỗi");
}

// ❌ Sai
const response = await api(); // Không có error handling
```


