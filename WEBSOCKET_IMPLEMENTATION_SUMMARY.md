# 📡 Tóm Tắt Thiết Lập WebSocket

## ✅ Đã Hoàn Thành

### Backend (NestJS)

1. **WebSocket Gateway** (`BE_Server-side/src/modules/device/websoket/device.gateway.ts`)
   - ✅ Cấu hình WebSocket với namespace `/devices`
   - ✅ Path: `/socket.io`
   - ✅ CORS: Cho phép tất cả origins
   - ✅ Chạy trên cùng port với HTTP server (mặc định: 3000)

2. **Events đã implement**:
   - ✅ `iot/garden/join`: Join room để nhận dữ liệu sensor
   - ✅ `iot/device/pair`: Bắt đầu chế độ pairing
   - ✅ `iot/device/pump`: Điều khiển bơm
   - ✅ `iot/sensor`: Broadcast dữ liệu sensor từ MQTT
   - ✅ `pumpStatusUpdate`: Cập nhật trạng thái bơm

3. **Tích hợp với MQTT**:
   - ✅ MQTT service nhận dữ liệu từ ESP32
   - ✅ DeviceService xử lý và lưu vào DB
   - ✅ WebSocket Gateway broadcast tới clients

### Frontend (React)

1. **WebSocket Service** (`FE_web_application/fe_dashboard/src/services/websocket.js`)
   - ✅ Singleton service để quản lý WebSocket connection
   - ✅ Tự động reconnect
   - ✅ Event listeners cho các events từ server
   - ✅ Methods: `connect()`, `disconnect()`, `joinGarden()`, `controlPump()`, etc.

2. **React Hook** (`FE_web_application/fe_dashboard/src/hooks/useWebSocket.js`)
   - ✅ Custom hook để sử dụng WebSocket dễ dàng
   - ✅ Tự động connect và join room
   - ✅ State management: `connected`, `sensorData`, `pumpStatus`, `error`
   - ✅ Methods: `joinGarden()`, `controlPump()`, `startPairing()`

3. **React Component** (`FE_web_application/fe_dashboard/src/components/SensorData/SensorDataDisplay.jsx`)
   - ✅ Component hiển thị dữ liệu sensor realtime
   - ✅ Hiển thị: Nhiệt độ, Độ ẩm, Độ ẩm đất, Trạng thái bơm
   - ✅ Tùy chọn điều khiển bơm
   - ✅ Loading và error states

4. **Dependencies**:
   - ✅ Đã thêm `socket.io-client` vào `package.json`

5. **Tài liệu**:
   - ✅ `WEBSOCKET_GUIDE.md`: Hướng dẫn sử dụng chi tiết
   - ✅ `WEBSOCKET_SETUP.md`: Hướng dẫn setup Backend

## 🚀 Cách Sử Dụng

### Bước 1: Cài đặt Dependencies

```bash
cd FE_web_application/fe_dashboard
npm install
```

### Bước 2: Cấu hình Environment Variables

Thêm vào `.env`:

```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=http://localhost:3000  # Optional
```

### Bước 3: Sử dụng trong Component

#### Cách 1: Sử dụng Component có sẵn (Khuyến nghị)

```jsx
import SensorDataDisplay from '../components/SensorData/SensorDataDisplay';

function MyComponent() {
  return (
    <SensorDataDisplay
      deviceMac="AA:BB:CC:DD:EE:FF"
      showControls={true}
    />
  );
}
```

#### Cách 2: Sử dụng Hook

```jsx
import { useWebSocket } from '../hooks/useWebSocket';

function MyComponent() {
  const { connected, sensorData, error } = useWebSocket({
    deviceMac: 'AA:BB:CC:DD:EE:FF',
  });

  return (
    <div>
      {connected && sensorData && (
        <div>
          <p>Nhiệt độ: {sensorData.temperature}°C</p>
          <p>Độ ẩm: {sensorData.humidity}%</p>
        </div>
      )}
    </div>
  );
}
```

#### Cách 3: Tích hợp vào GardenList

```jsx
import GardenDetail from './GardenDetail';

function GardenList() {
  const [selectedGarden, setSelectedGarden] = useState(null);

  return (
    <div>
      {/* Danh sách gardens */}
      {gardens.map((garden) => (
        <div key={garden.id} onClick={() => setSelectedGarden(garden)}>
          {garden.name}
        </div>
      ))}

      {/* Hiển thị dữ liệu sensor */}
      <GardenDetail
        garden={selectedGarden}
        open={!!selectedGarden}
        onClose={() => setSelectedGarden(null)}
      />
    </div>
  );
}
```

## 📋 Luồng Dữ Liệu

```
ESP32 (MQTT)
  ↓
MQTT Broker
  ↓
Backend MQTT Service
  ↓
DeviceService.handleSensorData()
  ↓
Prisma (Lưu vào DB)
  ↓
WebSocket Gateway.sendSensorDataToRoom()
  ↓
Frontend WebSocket Client
  ↓
useWebSocket Hook
  ↓
React Component
  ↓
UI Update (Realtime)
```

## 🔍 Kiểm Tra

### Backend

1. Start Backend server:
   ```bash
   cd BE_Server-side
   npm run start:dev
   ```

2. Kiểm tra logs:
   - Khi client connect: `Client connected: <socket-id>`
   - Khi join room: `Client {id} joined room: {mac}`
   - Khi nhận MQTT: Logs ở MQTT service và DeviceService

### Frontend

1. Start Frontend:
   ```bash
   cd FE_web_application/fe_dashboard
   npm start
   ```

2. Mở browser console:
   - Khi connect: `✅ WebSocket connected: <socket-id>`
   - Khi nhận dữ liệu: `📡 Received sensor data: {...}`

## 📚 Tài Liệu

- **Frontend Guide**: `FE_web_application/fe_dashboard/WEBSOCKET_GUIDE.md`
- **Backend Setup**: `BE_Server-side/WEBSOCKET_SETUP.md`

## ⚠️ Lưu Ý

1. **Port**: WebSocket chạy trên cùng port với HTTP server (mặc định: 3000)
2. **CORS**: Đảm bảo CORS config cho phép origin của Frontend
3. **DeviceMac**: Phải có deviceMac trong garden để nhận dữ liệu
4. **MQTT**: Đảm bảo MQTT service đang chạy và ESP32 đang gửi dữ liệu

## 🐛 Troubleshooting

Xem chi tiết trong:
- `FE_web_application/fe_dashboard/WEBSOCKET_GUIDE.md` (phần Troubleshooting)
- `BE_Server-side/WEBSOCKET_SETUP.md` (phần Troubleshooting)
