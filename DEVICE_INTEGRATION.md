# Hướng dẫn tích hợp thiết bị IoT thật

## Tổng quan

Hệ thống hỗ trợ 2 chế độ điều khiển thiết bị:

1. **Chế độ mô phỏng (Simulator)**: Dùng Device Simulator chạy trên localhost:8080
2. **Chế độ thiết bị thật (Real Device)**: Kết nối với thiết bị IoT thật qua backend WebSocket

## Kiến trúc WebSocket

```
[Thiết bị IoT] <--MQTT/HTTP--> [Backend NestJS] <--Socket.IO--> [Frontend React]
                                      |
                                  WebSocket Gateway
                                      |
                            +--------+--------+
                            |                 |
                      Device Control    Sensor Data
```

## Frontend - SocketContext

### Các tính năng chính:

1. **Dual Mode Support**:

   - `deviceMode`: "simulator" hoặc "real"
   - `switchDeviceMode(mode)`: Chuyển đổi giữa 2 chế độ

2. **WebSocket Connections**:

   - Socket.IO cho backend (thiết bị thật)
   - WebSocket cho simulator (localhost:8080)

3. **Unified API**:
   - `sendDeviceCommand(deviceId, command, params)`: Gửi lệnh điều khiển
   - `subscribeTo(event, callback)`: Đăng ký nhận sự kiện
   - `emit(event, data)`: Gửi sự kiện

### Events từ Backend (Real Devices):

```javascript
// Danh sách thiết bị
socket.on("deviceList", (devices) => {
  // devices: Array of device objects
});

// Cập nhật trạng thái thiết bị
socket.on("deviceStatus", (data) => {
  // data: { deviceId, status, value, unit }
});

// Dữ liệu cảm biến
socket.on("sensorData", (data) => {
  // data: { sensorId, value, unit, timestamp }
});
```

### Gửi lệnh điều khiển:

```javascript
// Từ frontend
sendDeviceCommand(deviceId, "turn_on", { type: "pump" });
sendDeviceCommand(deviceId, "turn_off", { type: "light" });

// Backend nhận event "deviceControl"
socket.emit("deviceControl", {
  deviceId: "device_123",
  command: "turn_on",
  type: "pump",
});
```

## Backend - WebSocket Gateway

### File: `BE_Server-side/src/modules/sensor/websocket/websocket.gateway.ts`

Cần nâng cấp để xử lý:

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: "*" } })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private devices = new Map(); // Store connected devices

  handleConnection(client: Socket) {
    console.log("Client connected:", client.id);

    // Send current device list to new client
    const deviceList = Array.from(this.devices.values());
    client.emit("deviceList", deviceList);
  }

  handleDisconnect(client: Socket) {
    console.log("Client disconnected:", client.id);
  }

  // Nhận lệnh điều khiển từ frontend
  @SubscribeMessage("deviceControl")
  handleDeviceControl(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket
  ) {
    console.log("Device control command:", data);

    // TODO: Forward command to actual IoT device via MQTT/HTTP
    // For now, broadcast to all clients
    this.server.emit("deviceStatus", {
      deviceId: data.deviceId,
      status: data.command === "turn_on" ? "on" : "off",
      timestamp: new Date(),
    });

    return { success: true, message: "Command sent" };
  }

  // Nhận yêu cầu danh sách thiết bị
  @SubscribeMessage("requestDeviceList")
  handleRequestDeviceList(@ConnectedSocket() client: Socket) {
    const deviceList = Array.from(this.devices.values());
    client.emit("deviceList", deviceList);
  }

  // Method để thiết bị IoT đăng ký (gọi từ MQTT handler hoặc HTTP endpoint)
  registerDevice(device: any) {
    this.devices.set(device.id, device);
    this.server.emit("deviceList", Array.from(this.devices.values()));
  }

  // Method để cập nhật dữ liệu cảm biến
  sendSensorData(sensorId: string, value: number, unit: string) {
    this.server.emit("sensorData", {
      sensorId,
      value,
      unit,
      timestamp: new Date(),
    });
  }

  // Method để cập nhật trạng thái thiết bị
  updateDeviceStatus(deviceId: string, status: string, value?: any) {
    const device = this.devices.get(deviceId);
    if (device) {
      device.status = status;
      if (value !== undefined) device.value = value;
      this.devices.set(deviceId, device);
    }

    this.server.emit("deviceStatus", {
      deviceId,
      status,
      value,
      timestamp: new Date(),
    });
  }
}
```

## Tích hợp thiết bị IoT thật

### Phương án 1: MQTT

```typescript
// BE_Server-side/src/modules/iot/mqtt.service.ts
import { Injectable } from "@nestjs/common";
import * as mqtt from "mqtt";
import { WsGateway } from "../sensor/websocket/websocket.gateway";

@Injectable()
export class MqttService {
  private client: mqtt.MqttClient;

  constructor(private wsGateway: WsGateway) {
    this.connect();
  }

  connect() {
    this.client = mqtt.connect("mqtt://your-mqtt-broker:1883", {
      username: "your-username",
      password: "your-password",
    });

    this.client.on("connect", () => {
      console.log("Connected to MQTT broker");

      // Subscribe to device topics
      this.client.subscribe("garden/+/sensor/#");
      this.client.subscribe("garden/+/device/#");
    });

    this.client.on("message", (topic, message) => {
      const data = JSON.parse(message.toString());

      if (topic.includes("/sensor/")) {
        // Sensor data
        this.wsGateway.sendSensorData(data.sensorId, data.value, data.unit);
      } else if (topic.includes("/device/")) {
        // Device status
        this.wsGateway.updateDeviceStatus(
          data.deviceId,
          data.status,
          data.value
        );
      }
    });
  }

  // Gửi lệnh điều khiển đến thiết bị
  sendCommand(deviceId: string, command: string) {
    const topic = `garden/device/${deviceId}/command`;
    this.client.publish(topic, JSON.stringify({ command }));
  }
}
```

### Phương án 2: HTTP Webhook

```typescript
// BE_Server-side/src/modules/iot/iot.controller.ts
import { Controller, Post, Body } from "@nestjs/common";
import { WsGateway } from "../sensor/websocket/websocket.gateway";

@Controller("iot")
export class IotController {
  constructor(private wsGateway: WsGateway) {}

  @Post("sensor-data")
  receiveSensorData(@Body() data: any) {
    this.wsGateway.sendSensorData(data.sensorId, data.value, data.unit);
    return { success: true };
  }

  @Post("device-status")
  receiveDeviceStatus(@Body() data: any) {
    this.wsGateway.updateDeviceStatus(data.deviceId, data.status, data.value);
    return { success: true };
  }
}
```

## Cấu trúc dữ liệu thiết bị

```typescript
interface Device {
  id: string;
  name: string;
  type: "pump" | "light" | "fan" | "sensor";
  status: "on" | "off" | "error";
  location: string;
  gardenId: number;
  controllable: boolean;
  value?: number;
  unit?: string;
}

interface SensorData {
  sensorId: string;
  value: number;
  unit: string;
  timestamp: Date;
}

interface DeviceCommand {
  deviceId: string;
  command: "turn_on" | "turn_off" | "set_value";
  value?: number;
  type?: string;
}
```

## Sử dụng trong Frontend

```javascript
import { useSocket } from "../contexts/SocketContext";

function MyComponent() {
  const {
    deviceMode,
    switchDeviceMode,
    sendDeviceCommand,
    subscribeTo,
    connected,
    simulatorConnected,
  } = useSocket();

  // Chuyển sang chế độ thiết bị thật
  const useRealDevices = () => {
    switchDeviceMode("real");
  };

  // Điều khiển thiết bị
  const controlDevice = (deviceId, command) => {
    sendDeviceCommand(deviceId, command, { type: "pump" });
  };

  // Lắng nghe dữ liệu cảm biến
  useEffect(() => {
    const unsubscribe = subscribeTo("sensorData", (data) => {
      console.log("Sensor data:", data);
    });
    return unsubscribe;
  }, []);

  return (
    <div>
      <button onClick={useRealDevices}>Chuyển sang thiết bị thật</button>
      <p>Trạng thái: {connected ? "Kết nối" : "Mất kết nối"}</p>
    </div>
  );
}
```

## Testing

### Test với Simulator:

```bash
cd BE_Server-side
npm run start:simulator
```

### Test với thiết bị thật:

1. Đảm bảo backend đang chạy
2. Kết nối thiết bị IoT với backend (MQTT/HTTP)
3. Chuyển sang chế độ "Thiết bị thật" trong UI
4. Kiểm tra console để xem WebSocket events

## Troubleshooting

### Không nhận được dữ liệu từ thiết bị:

- Kiểm tra thiết bị đã kết nối với backend chưa
- Xem log backend để kiểm tra MQTT/HTTP messages
- Kiểm tra WebSocket connection trong browser DevTools

### Lệnh điều khiển không hoạt động:

- Kiểm tra deviceId có đúng không
- Xem log backend để kiểm tra event "deviceControl"
- Đảm bảo thiết bị đang lắng nghe MQTT topic hoặc HTTP endpoint

### WebSocket bị disconnect:

- Kiểm tra token authentication
- Xem backend logs để tìm lỗi
- Kiểm tra CORS settings trong WebSocket gateway
