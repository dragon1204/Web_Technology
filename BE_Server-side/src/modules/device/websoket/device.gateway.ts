import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { forwardRef, Inject } from '@nestjs/common';
import { DeviceService } from '../device.service';

@WebSocketGateway(3001, {
  cors: '*',
  path: `/socket`,
  namespace: `/devices`,
})
export class WsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => DeviceService))
    private deviceService: DeviceService,
  ) { }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  /**
   * 1. Khi người dùng chọn một khu vườn, họ sẽ "Join" vào một căn phòng (Room)
   * dựa trên MAC Address để nhận dữ liệu Sensor realtime của vườn đó.
   */
  @SubscribeMessage('iot/garden/join')
  async handleSelectGarden(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { deviceMac: string },
  ) {
    // 1. Rời phòng cũ, vào phòng mới
    client.rooms.forEach((room) => {
      if (room !== client.id) client.leave(room);
    });
    client.join(data.deviceMac);

    // 2. Lấy dữ liệu mới nhất từ database
    const latestData = await this.deviceService.getLatestGardenData(
      data.deviceMac,
    );

    console.log(`Client ${client.id} joined room: ${data.deviceMac}`);

    // 3. Trả về cho giao diện ngay lập tức
    return {
      status: 'joined',
      room: data.deviceMac,
      initialData: latestData, // Dữ liệu này sẽ hiển thị lên UI ngay
    };
  }

  // 
  @SubscribeMessage('iot/device/pair')
  async handleStartPairing(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gardenId: number },
  ) {
    console.log(data.gardenId);
    client.join(`garden_${data.gardenId}`);
    return await this.deviceService.startPairingMode(data.gardenId);
  }

  notifyPairingSuccess(gardenId: number, deviceMac: string) {
    const roomName = `iot/${gardenId}`;
    this.server.to(roomName).emit('pairingSuccess', {
      status: 'success',
      mac: deviceMac,
      message: 'Thiết bị đã kết nối thành công!'
    });
    console.log(`Notified success to room ${roomName} for MAC: ${deviceMac}`);
  }

  /**
   * 3. Xử lý nút điều khiển bơm từ giao diện
   */
  @SubscribeMessage('iot/device/pump')
  async handleControlPump(
    @MessageBody() payload: { mac: string; action: 'ON' | 'OFF' | 'AUTO' },
  ) {
    try {
      const result = await this.deviceService.controlPump(
        payload.mac,
        payload.action,
      );

      // Bắn trạng thái mới về cho tất cả những người đang xem vườn này
      this.server.to(payload.mac).emit('pumpStatusUpdate', {
        mac: payload.mac,
        status: payload.action,
      });

      return { status: 'success', data: result };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Hàm dùng để DeviceService gọi khi có dữ liệu sensor từ MQTT đổ về
   */
  sendSensorDataToRoom(macAddress: string, data: any) {
    this.server.to(macAddress).emit('iot/sensor', data);
  }
}
