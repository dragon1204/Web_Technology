# 🌱 Garden IoT Dashboard - Hướng dẫn Setup

## Tổng quan dự án

Dự án Garden IoT Dashboard bao gồm:

- **Backend**: NestJS với PostgreSQL, JWT Auth, Google OAuth, WebSocket
- **Frontend**: React với Material Design, Real-time updates, Responsive UI

## 🚀 Quick Start

### 1. Chạy tự động (Windows)

```bash
# Sử dụng batch file
./start-dev.bat

# Hoặc PowerShell
./start-dev.ps1
```

### 2. Chạy thủ công

#### Backend (Terminal 1)

```bash
cd BE_Server-side
npm install
npm run start:dev
```

#### Frontend (Terminal 2)

```bash
cd FE_web_application/fe_dashboard
npm install
npm start
```

## 🌐 URLs

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api

## 🔧 Cấu hình đã hoàn thành

### ✅ Backend Features

- JWT Authentication với refresh token
- Google OAuth integration
- Role-based access control (USER/ADMIN)
- CRUD operations cho Garden và Vegetable
- WebSocket cho real-time communication
- Rate limiting và security middleware
- Swagger API documentation
- PostgreSQL database với Prisma ORM

### ✅ Frontend Features

- React Router v7 với protected routes
- Authentication context với auto-refresh
- WebSocket context cho real-time updates
- Responsive dark theme UI
- Toast notifications
- CRUD interfaces cho tất cả entities
- OAuth callback handling
- Error handling và loading states

## 📊 Tính năng chính

### 1. Authentication

- Đăng nhập/đăng ký với email/password
- Google OAuth login
- JWT token management
- Auto-refresh expired tokens

### 2. Dashboard

- Thống kê tổng quan hệ thống
- Real-time sensor data
- WebSocket connection status
- Recent activities

### 3. Garden Management

- CRUD operations cho vườn
- Phân quyền theo role
- Pagination và search
- Owner assignment

### 4. Vegetable Management

- CRUD operations cho rau củ
- Price management
- Inventory tracking (imported/sold)
- Revenue analytics

### 5. Device Controls

- Real-time device status
- Remote device control via WebSocket
- Sensor data visualization
- Device statistics

## 🔐 Authentication Flow

1. **Login**: POST /auth/login → JWT tokens
2. **Google OAuth**: GET /auth/google → Redirect → Callback
3. **Token Refresh**: POST /auth/refresh → New access token
4. **Protected Routes**: Bearer token in headers

## 📡 API Integration

### Endpoints được sử dụng:

```
Authentication:
- POST /auth/login
- POST /auth/register
- GET /auth/google
- POST /auth/refresh

User Management:
- GET /users/me
- GET /users (ADMIN)

Garden Management:
- GET /garden
- POST /garden
- PUT /garden/:id
- DELETE /garden/:id

Vegetable Management:
- GET /vegetable
- POST /vegetable
- PATCH /vegetable/price/:id
- PATCH /vegetable/imported/:id
- PATCH /vegetable/sold/:id
```

### WebSocket Events:

```
Client → Server:
- deviceControl: Điều khiển thiết bị

Server → Client:
- sensorData: Dữ liệu cảm biến
- deviceStatus: Trạng thái thiết bị
- notification: Thông báo real-time
```

## 🎨 UI/UX Features

- **Dark Theme**: Professional green color scheme
- **Responsive**: Mobile-friendly design
- **Accessibility**: Keyboard navigation, screen reader support
- **Loading States**: Skeleton loading và spinners
- **Error Handling**: User-friendly error messages
- **Real-time Updates**: WebSocket integration
- **Toast Notifications**: Success/error feedback

## 🔧 Configuration

### Backend (.env)

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="Long1204@"
REFRESH_SECRET="Long1204@"
PORT=3000
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
FRONTEND_URL="http://localhost:3001"
```

### Frontend (config.js)

```javascript
export const config = {
  API_BASE_URL: "http://localhost:3000",
  GOOGLE_AUTH_URL: "http://localhost:3000/auth/google",
  // ... other configs
};
```

## 🐛 Troubleshooting

### Backend không start

1. Kiểm tra PostgreSQL đang chạy
2. Kiểm tra DATABASE_URL trong .env
3. Chạy `npx prisma generate` và `npx prisma db push`

### Frontend không kết nối API

1. Kiểm tra backend đang chạy trên port 3000
2. Kiểm tra CORS configuration
3. Kiểm tra network tab trong browser

### Google OAuth không hoạt động

1. Kiểm tra Google OAuth credentials
2. Kiểm tra FRONTEND_URL trong backend .env
3. Kiểm tra callback URL trong Google Console

### WebSocket không kết nối

1. Kiểm tra authentication token
2. Kiểm tra WebSocket server trong backend
3. Kiểm tra firewall/proxy settings

## 📝 Development Notes

- Backend sử dụng NestJS v10 với TypeScript
- Frontend sử dụng React 19.2.0 với modern hooks
- Database: PostgreSQL với Prisma ORM
- Real-time: Socket.io cho WebSocket
- Styling: Inline styles với CSS variables
- State Management: React Context API

## 🚀 Production Deployment

1. **Backend**:

   - Build: `npm run build`
   - Start: `npm run start:prod`
   - Environment: Production .env file

2. **Frontend**:

   - Build: `npm run build`
   - Serve: Static files từ CDN hoặc backend
   - Config: Update API_BASE_URL

3. **Database**:
   - Production PostgreSQL instance
   - Run migrations: `npx prisma migrate deploy`

## 📞 Support

Nếu gặp vấn đề, kiểm tra:

1. Console logs trong browser
2. Backend logs trong terminal
3. Network tab để debug API calls
4. WebSocket connection trong DevTools

---

**Dự án đã sẵn sàng để phát triển và demo! 🎉**
