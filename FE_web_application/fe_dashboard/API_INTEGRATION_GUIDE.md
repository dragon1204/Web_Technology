# API Integration Guide - Garden IOT Dashboard

## Tổng quan

Đã tích hợp đầy đủ tất cả các API endpoints từ Swagger vào frontend React dashboard, bao gồm cả các API hiện có của hệ thống.

## 🚀 Các tính năng đã tích hợp

### 1. Authentication & User Management

- **Login/Register**: Đăng nhập và đăng ký tài khoản
- **Google OAuth**: Đăng nhập bằng Google
- **User Profile**: Quản lý thông tin cá nhân
- **User Management**: Quản lý người dùng (Admin only)

### 2. Dashboard & Statistics

- **Dashboard Stats**: Thống kê tổng quan hệ thống
- **Real-time Sensor Data**: Dữ liệu cảm biến thời gian thực
- **Device Status**: Trạng thái thiết bị
- **Recent Activity**: Hoạt động gần đây

### 3. Plants Management (Existing System)

- **My Plants**: Quản lý cây trồng của người dùng
- **Plant CRUD**: Tạo, đọc, cập nhật, xóa cây trồng
- **Growth Tracking**: Theo dõi tiến độ phát triển
- **Harvest Prediction**: Dự đoán thời gian thu hoạch

### 4. Devices Management (Existing System)

- **My Devices**: Thiết bị được gán cho người dùng
- **Device Control**: Điều khiển thiết bị từ xa
- **Device Status**: Trạng thái hoạt động thiết bị
- **Device Assignment**: Gán thiết bị cho người dùng

### 5. Sensor Data & ThingsBoard Integration

- **Real-time Data**: Dữ liệu cảm biến thời gian thực
- **Historical Data**: Dữ liệu lịch sử
- **Device Telemetry**: Telemetry từ ThingsBoard
- **WebSocket Integration**: Kết nối WebSocket cho real-time

### 6. Garden Management (Swagger APIs)

- **Garden CRUD**: Tạo, đọc, cập nhật, xóa vườn
- **Garden Sales**: Quản lý bán hàng theo vườn
- **Revenue Tracking**: Theo dõi doanh thu từng vườn

### 7. Vegetable Management (Swagger APIs)

- **Vegetable CRUD**: Quản lý rau củ hoàn chỉnh
- **Price History**: Lịch sử giá cả với biểu đồ
- **Inventory Tracking**: Theo dõi tồn kho

### 8. Analytics & Reports (Swagger APIs)

- **Revenue Analytics**: Phân tích doanh thu theo thời gian
- **Garden Comparison**: So sánh hiệu suất các vườn
- **Top Products**: Sản phẩm bán chạy nhất
- **Productivity Analytics**: Phân tích năng suất
- **Sensor Analytics**: Phân tích dữ liệu cảm biến
- **Custom Reports**: Tạo báo cáo tùy chỉnh

### 9. Notifications System (Swagger APIs)

- **Real-time Notifications**: Thông báo thời gian thực
- **Unread Count**: Đếm thông báo chưa đọc
- **Mark as Read**: Đánh dấu đã đọc
- **Delete Notifications**: Xóa thông báo

### 10. Alerts Management (Swagger APIs)

- **Active Alerts**: Cảnh báo đang hoạt động
- **Alert Rules**: Tạo và quản lý quy tắc cảnh báo
- **Alert Resolution**: Giải quyết cảnh báo
- **Severity Levels**: Mức độ nghiêm trọng

### 11. Audit Logs (Swagger APIs)

- **Activity Tracking**: Theo dõi hoạt động người dùng
- **System Logs**: Nhật ký hệ thống
- **Filter & Search**: Lọc và tìm kiếm logs
- **Export Logs**: Xuất nhật ký

## 📁 Cấu trúc API Services

```javascript
// Existing System APIs
dashboardAPI - /api/dashboard/* (Dashboard stats, activity)
plantsAPI - /api/plants/* (Plant management)
devicesAPI - /api/devices/* (Device management)
sensorAPI - /api/thingsboard/* (Sensor data)
controlsAPI - /api/controls/* (Device controls)

// Swagger APIs
authAPI - /auth/* (Authentication)
userAPI - /users/* (User management)
gardenAPI - /garden/* (Garden management)
vegetableAPI - /vegetable/* (Vegetable management)
analyticsAPI - /analytics/* (Analytics & reports)
notificationAPI - /notifications/* (Notifications)
alertAPI - /alerts/* (Alerts management)
auditAPI - /audit/* (Audit logs)
```

## 🔧 Custom Hooks đã tạo

### Existing System Hooks

```javascript
useDashboard() - Dashboard data & sensor integration
usePlants() - Plant management with growth calculations
useDevices() - Device management & control
```

### Generic Hooks

```javascript
useApi() - Generic API calls
useApiEffect() - Auto API calls on mount
usePaginatedApi() - Paginated data handling
useAuth() - Authentication context
useNotifications() - Notification management
useAnalytics() - Analytics data
```

## 🎯 Component Integration

### Existing Components (Updated)

- **Dashboard.js** - Sử dụng `useDashboard()` hook
- **PlantManagement.js** - Sử dụng `usePlants()` hook
- **Login.js** - Tích hợp Google OAuth

### New Components (Swagger APIs)

- **RevenueAnalytics.jsx** - Phân tích doanh thu
- **NotificationCenter.jsx** - Trung tâm thông báo
- **AlertsManager.jsx** - Quản lý cảnh báo
- **AuditLogs.jsx** - Nhật ký audit
- **VegetableManager.jsx** - Quản lý rau củ nâng cao

## 🔄 API Usage Examples

### Dashboard Integration

```javascript
import { useDashboard } from "../hooks/useDashboard";

const Dashboard = () => {
  const { stats, sensorData, loading, handleRealtimeSensorData } =
    useDashboard();

  // WebSocket integration
  useEffect(() => {
    socket.on("thingsboard-telemetry", handleRealtimeSensorData);
  }, []);
};
```

### Plant Management

```javascript
import { usePlants } from "../hooks/usePlants";

const PlantManagement = () => {
  const { plants, createPlant, calculateGrowthProgress, getDaysUntilHarvest } =
    usePlants();
};
```

### Device Control

```javascript
import { useDevices } from "../hooks/useDevices";

const DeviceControl = () => {
  const { myDevices, controlDevice, getDeviceStatus } = useDevices();
};
```

## 🌐 WebSocket Integration

```javascript
// Real-time sensor data
socket.on("thingsboard-telemetry", (payload) => {
  handleRealtimeSensorData(payload);
});

// Device status updates
socket.on("device-status", (data) => {
  updateDeviceStatus(data);
});
```

## 📱 Navigation & Routes

```javascript
// Existing routes
/dashboard - Dashboard with sensor data
/plants - Plant management
/devices - Device management
/controls - Device controls

// New routes (Swagger APIs)
/analytics - Revenue Analytics
/vegetable-manager - Vegetable Management
/alerts - Alerts Management
/audit-logs - Audit Logs
```

## 🔐 Authentication Flow

```javascript
// Regular login
authAPI.login(email, password)

// Google OAuth
GoogleLogin component -> /auth/google -> callback handling

// Token management
Automatic token refresh and logout on 401
```

## 🎨 UI/UX Features

- **Existing Design**: Giữ nguyên CSS và styling hiện có
- **Material-UI Integration**: Các component mới sử dụng MUI
- **Responsive Design**: Tương thích mobile và desktop
- **Real-time Updates**: WebSocket cho dữ liệu thời gian thực
- **Loading States**: Loading indicators cho tất cả API calls
- **Error Handling**: Xử lý lỗi toàn cục

## 🔧 Configuration

```javascript
// API Base URL
const API_URL = "http://159.223.61.25:3000";

// WebSocket URL (existing)
const SOCKET_URL = "https://beiot.onrender.com";
```

**Kết luận: Đã tích hợp hoàn chỉnh cả hệ thống hiện có và tất cả API từ Swagger!** 🎉

Hệ thống bây giờ có đầy đủ chức năng từ cả hai nguồn:

1. **Existing System**: Plants, Devices, Dashboard, Sensors
2. **Swagger APIs**: Gardens, Vegetables, Analytics, Notifications, Alerts, Audit

Tất cả đều được tích hợp với UI/UX nhất quán và hooks tái sử dụng được!
