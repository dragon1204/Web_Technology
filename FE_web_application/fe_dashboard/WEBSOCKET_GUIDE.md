# 📡 Hướng Dẫn Sử Dụng WebSocket

## Tổng Quan

Hệ thống sử dụng WebSocket để nhận dữ liệu sensor realtime từ Backend. WebSocket được thiết lập giữa Frontend và Backend để cập nhật dữ liệu sensor theo thời gian thực.

## Cấu Hình

### Backend (NestJS)
- **Namespace**: `/devices`
- **Path**: `/socket.io`
- **Port**: Cùng port với HTTP server (mặc định: 3000)
- **CORS**: Cho phép tất cả origins (`*`)

### Frontend
- **URL**: Lấy từ `REACT_APP_WS_URL` hoặc `REACT_APP_API_URL` (mặc định: `http://localhost:3000`)
- **Namespace**: `/devices`
- **Path**: `/socket.io`

## Cài Đặt

### 1. Cài đặt dependencies

```bash
cd FE_web_application/fe_dashboard
npm install socket.io-client
```

### 2. Cấu hình Environment Variables

Thêm vào file `.env`:

```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=http://localhost:3000  # Optional, sẽ dùng REACT_APP_API_URL nếu không có
```

## Sử Dụng

### Cách 1: Sử dụng Custom Hook (Khuyến nghị)

```jsx
import { useWebSocket } from '../hooks/useWebSocket';

function MyComponent() {
  const {
    connected,
    sensorData,
    pumpStatus,
    error,
    controlPump,
  } = useWebSocket({
    deviceMac: 'AA:BB:CC:DD:EE:FF', // MAC address của device
    autoConnect: true,  // Tự động kết nối khi mount
    autoJoin: true,     // Tự động join room khi có deviceMac
  });

  if (!connected) {
    return <div>Đang kết nối...</div>;
  }

  if (error) {
    return <div>Lỗi: {error}</div>;
  }

  return (
    <div>
      <h3>Dữ liệu Sensor</h3>
      {sensorData && (
        <div>
          <p>Nhiệt độ: {sensorData.temperature}°C</p>
          <p>Độ ẩm: {sensorData.humidity}%</p>
          <p>Độ ẩm đất: {sensorData.soil}%</p>
        </div>
      )}
      
      <button onClick={() => controlPump('AA:BB:CC:DD:EE:FF', 'ON')}>
        Bật bơm
      </button>
    </div>
  );
}
```

### Cách 2: Sử dụng Component có sẵn

```jsx
import SensorDataDisplay from '../components/SensorData/SensorDataDisplay';

function MyComponent() {
  return (
    <SensorDataDisplay
      deviceMac="AA:BB:CC:DD:EE:FF"
      showControls={true}  // Hiển thị nút điều khiển bơm
    />
  );
}
```

### Cách 3: Sử dụng WebSocket Service trực tiếp

```jsx
import { useEffect, useState } from 'react';
import websocketService from '../services/websocket';

function MyComponent() {
  const [sensorData, setSensorData] = useState(null);

  useEffect(() => {
    // Kết nối WebSocket
    const token = localStorage.getItem('token');
    websocketService.connect(token);

    // Lắng nghe dữ liệu sensor
    const onSensorData = (data) => {
      setSensorData(data);
    };

    websocketService.on('sensorData', onSensorData);

    // Join garden room
    websocketService.joinGarden('AA:BB:CC:DD:EE:FF');

    // Cleanup
    return () => {
      websocketService.off('sensorData', onSensorData);
      websocketService.disconnect();
    };
  }, []);

  return (
    <div>
      {sensorData && (
        <div>
          <p>Nhiệt độ: {sensorData.temperature}°C</p>
          <p>Độ ẩm: {sensorData.humidity}%</p>
        </div>
      )}
    </div>
  );
}
```

## API Reference

### useWebSocket Hook

#### Parameters
- `deviceMac` (string, optional): MAC address của device
- `autoConnect` (boolean, default: true): Tự động kết nối khi mount
- `autoJoin` (boolean, default: true): Tự động join room khi có deviceMac

#### Returns
- `connected` (boolean): Trạng thái kết nối
- `sensorData` (object): Dữ liệu sensor mới nhất
- `pumpStatus` (object): Trạng thái bơm
- `initialData` (object): Dữ liệu ban đầu khi join room
- `error` (string): Thông báo lỗi (nếu có)
- `joinGarden(mac)` (function): Join vào room của một garden
- `controlPump(mac, action)` (function): Điều khiển bơm ('ON' | 'OFF' | 'AUTO')
- `startPairing(gardenId)` (function): Bắt đầu chế độ pairing
- `reconnect()` (function): Kết nối lại WebSocket

### WebSocket Service

#### Methods
- `connect(token)`: Kết nối tới WebSocket server
- `disconnect()`: Ngắt kết nối
- `joinGarden(deviceMac)`: Join vào room của một garden
- `leaveGarden()`: Rời khỏi room hiện tại
- `controlPump(mac, action)`: Điều khiển bơm
- `startPairing(gardenId)`: Bắt đầu chế độ pairing
- `on(event, callback)`: Đăng ký listener
- `off(event, callback)`: Hủy đăng ký listener
- `getConnectionStatus()`: Lấy trạng thái kết nối

#### Events
- `connected`: Khi kết nối thành công
- `disconnected`: Khi ngắt kết nối
- `error`: Khi có lỗi
- `sensorData`: Khi nhận dữ liệu sensor mới
- `pumpStatus`: Khi trạng thái bơm thay đổi
- `pairSuccess`: Khi pairing thành công
- `pairTimeout`: Khi pairing timeout

## Luồng Dữ Liệu

```
MQTT (ESP32) 
  ↓
Backend MQTT Service
  ↓
DeviceService.handleSensorData()
  ↓
WebSocket Gateway.sendSensorDataToRoom()
  ↓
Frontend WebSocket Client
  ↓
React Component (useWebSocket hook)
  ↓
UI Update
```

## Ví Dụ Tích Hợp Vào GardenList

```jsx
import SensorDataDisplay from '../components/SensorData/SensorDataDisplay';

function GardenList() {
  const [selectedGarden, setSelectedGarden] = useState(null);

  return (
    <div>
      {/* Danh sách gardens */}
      <List>
        {gardens.map((garden) => (
          <ListItem
            key={garden.id}
            onClick={() => setSelectedGarden(garden)}
          >
            {garden.name}
          </ListItem>
        ))}
      </List>

      {/* Hiển thị dữ liệu sensor khi chọn garden */}
      {selectedGarden?.deviceMac && (
        <SensorDataDisplay
          deviceMac={selectedGarden.deviceMac}
          showControls={true}
        />
      )}
    </div>
  );
}
```

## Troubleshooting

### WebSocket không kết nối được

1. Kiểm tra Backend đã chạy chưa
2. Kiểm tra CORS configuration ở Backend
3. Kiểm tra URL trong `.env` có đúng không
4. Kiểm tra console browser để xem lỗi cụ thể

### Không nhận được dữ liệu sensor

1. Kiểm tra deviceMac có đúng không
2. Kiểm tra đã join room chưa (`joinGarden()`)
3. Kiểm tra MQTT service ở Backend có hoạt động không
4. Kiểm tra ESP32 có gửi dữ liệu lên MQTT không

### Lỗi CORS

Thêm origin của Frontend vào CORS config ở Backend:

```typescript
// BE_Server-side/src/main.ts
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  // ...
});
```

## Best Practices

1. **Luôn cleanup**: Hủy đăng ký listeners và disconnect khi component unmount
2. **Error handling**: Luôn xử lý lỗi và hiển thị thông báo cho user
3. **Reconnection**: WebSocket service tự động reconnect, nhưng có thể thêm logic retry nếu cần
4. **Loading states**: Hiển thị loading state khi đang kết nối
5. **Fallback data**: Sử dụng `initialData` khi chưa có dữ liệu realtime
