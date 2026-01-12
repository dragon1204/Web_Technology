import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WsGateway.name);
  private devices = new Map<string, any>(); // Store connected devices
  private clients = new Map<string, Socket>(); // Store connected clients

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.clients.set(client.id, client);

    // Send current device list to new client
    const deviceList = Array.from(this.devices.values());
    client.emit('deviceList', deviceList);

    // Send welcome message
    client.emit('notification', {
      type: 'info',
      message: 'Connected to GardenIoT WebSocket',
      timestamp: new Date(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client.id);
  }

  // Nhận lệnh điều khiển từ frontend
  @SubscribeMessage('deviceControl')
  handleDeviceControl(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Device control command from ${client.id}:`, data);

    const { deviceId, command, type } = data;

    // TODO: Forward command to actual IoT device via MQTT/HTTP
    // For now, simulate device response
    const device = this.devices.get(deviceId);

    if (device) {
      // Update device status
      device.status = command === 'turn_on' ? 'on' : 'off';
      device.lastUpdate = new Date();
      this.devices.set(deviceId, device);

      // Broadcast status update to all clients
      this.server.emit('deviceStatus', {
        deviceId,
        status: device.status,
        timestamp: new Date(),
      });

      this.logger.log(`Device ${deviceId} status updated to ${device.status}`);
    } else {
      this.logger.warn(`Device ${deviceId} not found`);
      client.emit('error', {
        message: `Device ${deviceId} not found`,
        timestamp: new Date(),
      });
    }

    return { success: true, message: 'Command sent', deviceId };
  }

  // Nhận yêu cầu danh sách thiết bị
  @SubscribeMessage('requestDeviceList')
  handleRequestDeviceList(@ConnectedSocket() client: Socket) {
    this.logger.log(`Device list requested by ${client.id}`);
    const deviceList = Array.from(this.devices.values());
    client.emit('deviceList', deviceList);
    return { success: true, count: deviceList.length };
  }

  // Method để thiết bị IoT đăng ký (gọi từ MQTT handler hoặc HTTP endpoint)
  registerDevice(device: any) {
    this.logger.log(`Registering device: ${device.id} - ${device.name}`);
    this.devices.set(device.id, {
      ...device,
      registeredAt: new Date(),
      lastUpdate: new Date(),
    });

    // Broadcast to all clients
    this.server.emit('deviceList', Array.from(this.devices.values()));
    this.server.emit('notification', {
      type: 'success',
      message: `Device ${device.name} connected`,
      timestamp: new Date(),
    });
  }

  // Method để xóa thiết bị
  unregisterDevice(deviceId: string) {
    this.logger.log(`Unregistering device: ${deviceId}`);
    this.devices.delete(deviceId);

    // Broadcast to all clients
    this.server.emit('deviceList', Array.from(this.devices.values()));
    this.server.emit('notification', {
      type: 'warning',
      message: `Device ${deviceId} disconnected`,
      timestamp: new Date(),
    });
  }

  // Method để cập nhật dữ liệu cảm biến
  sendSensorData(sensorId: string, value: number, unit: string) {
    this.logger.log(`Sensor data: ${sensorId} = ${value}${unit}`);

    const device = this.devices.get(sensorId);
    if (device) {
      device.value = value;
      device.unit = unit;
      device.lastUpdate = new Date();
      this.devices.set(sensorId, device);
    }

    this.server.emit('sensorData', {
      sensorId,
      value,
      unit,
      timestamp: new Date(),
    });
  }

  // Method để cập nhật trạng thái thiết bị
  updateDeviceStatus(deviceId: string, status: string, value?: any) {
    this.logger.log(`Device status update: ${deviceId} = ${status}`);

    const device = this.devices.get(deviceId);
    if (device) {
      device.status = status;
      if (value !== undefined) device.value = value;
      device.lastUpdate = new Date();
      this.devices.set(deviceId, device);
    }

    this.server.emit('deviceStatus', {
      deviceId,
      status,
      value,
      timestamp: new Date(),
    });
  }

  // Method để gửi data tùy chỉnh
  sendData(event: string, data: any) {
    this.logger.log(`Broadcasting event: ${event}`);
    this.server.emit(event, data);
  }

  // Get all connected devices
  getDevices() {
    return Array.from(this.devices.values());
  }

  // Get specific device
  getDevice(deviceId: string) {
    return this.devices.get(deviceId);
  }
}
