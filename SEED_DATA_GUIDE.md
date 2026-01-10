# 🌱 Hướng Dẫn Seed Dữ Liệu Test

## 📋 Tổng Quan

Script seed sẽ tạo dữ liệu mẫu để test các luồng API của hệ thống Smart Garden Management.

## 🚀 Cách Chạy Seed

### Bước 1: Đảm bảo Database đã được migrate

```bash
cd BE_Server-side
npx prisma migrate dev
```

### Bước 2: Chạy seed script

```bash
npm run db:seed
```

Hoặc:

```bash
npx prisma db seed
```

## 📊 Dữ Liệu Sẽ Được Tạo

### 1. Users (3 users)
- **Admin User**
  - Email: `admin@example.com`
  - Password: `password123`
  - Role: `ADMIN`

- **User 1**
  - Email: `user1@example.com`
  - Password: `password123`
  - Role: `USER`
  - Name: Nguyễn Văn A

- **User 2**
  - Email: `user2@example.com`
  - Password: `password123`
  - Role: `USER`
  - Name: Trần Thị B

### 2. Sensor Types (3 types)
- Temperature (°C)
- Humidity (%)
- Soil Moisture (%)

### 3. Gardens (3 gardens)
- **Vườn Rau Cải Xanh** (User 1)
  - Area: 100.5 m²
  - Location: Hà Nội

- **Vườn Rau Sạch** (User 1)
  - Area: 150.0 m²
  - Location: Hồ Chí Minh

- **Vườn Rau Hữu Cơ** (User 2)
  - Area: 80.0 m²
  - Location: Đà Nẵng

### 4. Vegetables (5 loại rau)
- Rau Cải Xanh (leafy) - 200kg nhập, 50kg đã bán, 30,000đ/kg
- Cà Rốt (root) - 150kg nhập, 40kg đã bán, 25,000đ/kg
- Rau Muống (leafy) - 180kg nhập, 60kg đã bán, 20,000đ/kg
- Cà Chua (fruit) - 120kg nhập, 30kg đã bán, 35,000đ/kg
- Rau Thơm (herb) - 80kg nhập, 20kg đã bán, 40,000đ/kg

### 5. Vegetable_Garden
- Gán các loại rau vào các vườn với số lượng khác nhau

### 6. Sensors (4 sensors)
- Nhiệt độ vườn 1 (DHT22)
- Độ ẩm vườn 1 (DHT22)
- Nhiệt độ vườn 2 (DHT22)
- Độ ẩm đất vườn 3 (Soil Moisture Sensor)

### 7. Sensor Data
- **Nhiệt độ**: 720 records (30 ngày × 24 giờ)
  - Giá trị dao động: 20-35°C
  - Có pattern theo giờ trong ngày

- **Độ ẩm**: 360 records (30 ngày × 12 giờ)
  - Giá trị dao động: 40-80%
  - Có pattern theo giờ trong ngày

### 8. Sales (50 giao dịch)
- 50 giao dịch bán hàng ngẫu nhiên trong 30 ngày qua
- Phân bố trên các vườn và rau củ khác nhau
- Giá bán dao động ±10% so với giá gốc

### 9. Price History
- Mỗi loại rau có 5 lần thay đổi giá
- Mỗi tuần 1 lần thay đổi
- Giá dao động ±20% so với giá hiện tại

### 10. Alert Rules (3 rules)
- Rule 1: Cảnh báo nhiệt độ vườn 1 (15-35°C)
- Rule 2: Cảnh báo độ ẩm vườn 1 (30-80%)
- Rule 3: Cảnh báo nhiệt độ vườn 2 (18-32°C)

### 11. Alerts (2 alerts)
- 1 alert chưa được giải quyết (nhiệt độ vượt ngưỡng)
- 1 alert đã được giải quyết (độ ẩm thấp)

### 12. Notifications (4 notifications)
- 2 notifications cho User 1 (1 chưa đọc, 1 đã đọc)
- 2 notifications cho User 2 (1 chưa đọc)

### 13. Report Templates (2 templates)
- 1 template public (của Admin)
- 1 template private (của User 1)

## 🧪 Test Các Luồng

### Luồng 1: Authentication
```bash
# 1. Login với admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'

# 2. Login với user1
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "password123"
  }'
```

### Luồng 2: Gardens & Vegetables
```bash
# 1. Lấy danh sách vườn
curl -X GET http://localhost:3000/garden \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Lấy danh sách rau củ
curl -X GET http://localhost:3000/vegetable \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Xem chi tiết vườn
curl -X GET http://localhost:3000/garden/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Luồng 3: Sales
```bash
# 1. Tạo giao dịch bán hàng
curl -X POST http://localhost:3000/garden/1/sale \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vegetableId": 1,
    "quantity": 10,
    "priceAtSale": 30000
  }'

# 2. Xem danh sách giao dịch
curl -X GET http://localhost:3000/garden/1/sale \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Xem doanh thu vườn
curl -X GET http://localhost:3000/garden/1/sale/revenue \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Luồng 4: Sensors
```bash
# 1. Xem dữ liệu sensor
curl -X GET "http://localhost:3000/sensor-data/sensor/1?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Xem thống kê sensor
curl -X GET "http://localhost:3000/sensor-data/sensor/1/statistics" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Luồng 5: Notifications
```bash
# 1. Xem thông báo
curl -X GET http://localhost:3000/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Xem số lượng chưa đọc
curl -X GET http://localhost:3000/notifications/unread/count \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Đánh dấu đã đọc
curl -X PATCH http://localhost:3000/notifications/1/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Luồng 6: Alerts
```bash
# 1. Xem alerts
curl -X GET http://localhost:3000/alerts \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Xem alert rules
curl -X GET http://localhost:3000/alerts/rules \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Giải quyết alert
curl -X PATCH http://localhost:3000/alerts/1/resolve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Luồng 7: Analytics
```bash
# 1. Doanh thu theo tháng
curl -X GET "http://localhost:3000/analytics/revenue/period?period=month" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Top sản phẩm
curl -X GET "http://localhost:3000/analytics/revenue/top-products?limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. So sánh doanh thu giữa các vườn
curl -X GET "http://localhost:3000/analytics/revenue/compare-gardens?gardenIds=1,2,3" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Phân tích sensor
curl -X GET "http://localhost:3000/analytics/sensor/analysis?sensorId=1&period=day" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Luồng 8: Price History
```bash
# Xem lịch sử giá
curl -X GET "http://localhost:3000/vegetable/price-history/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔄 Reset Dữ Liệu

Nếu muốn reset và seed lại:

```bash
# Xóa tất cả dữ liệu và seed lại
npm run db:seed
```

**Lưu ý:** Script seed sẽ tự động xóa dữ liệu cũ trước khi tạo mới.

## ⚠️ Lưu Ý

1. **Password mặc định**: Tất cả users có password là `password123`
2. **Dữ liệu sẽ bị xóa**: Script sẽ xóa tất cả dữ liệu cũ trước khi seed
3. **Sensor Data**: Có thể mất vài giây để tạo do số lượng lớn
4. **Dates**: Tất cả dates được tạo trong 30 ngày qua

## 🐛 Troubleshooting

### Lỗi: "Cannot find module 'bcryptjs'"
```bash
npm install bcryptjs @types/bcryptjs
```

### Lỗi: "Prisma Client not generated"
```bash
npx prisma generate
```

### Lỗi: "Database connection failed"
- Kiểm tra file `.env` có `DATABASE_URL` đúng không
- Đảm bảo database đã được tạo
- Chạy migration: `npx prisma migrate dev`

## 📝 Customize Seed Data

Bạn có thể chỉnh sửa file `prisma/seed.ts` để:
- Thay đổi số lượng records
- Thay đổi giá trị mặc định
- Thêm dữ liệu mới
- Thay đổi logic tạo dữ liệu

Sau đó chạy lại:
```bash
npm run db:seed
```






