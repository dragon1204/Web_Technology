# Garden IoT Dashboard - Frontend Setup

## Tổng quan

Frontend React đã được cấu hình để kết nối với backend NestJS. Tất cả các API endpoints đã được tích hợp và sẵn sàng sử dụng.

## Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
cd FE_web_application/fe_dashboard
npm install
```

### 2. Chạy development server

```bash
npm start
```

Frontend sẽ chạy trên: http://localhost:3001

## Tính năng đã tích hợp

### ✅ Authentication

- Đăng nhập/đăng ký với email/password
- Google OAuth integration
- JWT token management với auto-refresh
- Protected routes

### ✅ Dashboard

- Thống kê tổng quan (vườn, rau củ, doanh thu)
- Kết nối WebSocket real-time
- Hiển thị dữ liệu cảm biến

### ✅ Quản lý vườn

- CRUD operations cho vườn
- Phân quyền theo role (USER/ADMIN)
- Pagination và search

### ✅ Quản lý rau củ

- CRUD operations cho rau củ
- Cập nhật giá, số lượng nhập/bán
- Theo dõi tồn kho

### ✅ Điều khiển thiết bị

- Điều khiển thiết bị IoT qua WebSocket
- Hiển thị trạng thái thiết bị real-time
- Mock devices cho demo

## Cấu trúc dự án

```
src/
├── components/          # React components
│   ├── Login.js        # Đăng nhập với OAuth
│   ├── Dashboard.js    # Trang chủ
│   ├── GardenView.js   # Quản lý vườn
│   ├── PlantManagement.js # Quản lý rau củ
│   ├── Controls.js     # Điều khiển thiết bị
│   ├── Layout.js       # Layout chung
│   └── OAuthCallback.js # Xử lý OAuth callback
├── contexts/           # React contexts
│   ├── AuthContext.js  # Authentication state
│   └── SocketContext.js # WebSocket connection
├── services/           # API services
│   ├── authService.js  # Authentication APIs
│   ├── gardenService.js # Garden APIs
│   └── vegetableService.js # Vegetable APIs
├── hooks/              # Custom hooks
│   └── useApi.js       # API utilities
├── config.js           # App configuration
└── api.js              # API helper với auto-refresh
```

## API Integration

### Backend Endpoints được sử dụng:

- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `GET /auth/google` - Google OAuth
- `POST /auth/refresh` - Refresh token
- `GET /users/me` - Profile người dùng
- `GET /garden` - Danh sách vườn
- `POST /garden` - Tạo vườn
- `PUT /garden/:id` - Cập nhật vườn
- `DELETE /garden/:id` - Xóa vườn
- `GET /vegetable` - Danh sách rau củ
- `POST /vegetable` - Tạo rau củ
- `PATCH /vegetable/price/:id` - Cập nhật giá
- `PATCH /vegetable/imported/:id` - Cập nhật nhập kho
- `PATCH /vegetable/sold/:id` - Cập nhật bán hàng

### WebSocket Events:

- `sensorData` - Dữ liệu cảm biến
- `deviceStatus` - Trạng thái thiết bị
- `deviceControl` - Điều khiển thiết bị
- `notification` - Thông báo real-time

## Cấu hình

### config.js

```javascript
export const config = {
  API_BASE_URL: "http://localhost:3000", // Backend URL
  GOOGLE_AUTH_URL: "http://localhost:3000/auth/google",
  // ... other configs
};
```

## Tính năng bảo mật

- JWT token được lưu trong localStorage
- Auto-refresh token khi hết hạn
- Protected routes với authentication check
- Role-based access control
- CORS protection

## Responsive Design

- Mobile-friendly interface
- Dark theme design
- Accessible components
- Loading states và error handling

## Troubleshooting

### Lỗi kết nối API

1. Kiểm tra backend đang chạy trên port 3000
2. Kiểm tra CORS configuration trong backend
3. Kiểm tra network tab trong browser

### Lỗi OAuth

1. Kiểm tra Google OAuth credentials
2. Kiểm tra FRONTEND_URL trong backend .env
3. Kiểm tra callback URL trong Google Console

### Lỗi WebSocket

1. Kiểm tra WebSocket server trong backend
2. Kiểm tra authentication token
3. Kiểm tra network connectivity

## Development Notes

- Sử dụng React 19.2.0
- React Router v7 cho routing
- Socket.io-client cho WebSocket
- React Hot Toast cho notifications
- Styled với inline styles (dark theme)

## Production Deployment

1. Build frontend: `npm run build`
2. Serve static files từ backend hoặc CDN
3. Cập nhật API_BASE_URL trong config
4. Cấu hình HTTPS cho production
