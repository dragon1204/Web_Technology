import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { WsGateway } from '../websocket/websocket.gateway';
import { SensorDataService } from '../sensor-data.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MqttService implements OnModuleInit {
  private client: mqtt.MqttClient;

  constructor(
    private readonly wsGateway: WsGateway,
    @Inject(forwardRef(() => SensorDataService))
    private readonly sensorDataService: SensorDataService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.client = mqtt.connect('mqtt://broker.hivemq.com:1883');

    this.client.on('connect', () => {
      console.log('MQTT connected');
      // Subscribe to topics: format: sensor/{sensorId}/{type}
      // Hoặc có thể subscribe theo pattern: sensor/+/temperature, sensor/+/humidity
      this.client.subscribe(['humidity', 'temperature', 'sensor/+/+']);
    });

    this.client.on('message', async (topic, message) => {
      try {
        const payload = message.toString();
        let value: number;

        // Thử parse JSON trước (cho trường hợp payload là JSON object)
        try {
          const jsonData = JSON.parse(payload);
          
          // Nếu là object (ví dụ: {ax, ay, az} từ accelerometer)
          if (typeof jsonData === 'object' && jsonData !== null) {
            // Nếu có ax, ay, az (accelerometer data), tính magnitude
            if ('ax' in jsonData && 'ay' in jsonData && 'az' in jsonData) {
              const ax = parseFloat(jsonData.ax) || 0;
              const ay = parseFloat(jsonData.ay) || 0;
              const az = parseFloat(jsonData.az) || 0;
              // Tính magnitude: sqrt(ax^2 + ay^2 + az^2)
              value = Math.sqrt(ax * ax + ay * ay + az * az);
            }
            // Nếu có field 'value', dùng nó
            else if ('value' in jsonData) {
              value = parseFloat(jsonData.value);
            }
            // Nếu có field 'data' là số, dùng nó
            else if ('data' in jsonData && typeof jsonData.data === 'number') {
              value = jsonData.data;
            }
            // Lấy giá trị số đầu tiên tìm được
            else {
              const firstNumericValue = Object.values(jsonData).find(
                (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v)))
              );
              if (firstNumericValue !== undefined) {
                value = typeof firstNumericValue === 'number' 
                  ? firstNumericValue 
                  : parseFloat(firstNumericValue as string);
              } else {
                throw new Error('No numeric value found in JSON object');
              }
            }
          }
          // Nếu JSON là số
          else if (typeof jsonData === 'number') {
            value = jsonData;
          }
          // Nếu JSON là string số
          else if (typeof jsonData === 'string') {
            value = parseFloat(jsonData);
          }
          else {
            throw new Error('Cannot extract numeric value from JSON');
          }
        } catch (jsonError) {
          // Nếu không phải JSON, thử parse như số đơn giản
          value = parseFloat(payload);
        }

        if (isNaN(value)) {
          console.warn(`Invalid sensor value: ${payload}`);
          return;
        }

        // Xử lý topic format: sensor/{sensorId}/{type}
        if (topic.startsWith('sensor/')) {
          const parts = topic.split('/');
          if (parts.length === 3) {
            const sensorId = parseInt(parts[1]);
            const sensorType = parts[2];

            if (!isNaN(sensorId)) {
              // Lưu dữ liệu vào database
              const sensorData = await this.sensorDataService.create(sensorId, value);

              // Chỉ broadcast qua WebSocket nếu lưu thành công
              if (sensorData) {
                this.wsGateway.sendData(`sensor/${sensorId}/${sensorType}`, {
                  sensorId,
                  type: sensorType,
                  value,
                  timestamp: new Date(),
                });
              }
            }
          }
        } else {
          // Xử lý topic cũ (humidity, temperature) - backward compatibility
          // Tìm sensor đầu tiên có type tương ứng
          const sensorTypeName = topic === 'humidity' ? 'humidity' : 'temperature';
          
          const sensorType = await this.prisma.sensorType.findFirst({
            where: {
              name: {
                contains: sensorTypeName,
                mode: 'insensitive',
              },
            },
          });

          if (sensorType) {
            const sensors = await this.prisma.sensor.findMany({
              where: { typeId: sensorType.id },
              take: 1,
            });

            if (sensors.length > 0) {
              const sensorData = await this.sensorDataService.create(sensors[0].id, value);
              
              // Chỉ broadcast nếu lưu thành công
              if (sensorData) {
                // Broadcast qua WebSocket (backward compatibility)
                this.wsGateway.sendData(topic, payload);
              }
            }
          } else {
            // Broadcast ngay cả khi không tìm thấy sensor type (backward compatibility)
            this.wsGateway.sendData(topic, payload);
          }
        }
      } catch (error) {
        console.error('Error processing MQTT message:', error);
      }
    });
  }
}
