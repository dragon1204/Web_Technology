# API Integration Guide - Garden IOT Dashboard

## Tổng quan

Đã tích hợp đầy đủ tất cả các API endpoints từ Swagger vào frontend React dashboard. Hệ thống bao gồm các module chính:

## 🚀 Các tính năng đã tích hợp

### 1. Authentication & User Management

- **Login/Register**: Đăng nhập và đăng ký tài khoản
- **Google OAuth**: Đăng nhập bằng Google
- **User Profile**: Quản lý thông tin cá nhân
- **User Management**: Quản lý người dùng (Admin only)

### 2. Garden Management

- **Garden CRUD**: Tạo, đọc, cập nhật, xóa vườn
- **Garden Sales**: Quản lý bán hàng theo vườn
- **Revenue Tracking**: Theo dõi doanh thu từng vườn

### 3. Vegetable Management

- **Vegetable CRUD**: Quản lý rau củ hoàn chỉnh
- **Price History**: Lịch sử giá cả với biểu đồ
- **Inventory Tracking**: Theo dõi tồn kho

### 4. Analytics & Reports

- **Revenue Analytics**: Phân tích doanh thu theo thời gian
- **Garden Comparison**: So sánh hiệu suất các vườn
- **Top Products**: Sản phẩm bán chạy nhất
- **Productivity Analytics**: Phân tích năng suất
- **Sensor Analytics**: Phân tích dữ liệu cảm biến
- **Custom Reports**: Tạo báo cáo tùy chỉnh

### 5. Notifications System

- **Real-time Notifications**: Thông báo thời gian thực
- **Unread Count**: Đếm thông báo chưa đọc
- **Mark as Read**: Đánh dấu đã đọc
- **Delete Notifications**: Xóa thông báo

### 6. Alerts Management

- **Active Alerts**: Cảnh báo đang hoạt động
- **Alert Rules**: Tạo và quản lý quy tắc cảnh báo
- **Alert Resolution**: Giải quyết cảnh báo
- **Severity Levels**: Mức độ nghiêm trọng

### 7. Audit Logs

- **Activity Tracking**: Theo dõi hoạt động người dùng
- **System Logs**: Nhật ký hệ thống
- **Filter & Search**: Lọc và tìm kiếm logs
- **Export Logs**: Xuất nhật ký

## 📁 Cấu trúc file mới

```
src/
├── services/
│   └── api.js                    # Tất cả API endpoints
├── hooks/
│   ├── useApi.js                 # Generic API hooks
│   ├── useAuth.js                # Authentication hooks
│   ├── useNotifications.js       # Notification hooks
│   └── useAnalytics.js           # Analytics hooks
├── components/
│   ├── analytics/
│   │   └── RevenueAnalytics.jsx  # Phân tích doanh thu
│   ├── notifications/
│   │   └── NotificationCenter.jsx # Trung tâm thông báo
│   ├── alerts/
│   │   └── AlertsManager.jsx     # Quản lý cảnh báo
│   ├── audit/
│   │   └── AuditLogs.jsx         # Nhật ký audit
│   └── vegetables/
│       └── VegetableManager.jsx  # Quản lý rau củ nâng cao
```

## 🔧 API Services đã tích hợp

### Authentication APIs

```javascript
authAPI.login(email, password);
authAPI.register(userData);
authAPI.getProfile();
authAPI.googleRedirect();
```

### User Management APIs

```javascript
userAPI.getAll(params);
userAPI.getById(id);
userAPI.create(data);
userAPI.update(id, data);
userAPI.delete(id);
userAPI.changePassword(id, passwordData);
```

### Garden Management APIs

```javascript
gardenAPI.getAll(params);
gardenAPI.getById(id);
gardenAPI.create(data);
gardenAPI.update(id, data);
gardenAPI.delete(id);
gardenAPI.createSale(gardenId, saleData);
gardenAPI.getSales(gardenId);
gardenAPI.getSaleRevenue(gardenId);
```

### Vegetable Management APIs

```javascript
vegetableAPI.getAll(params);
vegetableAPI.getById(id);
vegetableAPI.create(data);
vegetableAPI.update(id, data);
vegetableAPI.delete(id);
vegetableAPI.getPriceHistory(id);
```

### Analytics APIs

```javascript
analyticsAPI.getRevenuePeriod(params);
analyticsAPI.compareGardens(params);
analyticsAPI.getTopProducts(params);
analyticsAPI.getProductivityByCategory(params);
analyticsAPI.getSalesInventoryRatio(params);
analyticsAPI.getProductivityTrend(params);
analyticsAPI.getSensorAnalysis(params);
analyticsAPI.getOptimalConditions(params);
analyticsAPI.createCustomReport(data);
```

### Notification APIs

```javascript
notificationAPI.create(data);
notificationAPI.getAll(params);
notificationAPI.getUnreadCount();
notificationAPI.markAsRead(id);
notificationAPI.markAllAsRead();
notificationAPI.delete(id);
```

### Alert APIs

```javascript
alertAPI.getAll(params);
alertAPI.getActiveCount();
alertAPI.resolve(id);
alertAPI.createRule(data);
alertAPI.getRules(params);
alertAPI.updateRule(id, data);
alertAPI.deleteRule(id);
```

### Audit APIs

```javascript
auditAPI.getRecent(params);
auditAPI.getMyLogs(params);
auditAPI.getByEntity(params);
auditAPI.getByRequest(params);
```

## 🎯 Cách sử dụng

### 1. Sử dụng API hooks

```javascript
import { useApi, useApiEffect } from "../hooks/useApi";
import { vegetableAPI } from "../services/api";

// Trong component
const { data, loading, error, execute } = useApi(vegetableAPI.getAll);
const {
  data: vegetables,
  loading,
  refetch,
} = useApiEffect(vegetableAPI.getAll);
```

### 2. Sử dụng Authentication

```javascript
import { useAuth } from "../hooks/useAuth";

// Trong component
const { user, isAuthenticated, login, logout } = useAuth();
```

### 3. Sử dụng Notifications

```javascript
import { useNotifications } from "../hooks/useNotifications";

// Trong component
const { notifications, unreadCount, markAsRead } = useNotifications();
```

### 4. Sử dụng Analytics

```javascript
import { useAnalytics } from "../hooks/useAnalytics";

// Trong component
const { getRevenuePeriod, loading } = useAnalytics();

const loadData = async () => {
  const data = await getRevenuePeriod({
    period: "month",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
  });
};
```

## 🔐 Phân quyền

### User Role

- Dashboard
- Gardens (chỉ vườn của mình)
- Vegetables (xem)
- Analytics (cơ bản)
- Notifications

### Admin Role

- Tất cả chức năng của User
- User Management
- All Gardens Management
- Vegetable Manager (CRUD)
- Advanced Analytics
- Alerts Management
- Audit Logs

## 🚀 Routes mới

- `/analytics` - Revenue Analytics
- `/vegetable-manager` - Vegetable Management (Admin)
- `/alerts` - Alerts Management (Admin)
- `/audit-logs` - Audit Logs (Admin)

## 📊 Biểu đồ và Visualization

Sử dụng Recharts để hiển thị:

- Line charts cho revenue trends
- Bar charts cho garden comparison
- Price history charts
- Productivity analytics

## 🔔 Real-time Features

- Notification center với badge count
- Auto-refresh cho alerts
- Real-time updates cho audit logs

## 🎨 UI/UX Improvements

- Collapsible sidebar menu
- Loading states
- Error handling
- Responsive design
- Material-UI components

## 📝 Lưu ý quan trọng

1. **Token Management**: Tự động refresh token và redirect khi hết hạn
2. **Error Handling**: Xử lý lỗi toàn cục và hiển thị thông báo
3. **Loading States**: Loading indicators cho tất cả API calls
4. **Pagination**: Hỗ trợ phân trang cho danh sách dài
5. **Filtering**: Bộ lọc nâng cao cho tất cả danh sách
6. **Responsive**: Tương thích với mobile và tablet

## 🔧 Cài đặt và chạy

```bash
cd FE_web_application/fe_dashboard
npm install
npm start
```

Tất cả các API endpoints từ Swagger đã được tích hợp hoàn chỉnh vào frontend với UI/UX hiện đại và tính năng đầy đủ!
