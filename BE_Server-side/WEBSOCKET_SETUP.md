# 📡 WebSocket Setup Guide

## Tổng Quan

Hệ thống sử dụng Socket.IO để thiết lập WebSocket connection giữa Backend (NestJS) và Frontend (React) để nhận dữ liệu sensor realtime.

## Cấu Hình Backend

### WebSocket Gateway

File: `BE_Server-side/src/modules/device/websoket/device.gateway.ts`

```typescript
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  path: `/socket.io`,
  namespace: `/devices`,
})
```

**Lưu ý**: WebSocket gateway sẽ tự động chạy trên cùng port với HTTP server (mặc định: 3000).

### Các Events

#### 1. Client → Server

- **`iot/garden/join`**: Join vào room của một garden để nhận dữ liệu sensor
  ```typescript
  {
    deviceMac: string
  }
  ```

- **`iot/device/pair`**: Bắt đầu chế độ pairing
  ```typescript
  {
    gardenId: number
  }
  ```

- **`iot/device/pump`**: Điều khiển bơm
  ```typescript
  {
    mac: string,
    action: 'ON' | 'OFF' | 'AUTO'
  }
  ```

#### 2. Server → Client

- **`iot/sensor`**: Dữ liệu sensor mới từ MQTT
  ```typescript
  {
    mac: string,
    temperature: number,
    humidity: number,
    soil: number,
    pumpMode: string,
    timestamp: Date
  }
  ```

- **`pumpStatusUpdate`**: Cập nhật trạng thái bơm
  ```typescript
  {
    mac: string,
    status: 'ON' | 'OFF' | 'AUTO'
  }
  ```

- **`iot/device/pair/success`**: Pairing thành công
- **`iot/device/pair/timeout`**: Pairing timeout

## Luồng Dữ Liệu

```
ESP32 (MQTT)
  ↓
MQTT Broker
  ↓
Backend MQTT Service (mqtt.service.ts)
  ↓
DeviceService.handleSensorData()
  ↓
Prisma (Lưu vào DB)
  ↓
WebSocket Gateway.sendSensorDataToRoom()
  ↓
Frontend WebSocket Client
  ↓
React Component (useWebSocket hook)
  ↓
UI Update
```

## Kiểm Tra

### 1. Kiểm tra WebSocket Gateway đã khởi động

Khi Backend start, bạn sẽ thấy log:
```
Client connected: <socket-id>
```

### 2. Test với Socket.IO Client

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000/devices', {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  
  // Join garden room
  socket.emit('iot/garden/join', { deviceMac: 'AA:BB:CC:DD:EE:FF' });
});

socket.on('iot/sensor', (data) => {
  console.log('Sensor data:', data);
});
```

### 3. Kiểm tra MQTT → WebSocket

Khi ESP32 gửi dữ liệu lên MQTT topic `/iot/{mac}/sensor`, bạn sẽ thấy:
1. Log ở MQTT service: "Received MQTT message..."
2. Log ở DeviceService: "Sensor data saved..."
3. Log ở WebSocket Gateway: "Client {id} joined room: {mac}"
4. Frontend nhận được event `iot/sensor`

## Troubleshooting

### WebSocket không kết nối được

1. **Kiểm tra port**: Đảm bảo WebSocket gateway chạy trên cùng port với HTTP server
2. **Kiểm tra CORS**: CORS config phải cho phép origin của Frontend
3. **Kiểm tra path**: Path phải là `/socket.io` (mặc định của Socket.IO)
4. **Kiểm tra namespace**: Client phải connect tới namespace `/devices`

### Không nhận được dữ liệu sensor

1. **Kiểm tra MQTT**: Đảm bảo MQTT service đang chạy và subscribe đúng topic
2. **Kiểm tra deviceMac**: Đảm bảo deviceMac trong MQTT message khớp với deviceMac khi join room
3. **Kiểm tra room**: Client phải join room trước khi nhận dữ liệu
4. **Kiểm tra logs**: Xem logs ở Backend để debug

### Lỗi CORS

Nếu gặp lỗi CORS, cập nhật CORS config ở `main.ts`:

```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
});
```

Và WebSocket gateway:

```typescript
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
  // ...
})
```

## Best Practices

1. **Error Handling**: Luôn xử lý lỗi khi emit/receive events
2. **Reconnection**: Socket.IO tự động reconnect, nhưng có thể thêm logic retry
3. **Room Management**: Luôn leave room cũ trước khi join room mới
4. **Data Validation**: Validate dữ liệu trước khi emit/receive
5. **Logging**: Log các events quan trọng để debug

## Environment Variables

Không cần cấu hình thêm environment variables cho WebSocket. WebSocket gateway sẽ tự động chạy trên cùng port với HTTP server.

Nếu cần cấu hình riêng, có thể thêm vào `.env`:

```env
WS_PORT=3001  # Optional, mặc định dùng PORT
```

Và cập nhật gateway:

```typescript
@WebSocketGateway(process.env.WS_PORT || 3000, {
  // ...
})
```
