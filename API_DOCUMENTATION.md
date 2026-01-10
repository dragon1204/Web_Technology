# 📚 Tài Liệu API - Smart Garden Management System

## 📋 Mục Lục

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Gardens](#3-gardens)
4. [Sales](#4-sales)
5. [Vegetables](#5-vegetables)
6. [Sensors](#6-sensors)
7. [Notifications](#7-notifications)
8. [Alerts](#8-alerts)
9. [Analytics & Reports](#9-analytics--reports)
10. [Audit Logs](#10-audit-logs)

---

## 🔐 Base URL

```
http://localhost:3000
```

## 🔑 Authentication

Hầu hết các API yêu cầu JWT token trong header:

```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Để lấy token, sử dụng API login (xem phần Authentication).

---

## 1. Authentication

### 1.1. Đăng ký

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.2. Đăng nhập

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.3. Refresh Token

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

### 1.4. Đăng xuất

**Endpoint:** `POST /auth/logout`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 1.5. Generate 2FA Secret

**Endpoint:** `POST /auth/2fa/generate`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X POST http://localhost:3000/auth/2fa/generate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "otpauthUrl": "otpauth://totp/..."
}
```

---

### 1.6. Enable 2FA

**Endpoint:** `POST /auth/2fa/enable`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body:**
```json
{
  "code": "123456"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/auth/2fa/enable \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456"
  }'
```

---

### 1.7. Disable 2FA

**Endpoint:** `POST /auth/2fa/disable`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X POST http://localhost:3000/auth/2fa/disable \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 1.8. Generate QR Code

**Endpoint:** `POST /auth/2fa/qrcode`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body:**
```json
{
  "otpauthUrl": "otpauth://totp/..."
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/auth/2fa/qrcode \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "otpauthUrl": "otpauth://totp/..."
  }' \
  --output qrcode.png
```

---

### 1.9. Google OAuth Login

**Endpoint:** `GET /auth/google`

**cURL:**
```bash
curl -X GET http://localhost:3000/auth/google
```

**Note:** Đây là redirect endpoint, thường được gọi từ browser.

---

### 1.10. Google OAuth Callback

**Endpoint:** `GET /auth/google/redirect`

**Note:** Đây là callback URL từ Google OAuth, không cần gọi trực tiếp.

---

## 2. Users

### 2.1. Lấy danh sách tất cả users (Admin only)

**Endpoint:** `GET /users`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 2.2. Lấy thông tin profile của mình

**Endpoint:** `GET /users/me`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X GET http://localhost:3000/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 2.3. Lấy thông tin user theo ID

**Endpoint:** `GET /users/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X GET http://localhost:3000/users/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 2.4. Tạo user mới (Admin only)

**Endpoint:** `POST /users`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "USER"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User",
    "role": "USER"
  }'
```

---

### 2.5. Cập nhật user (Admin only)

**Endpoint:** `PUT /users/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body:**
```json
{
  "name": "Updated Name",
  "role": "ADMIN"
}
```

**cURL:**
```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "role": "ADMIN"
  }'
```

---

### 2.6. Xóa user (Admin only)

**Endpoint:** `DELETE /users/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X DELETE http://localhost:3000/users/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 3. Gardens

### 3.1. Tạo vườn mới

**Endpoint:** `POST /garden`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body:**
```json
{
  "name": "Vườn A",
  "area": 100.5,
  "location": "Hà Nội",
  "description": "Vườn trồng rau cải"
}
```

**Query Parameters (Optional):**
- `userId`: ID của user (chỉ Admin có thể dùng)

**cURL:**
```bash
curl -X POST http://localhost:3000/garden \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vườn A",
    "area": 100.5,
    "location": "Hà Nội",
    "description": "Vườn trồng rau cải"
  }'
```

---

### 3.2. Lấy danh sách vườn

**Endpoint:** `GET /garden`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `page`: Số trang (default: 1)
- `limit`: Số lượng mỗi trang (default: 10)
- `search`: Tìm kiếm
- `sortBy`: Sắp xếp theo field
- `sortOrder`: `asc` hoặc `desc`

**cURL:**
```bash
curl -X GET "http://localhost:3000/garden?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 3.3. Lấy thông tin vườn theo ID

**Endpoint:** `GET /garden/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X GET http://localhost:3000/garden/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 3.4. Cập nhật vườn

**Endpoint:** `PUT /garden/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body:**
```json
{
  "name": "Vườn A Updated",
  "area": 120.0,
  "location": "Hà Nội",
  "description": "Mô tả mới"
}
```

**cURL:**
```bash
curl -X PUT http://localhost:3000/garden/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vườn A Updated",
    "area": 120.0,
    "location": "Hà Nội",
    "description": "Mô tả mới"
  }'
```

---

### 3.5. Xóa vườn (Admin only)

**Endpoint:** `DELETE /garden/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X DELETE http://localhost:3000/garden/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 4. Sales

### 4.1. Bán rau trong vườn

**Endpoint:** `POST /garden/:gardenId/sale`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body:**
```json
{
  "vegetableId": 1,
  "quantity": 10,
  "priceAtSale": 30000
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/garden/1/sale \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vegetableId": 1,
    "quantity": 10,
    "priceAtSale": 30000
  }'
```

---

### 4.2. Lấy danh sách giao dịch bán của vườn

**Endpoint:** `GET /garden/:gardenId/sale`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X GET http://localhost:3000/garden/1/sale \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 4.3. Lấy thống kê doanh thu của vườn

**Endpoint:** `GET /garden/:gardenId/sale/revenue`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X GET http://localhost:3000/garden/1/sale/revenue \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "gardenId": 1,
  "gardenName": "Vườn A",
  "totalRevenue": 1500000,
  "totalQuantity": 50,
  "saleCount": 5
}
```

---

## 5. Vegetables

### 5.1. Tạo rau củ mới

**Endpoint:** `POST /vegetable`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body:**
```json
{
  "name": "Rau cải",
  "imported": 100,
  "sold": 0,
  "price": 30000,
  "category": "leafy",
  "description": "Rau cải xanh"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/vegetable \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rau cải",
    "imported": 100,
    "sold": 0,
    "price": 30000,
    "category": "leafy",
    "description": "Rau cải xanh"
  }'
```

---

### 5.2. Lấy danh sách rau củ

**Endpoint:** `GET /vegetable`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `page`: Số trang
- `limit`: Số lượng mỗi trang
- `search`: Tìm kiếm
- `sortBy`: Sắp xếp theo field
- `sortOrder`: `asc` hoặc `desc`

**cURL:**
```bash
curl -X GET "http://localhost:3000/vegetable?page=1&limit=10&search=rau" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 5.3. Cập nhật giá sản phẩm

**Endpoint:** `PATCH /vegetable/price/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body:**
```json
{
  "price": 35000
}
```

**cURL:**
```bash
curl -X PATCH http://localhost:3000/vegetable/price/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 35000
  }'
```

---

### 5.4. Cập nhật số lượng nhập kho

**Endpoint:** `PATCH /vegetable/imported/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body:**
```json
{
  "imported": 150
}
```

**cURL:**
```bash
curl -X PATCH http://localhost:3000/vegetable/imported/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imported": 150
  }'
```

---

### 5.5. Cập nhật số lượng đã bán

**Endpoint:** `PATCH /vegetable/sold/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body:**
```json
{
  "sold": 50
}
```

**cURL:**
```bash
curl -X PATCH http://localhost:3000/vegetable/sold/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sold": 50
  }'
```

---

### 5.6. Lấy danh sách doanh thu theo thời gian

**Endpoint:** `GET /vegetable/revenue/list`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `type`: `day`, `week`, hoặc `month`
- `gardenId`: ID vườn (optional)
- `vegetableId`: ID rau củ (optional)

**cURL:**
```bash
curl -X GET "http://localhost:3000/vegetable/revenue/list?type=month&gardenId=1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 5.7. Lấy tổng doanh thu

**Endpoint:** `GET /vegetable/revenue/total`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `type`: `day`, `week`, hoặc `month`
- `gardenId`: ID vườn (optional)
- `vegetableId`: ID rau củ (optional)

**cURL:**
```bash
curl -X GET "http://localhost:3000/vegetable/revenue/total?type=day" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 5.8. Xóa rau củ

**Endpoint:** `PATCH /vegetable/delete/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X PATCH http://localhost:3000/vegetable/delete/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 5.9. Lấy lịch sử giá

**Endpoint:** `GET /vegetable/price-history/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `startDate`: Ngày bắt đầu (ISO format, optional)
- `endDate`: Ngày kết thúc (ISO format, optional)

**cURL:**
```bash
curl -X GET "http://localhost:3000/vegetable/price-history/1?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 6. Sensors

### 6.1. Lấy dữ liệu sensor theo sensor ID

**Endpoint:** `GET /sensor-data/sensor/:sensorId`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `startDate`: Ngày bắt đầu (ISO format, optional)
- `endDate`: Ngày kết thúc (ISO format, optional)
- `limit`: Số lượng records (default: 100)

**cURL:**
```bash
curl -X GET "http://localhost:3000/sensor-data/sensor/1?startDate=2024-12-01&endDate=2024-12-31&limit=100" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 6.2. Lấy thống kê sensor

**Endpoint:** `GET /sensor-data/sensor/:sensorId/statistics`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `startDate`: Ngày bắt đầu (ISO format, optional)
- `endDate`: Ngày kết thúc (ISO format, optional)

**cURL:**
```bash
curl -X GET "http://localhost:3000/sensor-data/sensor/1/statistics?startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "count": 1000,
  "min": 15.5,
  "max": 35.2,
  "avg": 25.8
}
```

---

## 7. Notifications

### 7.1. Tạo thông báo (Admin only)

**Endpoint:** `POST /notifications`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body:**
```json
{
  "userId": 1,
  "title": "Thông báo mới",
  "message": "Nội dung thông báo",
  "type": "info"
}
```

**Type values:** `alert`, `info`, `warning`, `success`

**cURL:**
```bash
curl -X POST http://localhost:3000/notifications \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "Thông báo mới",
    "message": "Nội dung thông báo",
    "type": "info"
  }'
```

---

### 7.2. Lấy danh sách thông báo

**Endpoint:** `GET /notifications`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `isRead`: `true` hoặc `false` (optional)

**cURL:**
```bash
curl -X GET "http://localhost:3000/notifications?isRead=false" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 7.3. Lấy số lượng thông báo chưa đọc

**Endpoint:** `GET /notifications/unread/count`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X GET http://localhost:3000/notifications/unread/count \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "count": 5
}
```

---

### 7.4. Đánh dấu thông báo đã đọc

**Endpoint:** `PATCH /notifications/:id/read`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X PATCH http://localhost:3000/notifications/1/read \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 7.5. Đánh dấu tất cả thông báo đã đọc

**Endpoint:** `PATCH /notifications/read-all`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X PATCH http://localhost:3000/notifications/read-all \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 7.6. Xóa thông báo

**Endpoint:** `DELETE /notifications/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X DELETE http://localhost:3000/notifications/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 8. Alerts

### 8.1. Lấy danh sách alerts

**Endpoint:** `GET /alerts`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `gardenId`: ID vườn (optional)
- `isResolved`: `true` hoặc `false` (optional)

**cURL:**
```bash
curl -X GET "http://localhost:3000/alerts?gardenId=1&isResolved=false" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 8.2. Lấy số lượng alerts đang active

**Endpoint:** `GET /alerts/active/count`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `gardenId`: ID vườn (optional)

**cURL:**
```bash
curl -X GET "http://localhost:3000/alerts/active/count?gardenId=1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 8.3. Giải quyết alert

**Endpoint:** `PATCH /alerts/:id/resolve`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X PATCH http://localhost:3000/alerts/1/resolve \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 8.4. Tạo alert rule

**Endpoint:** `POST /alerts/rules`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body:**
```json
{
  "gardenId": 1,
  "sensorId": 1,
  "minValue": 15,
  "maxValue": 35,
  "alertOnMin": true,
  "alertOnMax": true,
  "severity": "warning"
}
```

**Severity values:** `info`, `warning`, `critical`

**cURL:**
```bash
curl -X POST http://localhost:3000/alerts/rules \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gardenId": 1,
    "sensorId": 1,
    "minValue": 15,
    "maxValue": 35,
    "alertOnMin": true,
    "alertOnMax": true,
    "severity": "warning"
  }'
```

---

### 8.5. Lấy danh sách alert rules

**Endpoint:** `GET /alerts/rules`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `gardenId`: ID vườn (optional)

**cURL:**
```bash
curl -X GET "http://localhost:3000/alerts/rules?gardenId=1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 8.6. Lấy alert rule theo ID

**Endpoint:** `GET /alerts/rules/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X GET http://localhost:3000/alerts/rules/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 8.7. Cập nhật alert rule

**Endpoint:** `PATCH /alerts/rules/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body:**
```json
{
  "minValue": 20,
  "maxValue": 40,
  "isActive": true
}
```

**cURL:**
```bash
curl -X PATCH http://localhost:3000/alerts/rules/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "minValue": 20,
    "maxValue": 40,
    "isActive": true
  }'
```

---

### 8.8. Xóa alert rule

**Endpoint:** `DELETE /alerts/rules/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X DELETE http://localhost:3000/alerts/rules/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 9. Analytics & Reports

### 9.1. Doanh thu theo khoảng thời gian

**Endpoint:** `GET /analytics/revenue/period`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `period`: `day`, `week`, `month`, hoặc `year` (default: `month`)
- `startDate`: Ngày bắt đầu (ISO format, optional)
- `endDate`: Ngày kết thúc (ISO format, optional)
- `gardenId`: ID vườn (optional)
- `vegetableId`: ID rau củ (optional)

**cURL:**
```bash
curl -X GET "http://localhost:3000/analytics/revenue/period?period=month&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 9.2. So sánh doanh thu giữa các vườn

**Endpoint:** `GET /analytics/revenue/compare-gardens`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `startDate`: Ngày bắt đầu (ISO format, optional)
- `endDate`: Ngày kết thúc (ISO format, optional)
- `gardenIds`: Danh sách ID vườn, phân cách bằng dấu phẩy (optional)

**cURL:**
```bash
curl -X GET "http://localhost:3000/analytics/revenue/compare-gardens?startDate=2024-01-01&endDate=2024-12-31&gardenIds=1,2,3" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 9.3. Top sản phẩm bán chạy

**Endpoint:** `GET /analytics/revenue/top-products`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `limit`: Số lượng sản phẩm (default: 10)
- `startDate`: Ngày bắt đầu (ISO format, optional)
- `endDate`: Ngày kết thúc (ISO format, optional)
- `gardenId`: ID vườn (optional)

**cURL:**
```bash
curl -X GET "http://localhost:3000/analytics/revenue/top-products?limit=10&gardenId=1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 9.4. Năng suất theo loại rau

**Endpoint:** `GET /analytics/productivity/by-category`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `startDate`: Ngày bắt đầu (ISO format, optional)
- `endDate`: Ngày kết thúc (ISO format, optional)
- `gardenId`: ID vườn (optional)

**cURL:**
```bash
curl -X GET "http://localhost:3000/analytics/productivity/by-category?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 9.5. Tỷ lệ bán/tồn kho

**Endpoint:** `GET /analytics/productivity/sales-inventory-ratio`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `gardenId`: ID vườn (optional)

**cURL:**
```bash
curl -X GET "http://localhost:3000/analytics/productivity/sales-inventory-ratio?gardenId=1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 9.6. Xu hướng sản xuất

**Endpoint:** `GET /analytics/productivity/trend`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `period`: `day`, `week`, hoặc `month` (default: `month`)
- `startDate`: Ngày bắt đầu (ISO format, optional)
- `endDate`: Ngày kết thúc (ISO format, optional)
- `vegetableId`: ID rau củ (optional)
- `gardenId`: ID vườn (optional)

**cURL:**
```bash
curl -X GET "http://localhost:3000/analytics/productivity/trend?period=month&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 9.7. Phân tích dữ liệu sensor

**Endpoint:** `GET /analytics/sensor/analysis`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `sensorId`: ID sensor (required)
- `period`: `hour`, `day`, `week`, hoặc `month` (default: `day`)
- `startDate`: Ngày bắt đầu (ISO format, optional)
- `endDate`: Ngày kết thúc (ISO format, optional)

**cURL:**
```bash
curl -X GET "http://localhost:3000/analytics/sensor/analysis?sensorId=1&period=day&startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 9.8. Điều kiện môi trường tối ưu

**Endpoint:** `GET /analytics/sensor/optimal-conditions`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `vegetableId`: ID rau củ (optional)
- `gardenId`: ID vườn (optional)

**cURL:**
```bash
curl -X GET "http://localhost:3000/analytics/sensor/optimal-conditions?gardenId=1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 9.9. Tạo báo cáo tùy chỉnh

**Endpoint:** `POST /analytics/custom`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body:**
```json
{
  "type": "revenue",
  "period": "month",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "filters": {
    "gardenId": 1,
    "vegetableId": 1
  }
}
```

**Type values:** `revenue`, `productivity`, `sensor`, `combined`

**cURL:**
```bash
curl -X POST http://localhost:3000/analytics/custom \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "revenue",
    "period": "month",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "filters": {
      "gardenId": 1,
      "vegetableId": 1
    }
  }'
```

---

### 9.10. Tạo report template

**Endpoint:** `POST /analytics/templates`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body:**
```json
{
  "name": "Monthly Revenue Report",
  "description": "Báo cáo doanh thu hàng tháng",
  "type": "revenue",
  "config": {
    "period": "month",
    "filters": {
      "gardenId": 1
    }
  },
  "isPublic": false
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/analytics/templates \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Revenue Report",
    "description": "Báo cáo doanh thu hàng tháng",
    "type": "revenue",
    "config": {
      "period": "month",
      "filters": {
        "gardenId": 1
      }
    },
    "isPublic": false
  }'
```

---

### 9.11. Lấy danh sách report templates

**Endpoint:** `GET /analytics/templates`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X GET http://localhost:3000/analytics/templates \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 9.12. Lấy report template theo ID

**Endpoint:** `GET /analytics/templates/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X GET http://localhost:3000/analytics/templates/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 9.13. Cập nhật report template

**Endpoint:** `PATCH /analytics/templates/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Request Body:**
```json
{
  "name": "Updated Report Name",
  "isPublic": true
}
```

**cURL:**
```bash
curl -X PATCH http://localhost:3000/analytics/templates/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Report Name",
    "isPublic": true
  }'
```

---

### 9.14. Xóa report template

**Endpoint:** `DELETE /analytics/templates/:id`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**cURL:**
```bash
curl -X DELETE http://localhost:3000/analytics/templates/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 10. Audit Logs

### 10.1. Lấy audit logs gần đây (Admin only)

**Endpoint:** `GET /audit/recent`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `limit`: Số lượng logs (default: 100)

**cURL:**
```bash
curl -X GET "http://localhost:3000/audit/recent?limit=100" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 10.2. Lấy audit logs của user hiện tại

**Endpoint:** `GET /audit/my-logs`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `limit`: Số lượng logs (default: 50)

**cURL:**
```bash
curl -X GET "http://localhost:3000/audit/my-logs?limit=50" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 10.3. Lấy audit logs theo entity (Admin only)

**Endpoint:** `GET /audit/by-entity`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `entityType`: Loại entity (required)
- `entityId`: ID entity (required)
- `limit`: Số lượng logs (default: 50)

**cURL:**
```bash
curl -X GET "http://localhost:3000/audit/by-entity?entityType=Garden&entityId=1&limit=50" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 10.4. Lấy audit logs theo request ID (Admin only)

**Endpoint:** `GET /audit/by-request`

**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Query Parameters:**
- `requestId`: Request ID (required)

**cURL:**
```bash
curl -X GET "http://localhost:3000/audit/by-request?requestId=abc123" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📝 Ghi Chú

### Error Responses

Tất cả các API có thể trả về các lỗi sau:

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "message": "You do not have permission"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Validation error message"
}
```

### Pagination

Các API có pagination trả về format:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Date Format

Tất cả dates sử dụng ISO 8601 format: `YYYY-MM-DD` hoặc `YYYY-MM-DDTHH:mm:ssZ`

---

## 🔗 Swagger UI

Bạn cũng có thể xem và test API trực tiếp qua Swagger UI:

```
http://localhost:3000/api
```

---

## 📞 Support

Nếu gặp vấn đề, vui lòng kiểm tra:
- Token có hợp lệ không
- User có quyền truy cập không
- Request body có đúng format không
- Server có đang chạy không






