import { Injectable, NotFoundException, Inject, forwardRef, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MqttService } from './mqtt.controller/mqtt.service';
import { WsGateway } from './websoket.gateway/device.gateway';

@Injectable()
export class DeviceService {
    private readonly logger = new Logger(DeviceService.name);
    // Lưu trữ timer theo gardenId: Map<gardenId, Timeout>
    private pendingPairs = new Map<number, NodeJS.Timeout>();

    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => MqttService))
        private mqttService: MqttService,
        @Inject(forwardRef(() => WsGateway))
        private wsGateway: WsGateway,
    ) { }

    /**
     * 1. XỬ LÝ DỮ LIỆU CẢM BIẾN (MQTT -> DB -> WS)
     */
    async handleSensorData(mac: string, data: any) {
        const { temperature, humidity, soil, soilDigital, lightDigital } = data;

        try {
            await this.prisma.$transaction([
                this.prisma.sensorData.create({
                    data: {
                        deviceMac: mac,
                        temperature,
                        humidity,
                        soil,
                        soilDigital,
                        lightDigital,
                    },
                }),
                this.prisma.garden.updateMany({
                    where: { deviceMac: mac },
                    data: { temperature, humidity, soil, timestamp: new Date() },
                }),
            ]);

            // Gửi dữ liệu tới phòng (Room) tương ứng với địa chỉ MAC
            this.wsGateway.sendSensorDataToRoom(mac, {
                mac,
                temperature,
                humidity,
                soil,
                timestamp: new Date(),
            });
        } catch (error) {
            this.logger.error(`Lỗi cập nhật Sensor cho MAC ${mac}: ${error.message}`);
        }
    }

    /**
     * 2. BẬT CHẾ ĐỘ CHỜ PAIR (Web -> Server)
     */
    async startPairingMode(gardenId: number) {
        // Nếu vườn này đang trong chế độ chờ, xóa timer cũ để reset 4 phút
        if (this.pendingPairs.has(gardenId)) {
            clearTimeout(this.pendingPairs.get(gardenId));
        }

        this.logger.log(`⏳ Vườn ${gardenId} đang chờ thiết bị trong 4 phút...`);

        const timeout = setTimeout(() => {
            this.pendingPairs.delete(gardenId);
            this.wsGateway.server.to(`iot/${gardenId}`).emit('pair_timeout', {
                message: 'Hết thời gian chờ. Vui lòng thử lại.',
            });
            this.logger.warn(`TIMEOUT: Vườn ${gardenId} không tìm thấy thiết bị.`);
        }, 4 * 60 * 1000); // 4 phút

        this.pendingPairs.set(gardenId, timeout);
        return { status: 'pairing_mode_active', gardenId, expiresIn: '4m' };
    }

    /**
     * 3. PHÁT HIỆN THIẾT BỊ MỚI (MQTT -> Server)
     */
    async handleHardwareDiscovery(deviceMac: string, data: any) {
        // Lấy danh sách gardenId đang chờ
        const waitingGardenIds = Array.from(this.pendingPairs.keys());

        if (waitingGardenIds.length === 0) {
            this.logger.debug(`Nhận tín hiệu pair từ ${deviceMac} nhưng không có khu vườn nào đang đợi.`);
            return;
        }

        // Ở đây mặc định lấy gardenId đầu tiên đang chờ. 
        // Nếu hệ thống nhiều người dùng, bạn nên map theo userId để chính xác hơn.
        const gardenIdToPair = waitingGardenIds[0];

        try {
            const result = await this.pairDeviceToGarden(gardenIdToPair, deviceMac);

            // Hủy timer và xóa khỏi danh sách chờ
            clearTimeout(this.pendingPairs.get(gardenIdToPair));
            this.pendingPairs.delete(gardenIdToPair);

            // Báo thành công về Web qua Socket
            this.wsGateway.server.to(`iot/${gardenIdToPair}`).emit('pair_success', {
                deviceMac,
                garden: result,
            });

            this.logger.log(`✅ Kết nối thành công MAC ${deviceMac} vào Vườn ${gardenIdToPair}`);
        } catch (error) {
            this.logger.error(`Lỗi Pairing: ${error.message}`);
        }
    }

    /**
     * 4. LOGIC LIÊN KẾT DEVICE & GARDEN
     */
    async pairDeviceToGarden(gardenId: number, mac: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Đảm bảo thiết bị tồn tại trong bảng Device trước khi gán vào Garden
            await tx.device.upsert({
                where: { deviceMac: mac },
                update: {},
                create: {
                    deviceMac: mac,
                    model: 'ESP32_GENERIC',
                    name: `Device_${mac.slice(-4)}`,
                },
            });

            return await tx.garden.update({
                where: { id: gardenId },
                data: { deviceMac: mac },
            });
        });
    }

    /**
     * 5. ĐIỀU KHIỂN BƠM (Web -> MQTT)
     */
    async controlPump(mac: string, action: 'ON' | 'OFF' | 'AUTO') {
        const garden = await this.prisma.garden.findUnique({
            where: { deviceMac: mac },
        });

        if (!garden) throw new NotFoundException('Thiết bị này chưa được gắn vào khu vườn nào.');

        // Gửi lệnh xuống ESP32
        const topic = `/iot/${mac}/pump/state`;
        this.mqttService.publish(topic, action);

        // Cập nhật trạng thái hiển thị
        return await this.prisma.garden.update({
            where: { deviceMac: mac },
            data: { pumpControl: action },
        });
    }

    async getLatestGardenData(deviceMac: string) {
        return await this.prisma.garden.findUnique({
            where: { deviceMac: deviceMac },
            select: {
                temperature: true,
                humidity: true,
                soil: true,
                pumpControl: true,
                timestamp: true,
                name: true,
            }
        });
    }
}