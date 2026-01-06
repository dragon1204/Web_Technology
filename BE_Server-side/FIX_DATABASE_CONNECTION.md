# 🔧 Fix Database Connection với Phần Cứng

## ✅ Các Thay Đổi Đã Thực Hiện

### 1. **Fix Schema Prisma**
- ✅ Tách `SensorData` thành 2 model riêng:
  - `SensorData`: Dữ liệu từ Device (theo deviceMac)
  - `SensorReading`: Dữ liệu từ Sensor cũ (theo sensorId)
- ✅ Thêm các model: `SensorType`, `Sensor`
- ✅ Thêm các field vào `Garden`: `area`, `location`, `description`
- ✅ Đảm bảo tất cả field cần thiết cho phần cứng đã có: `deviceMac`, `temperature`, `humidity`, `soil`, `pumpControl`

### 2. **Fix Code Issues**
- ✅ Xóa `prisma.config.ts` (không cần thiết)
- ✅ Fix `analytics.service.ts`: SQL injection với Prisma.sql
- ✅ Fix `sale.service.ts`: Dùng `vegetable_garden` thay vì `vegetableGarden`
- ✅ Fix `garden.service.ts`: Fix `pumpControl` enum values
- ✅ Fix merge conflicts trong tất cả files

### 3. **Fix Bugs**
- ✅ Fix `capitalize` function trong `audit.interceptor.ts`
- ✅ Tạo `websocket.gateway.ts` cho sensor module
- ✅ Fix SQL injection vulnerabilities

## 🚀 Các Bước Tiếp Theo

### Bước 1: Generate Prisma Client

```bash
cd BE_Server-side
npx prisma generate
```

### Bước 2: Tạo Migration (nếu cần)

```bash
npx prisma migrate dev --name fix_hardware_connection
```

Hoặc nếu đã có database:

```bash
npx prisma migrate deploy
```

### Bước 3: Kiểm Tra TypeScript

```bash
npx tsc --noEmit
```

### Bước 4: Chạy Seed (nếu cần)

```bash
npm run db:seed
```

## 📋 Schema Changes Summary

### Models Mới:
- `SensorType`: Loại sensor (Temperature, Humidity, etc.)
- `Sensor`: Sensor trong vườn
- `SensorReading`: Dữ liệu đọc từ sensor (map tới table `SensorReading`)

### Models Đã Sửa:
- `SensorData`: Dữ liệu từ Device (map tới table `SensorData`)
- `Garden`: Thêm `area`, `location`, `description`

### Tables:
- `SensorData`: Dữ liệu từ Device (deviceMac-based)
- `SensorReading`: Dữ liệu từ Sensor (sensorId-based)

## ⚠️ Lưu Ý

1. **Device vs Sensor**: 
   - Device: Phần cứng thực tế (ESP32) → `SensorData` table
   - Sensor: Sensor logic trong hệ thống → `SensorReading` table

2. **PumpControl**: Enum values là `AUTO`, `ON`, `OFF` (không có `MANUAL_ON`, `MANUAL_OFF`)

3. **VegetableGarden**: Model name là `VegetableGarden`, table name là `vegetable_garden`

## 🔍 Kiểm Tra

Sau khi generate Prisma client, kiểm tra:

```typescript
// Device data
prisma.sensorData.findMany()

// Sensor readings  
prisma.sensorReading.findMany()

// Gardens với device
prisma.garden.findMany({ include: { device: true } })
```


