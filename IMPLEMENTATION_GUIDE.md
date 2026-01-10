# 📘 Hướng Dẫn Triển Khai Các Tính Năng Nâng Cao

## 🎯 Tổng Quan

Tài liệu này hướng dẫn cách sử dụng các tính năng nâng cao đã được triển khai.

---

## 1. 🔔 Notification System

### API Endpoints

#### Lấy danh sách thông báo
```http
GET /notifications
GET /notifications?isRead=false  # Chỉ lấy thông báo chưa đọc
```

#### Lấy số lượng thông báo chưa đọc
```http
GET /notifications/unread/count
```

#### Đánh dấu đã đọc
```http
PATCH /notifications/:id/read
PATCH /notifications/read-all  # Đánh dấu tất cả đã đọc
```

#### Xóa thông báo
```http
DELETE /notifications/:id
```

### Sử dụng trong Code

```typescript
// Tạo thông báo cho user
await notificationService.createForUser(
  userId,
  'Tiêu đề',
  'Nội dung thông báo',
  'warning' // 'alert' | 'info' | 'warning' | 'success'
);
```

---

## 2. ⚠️ Alert System

### Tạo Alert Rule

```http
POST /alerts/rules
Content-Type: application/json

{
  "gardenId": 1,
  "sensorId": 1,  // Optional
  "sensorType": "temperature",  // Optional (nếu không có sensorId)
  "minValue": 15,
  "maxValue": 35,
  "alertOnMin": true,
  "alertOnMax": true,
  "severity": "warning"  // 'info' | 'warning' | 'critical'
}
```

### Lấy danh sách Alerts

```http
GET /alerts
GET /alerts?gardenId=1
GET /alerts?isResolved=false
```

### Giải quyết Alert

```http
PATCH /alerts/:id/resolve
```

### Quản lý Alert Rules

```http
GET /alerts/rules
GET /alerts/rules/:id
PATCH /alerts/rules/:id
DELETE /alerts/rules/:id
```

---

## 3. 📊 Sensor Data Storage

### Lưu dữ liệu sensor

Dữ liệu sensor sẽ tự động được lưu khi nhận từ MQTT broker.

**MQTT Topic Format:**
- Format mới: `sensor/{sensorId}/{type}` (ví dụ: `sensor/1/temperature`)
- Format cũ (backward compatible): `humidity`, `temperature`

**Ví dụ publish MQTT:**
```bash
# Format mới (khuyến nghị)
mosquitto_pub -h broker.hivemq.com -t "sensor/1/temperature" -m "25.5"
mosquitto_pub -h broker.hivemq.com -t "sensor/1/humidity" -m "60.2"

# Format cũ (vẫn hoạt động)
mosquitto_pub -h broker.hivemq.com -t "temperature" -m "25.5"
mosquitto_pub -h broker.hivemq.com -t "humidity" -m "60.2"
```

### Lấy dữ liệu sensor

```http
GET /sensor-data/sensor/:sensorId
GET /sensor-data/sensor/:sensorId?startDate=2024-01-01&endDate=2024-01-31&limit=100
```

### Lấy thống kê sensor

```http
GET /sensor-data/sensor/:sensorId/statistics
GET /sensor-data/sensor/:sensorId/statistics?startDate=2024-01-01&endDate=2024-01-31
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

## 4. 💰 Price History

### Lấy lịch sử giá

```http
GET /vegetable/price-history/:vegetableId
GET /vegetable/price-history/:vegetableId?startDate=2024-01-01&endDate=2024-01-31
```

### Tự động lưu lịch sử

Lịch sử giá sẽ tự động được lưu khi cập nhật giá qua API:

```http
PATCH /vegetable/price/:id
Content-Type: application/json

{
  "price": 50000
}
```

---

## 5. 🗄️ Database Migration

Sau khi cập nhật schema, bạn cần chạy migration:

```bash
cd BE_Server-side
npx prisma migrate dev --name add_advanced_features
```

Hoặc nếu đang ở production:

```bash
npx prisma migrate deploy
```

Sau đó generate Prisma client:

```bash
npx prisma generate
```

---

## 6. 🔧 Cấu Hình

### MQTT Broker

Mặc định sử dụng HiveMQ public broker. Để thay đổi, cập nhật trong `mqtt.service.ts`:

```typescript
this.client = mqtt.connect('mqtt://your-broker:1883');
```

### Alert Thresholds

Có thể tạo alert rules qua API hoặc seed data:

```typescript
// Ví dụ: Tạo alert rule mặc định cho nhiệt độ
await prisma.alertRule.create({
  data: {
    gardenId: 1,
    sensorType: 'temperature',
    minValue: 15,
    maxValue: 35,
    alertOnMin: true,
    alertOnMax: true,
    severity: 'warning',
  },
});
```

---

## 7. 📱 Frontend Integration

### WebSocket Events

Frontend có thể lắng nghe các events sau:

```javascript
// Kết nối WebSocket
const socket = io('http://localhost:3000');

// Lắng nghe dữ liệu sensor (format mới)
socket.on('sensor/1/temperature', (data) => {
  console.log('Sensor data:', data);
  // data = { sensorId: 1, type: 'temperature', value: 25.5, timestamp: ... }
});

// Lắng nghe dữ liệu sensor (format cũ - backward compatible)
socket.on('temperature', (value) => {
  console.log('Temperature:', value);
});
```

### Notification Badge

```javascript
// Lấy số lượng thông báo chưa đọc
const response = await fetch('/notifications/unread/count', {
  headers: { Authorization: `Bearer ${token}` }
});
const { count } = await response.json();
```

---

## 8. 🧪 Testing

### Test MQTT

```bash
# Cài đặt mosquitto client
sudo apt-get install mosquitto-clients

# Publish test data
mosquitto_pub -h broker.hivemq.com -t "sensor/1/temperature" -m "30.5"
mosquitto_pub -h broker.hivemq.com -t "sensor/1/humidity" -m "70.2"
```

### Test API

```bash
# Test notifications
curl -X GET http://localhost:3000/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test alerts
curl -X GET http://localhost:3000/alerts \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test sensor data
curl -X GET http://localhost:3000/sensor-data/sensor/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 9. 🚀 Next Steps

Các tính năng có thể triển khai tiếp:

1. **Export/Import Data** - Xuất nhập Excel/CSV
2. **Image Upload** - Quản lý ảnh cho gardens và vegetables
3. **Advanced Analytics** - Báo cáo nâng cao với charts
4. **Task Scheduling** - Lên lịch tác vụ tự động
5. **Weather Integration** - Tích hợp dữ liệu thời tiết

Xem chi tiết trong file `ADVANCED_FEATURES.md`.

---

## 10. ⚠️ Lưu Ý

1. **Migration**: Luôn backup database trước khi chạy migration
2. **MQTT**: Đảm bảo MQTT broker có thể truy cập được
3. **Performance**: Với lượng dữ liệu sensor lớn, nên cân nhắc:
   - Indexing trên các trường thường query
   - Data retention policy (xóa dữ liệu cũ)
   - Pagination khi query dữ liệu
4. **Security**: Tất cả API endpoints đều yêu cầu authentication

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
- Logs của NestJS application
- Database connection
- MQTT broker connection
- Prisma client đã được generate chưa






