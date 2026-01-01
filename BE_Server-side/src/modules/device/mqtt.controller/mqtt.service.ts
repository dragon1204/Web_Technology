import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { DeviceService } from '../device.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MqttService implements OnModuleInit {
  private client: mqtt.MqttClient;

  constructor(
    @Inject(forwardRef(() => DeviceService))
    private deviceService: DeviceService,
    private readonly configService: ConfigService,
  ) { }

  onModuleInit() {
    // Lấy cấu hình từ ConfigService
    const mqtt_url = this.configService.get<string>('MQTT_URL')!;


    this.client = mqtt.connect(mqtt_url);

    this.client.on('connect', () => {
      console.log('MQTT Connected to Broker');
      // Subscribe các topic từ thiết bị
      this.client.subscribe('/iot/+/sensor');
      this.client.subscribe('/iot/+/device/pair');
    });

    this.client.on('error', (err) => {
      console.error('MQTT Connection Error:', err);
    });

    this.client.on('message', async (topic, payload) => {
      await this.handleIncomingMessage(topic, payload.toString());
    });
  }

  publish(
    topic: string,
    message: string,
    options: mqtt.IClientPublishOptions = { qos: 1, retain: true },
  ) {
    if (this.client && this.client.connected) {
      this.client.publish(topic, message, options);
      console.log(`MQTT Published to ${topic}: ${message}`);
    } else {
      console.error('MQTT Client not connected, failed to publish');
    }
  }

  private async handleIncomingMessage(topic: string, message: string) {
    const parts = topic.split('/');
    if (parts.length < 4) {
      console.error(`⚠️ Topic không đúng định dạng: ${topic}`);
      return;
    }
    const macAddress = parts[2];
    const subTopic = parts[3];

    try {
      const data = JSON.parse(message);

      switch (subTopic) {
        case 'sensor':
          await this.deviceService.handleSensorData(macAddress, data);
          break;
        case 'device':
          if (parts[4] === 'pair') {
            await this.deviceService.handleHardwareDiscovery(macAddress, data);
          }
          break;
        default:
          console.warn(`❓ Nhận được subTopic lạ: ${subTopic} trên topic ${topic}`);
      }
    } catch (e) {
      console.error(`❌ Lỗi xử lý tin nhắn MQTT trên topic [${topic}]:`, e.message);
    }
  }
}