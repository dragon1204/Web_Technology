# 📊 Hướng Dẫn Test Advanced Analytics & Reports

## 📋 Tổng Quan

Tài liệu này hướng dẫn cách test các tính năng Analytics & Reports đã được triển khai.

---

## 🔧 Bước 1: Migration Database

Trước khi test, cần chạy migration để cập nhật database schema:

```bash
cd BE_Server-side
npx prisma migrate dev --name add_analytics_fields
npx prisma generate
```

**Các thay đổi trong schema:**
- Thêm trường `category`, `description`, `createdAt`, `updatedAt` vào `Vegetable`
- Thêm trường `area`, `location`, `description`, `createdAt`, `updatedAt` vào `Garden`
- Thêm model `ReportTemplate` để lưu các báo cáo tùy chỉnh
- Thêm indexes để tối ưu performance

---

## 🧪 Bước 2: Chuẩn Bị Dữ Liệu Test

### 2.1. Tạo dữ liệu mẫu

Bạn có thể tạo dữ liệu test thông qua API hoặc seed script. Dưới đây là ví dụ sử dụng API:

#### Tạo Vegetables với category:

```bash
# Tạo rau củ với category
curl -X POST http://localhost:3000/vegetable \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rau cải",
    "imported": 100,
    "sold": 50,
    "price": 30000,
    "category": "leafy"
  }'

curl -X POST http://localhost:3000/vegetable \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cà rốt",
    "imported": 80,
    "sold": 40,
    "price": 25000,
    "category": "root"
  }'
```

#### Tạo Gardens với area và location:

```bash
# Tạo vườn với thông tin đầy đủ
curl -X POST http://localhost:3000/garden \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vườn A",
    "area": 100.5,
    "location": "Hà Nội",
    "description": "Vườn trồng rau cải"
  }'
```

#### Tạo Sales để test revenue reports:

```bash
# Tạo giao dịch bán hàng
curl -X POST http://localhost:3000/garden/1/sale \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vegetableId": 1,
    "quantity": 10,
    "priceAtSale": 30000
  }'
```

---

## 📈 Bước 3: Test Revenue Reports

### 3.1. Doanh thu theo khoảng thời gian

```bash
# Doanh thu theo tháng
curl -X GET "http://localhost:3000/analytics/revenue/period?period=month&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Doanh thu theo tuần
curl -X GET "http://localhost:3000/analytics/revenue/period?period=week" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Doanh thu theo ngày
curl -X GET "http://localhost:3000/analytics/revenue/period?period=day&startDate=2024-12-01" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response mẫu:**
```json
[
  {
    "period": "2024-12-01T00:00:00.000Z",
    "totalRevenue": "1500000",
    "totalQuantity": "50",
    "saleCount": "5",
    "avgRevenue": "300000"
  }
]
```

### 3.2. So sánh doanh thu giữa các vườn

```bash
curl -X GET "http://localhost:3000/analytics/revenue/compare-gardens?startDate=2024-01-01&endDate=2024-12-31&gardenIds=1,2,3" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response mẫu:**
```json
[
  {
    "gardenId": 1,
    "gardenName": "Vườn A",
    "totalRevenue": 1500000,
    "totalQuantity": 50,
    "saleCount": 5
  },
  {
    "gardenId": 2,
    "gardenName": "Vườn B",
    "totalRevenue": 1200000,
    "totalQuantity": 40,
    "saleCount": 4
  }
]
```

### 3.3. Top sản phẩm bán chạy

```bash
# Top 10 sản phẩm
curl -X GET "http://localhost:3000/analytics/revenue/top-products?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Top 5 sản phẩm của một vườn
curl -X GET "http://localhost:3000/analytics/revenue/top-products?limit=5&gardenId=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response mẫu:**
```json
[
  {
    "vegetableId": 1,
    "vegetableName": "Rau cải",
    "category": "leafy",
    "totalRevenue": 1500000,
    "totalQuantity": 50,
    "saleCount": 5
  }
]
```

---

## 🌱 Bước 4: Test Productivity Reports

### 4.1. Năng suất theo loại rau

```bash
curl -X GET "http://localhost:3000/analytics/productivity/by-category?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response mẫu:**
```json
[
  {
    "category": "leafy",
    "totalQuantity": 100,
    "totalRevenue": 3000000,
    "saleCount": 10
  },
  {
    "category": "root",
    "totalQuantity": 80,
    "totalRevenue": 2000000,
    "saleCount": 8
  }
]
```

### 4.2. Tỷ lệ bán/tồn kho

```bash
curl -X GET "http://localhost:3000/analytics/productivity/sales-inventory-ratio?gardenId=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response mẫu:**
```json
[
  {
    "vegetableId": 1,
    "vegetableName": "Rau cải",
    "totalSold": 50,
    "imported": 100,
    "ratio": 50.0,
    "remaining": 50,
    "utilizationRate": 50.0
  }
]
```

### 4.3. Xu hướng sản xuất

```bash
curl -X GET "http://localhost:3000/analytics/productivity/trend?period=month&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📡 Bước 5: Test Sensor Reports

### 5.1. Phân tích dữ liệu sensor

```bash
# Phân tích theo ngày
curl -X GET "http://localhost:3000/analytics/sensor/analysis?sensorId=1&period=day&startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Phân tích theo giờ
curl -X GET "http://localhost:3000/analytics/sensor/analysis?sensorId=1&period=hour" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response mẫu:**
```json
[
  {
    "period": "2024-12-01T00:00:00.000Z",
    "minValue": "20.5",
    "maxValue": "35.2",
    "avgValue": "27.8",
    "dataCount": "144"
  }
]
```

### 5.2. Điều kiện môi trường tối ưu

```bash
curl -X GET "http://localhost:3000/analytics/sensor/optimal-conditions?gardenId=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response mẫu:**
```json
{
  "analyzedGardens": [1, 2],
  "optimalConditions": [
    {
      "sensorId": 1,
      "sensorName": "Temperature Sensor",
      "sensorType": "temperature",
      "unit": "°C",
      "gardenId": 1,
      "optimalRange": {
        "min": 20.5,
        "max": 35.2,
        "average": 27.8
      },
      "dataPoints": 1000
    }
  ]
}
```

---

## 🎨 Bước 6: Test Custom Reports

### 6.1. Tạo báo cáo tùy chỉnh

```bash
# Báo cáo doanh thu tùy chỉnh
curl -X POST http://localhost:3000/analytics/custom \
  -H "Authorization: Bearer YOUR_TOKEN" \
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

# Báo cáo kết hợp (combined)
curl -X POST http://localhost:3000/analytics/custom \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "combined",
    "period": "month",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "filters": {
      "gardenId": 1,
      "sensorId": 1
    }
  }'
```

---

## 📝 Bước 7: Test Report Templates

### 7.1. Tạo report template

```bash
curl -X POST http://localhost:3000/analytics/templates \
  -H "Authorization: Bearer YOUR_TOKEN" \
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

### 7.2. Lấy danh sách templates

```bash
curl -X GET http://localhost:3000/analytics/templates \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7.3. Lấy template theo ID

```bash
curl -X GET http://localhost:3000/analytics/templates/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7.4. Cập nhật template

```bash
curl -X PATCH http://localhost:3000/analytics/templates/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Monthly Revenue Report",
    "isPublic": true
  }'
```

### 7.5. Xóa template

```bash
curl -X DELETE http://localhost:3000/analytics/templates/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔍 Bước 8: Test với Postman/Thunder Client

### 8.1. Import Collection

Tạo một Postman collection với các endpoints trên. Hoặc sử dụng Swagger UI:

```bash
# Truy cập Swagger UI
http://localhost:3000/api
```

### 8.2. Test Flow

1. **Login** để lấy token
2. **Tạo dữ liệu test** (vegetables, gardens, sales)
3. **Test Revenue Reports** - Kiểm tra các endpoint revenue
4. **Test Productivity Reports** - Kiểm tra các endpoint productivity
5. **Test Sensor Reports** - Đảm bảo có sensor data
6. **Test Custom Reports** - Tạo và test custom reports
7. **Test Report Templates** - CRUD operations

---

## ✅ Checklist Test

- [ ] Migration database thành công
- [ ] Tạo được vegetables với category
- [ ] Tạo được gardens với area, location
- [ ] Revenue reports trả về đúng dữ liệu
- [ ] So sánh doanh thu giữa các vườn hoạt động
- [ ] Top products hiển thị đúng
- [ ] Productivity reports tính toán đúng
- [ ] Sensor reports phân tích đúng dữ liệu
- [ ] Custom reports tạo được
- [ ] Report templates CRUD hoạt động

---

## 🐛 Troubleshooting

### Lỗi: "Table does not exist"
- **Giải pháp**: Chạy migration: `npx prisma migrate dev`

### Lỗi: "Invalid period"
- **Giải pháp**: Kiểm tra period phải là: 'day', 'week', 'month', 'year'

### Lỗi: "sensorId is required"
- **Giải pháp**: Đảm bảo truyền sensorId khi gọi sensor reports

### Không có dữ liệu trả về
- **Giải pháp**: 
  - Kiểm tra có dữ liệu trong database chưa
  - Kiểm tra filters có đúng không
  - Kiểm tra date range

---

## 📊 Ví Dụ Test Script (Node.js)

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TOKEN = 'YOUR_TOKEN';

async function testAnalytics() {
  const headers = { Authorization: `Bearer ${TOKEN}` };

  // Test Revenue Reports
  console.log('Testing Revenue Reports...');
  const revenue = await axios.get(
    `${BASE_URL}/analytics/revenue/period?period=month`,
    { headers }
  );
  console.log('Revenue:', revenue.data);

  // Test Top Products
  const topProducts = await axios.get(
    `${BASE_URL}/analytics/revenue/top-products?limit=5`,
    { headers }
  );
  console.log('Top Products:', topProducts.data);

  // Test Productivity
  const productivity = await axios.get(
    `${BASE_URL}/analytics/productivity/by-category`,
    { headers }
  );
  console.log('Productivity:', productivity.data);
}

testAnalytics();
```

---

## 🎯 Kết Luận

Sau khi hoàn thành các bước test trên, bạn đã kiểm tra được toàn bộ tính năng Analytics & Reports. Hệ thống sẽ cung cấp các báo cáo chi tiết để hỗ trợ quản lý vườn rau hiệu quả hơn.






