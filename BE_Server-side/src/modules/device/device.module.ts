import { Module } from '@nestjs/common';
import { WsGateway } from './websoket/device.gateway';
import { MqttService } from './mqtt/mqtt.service';
import { DeviceService } from './device.service';

@Module({
  providers: [MqttService, WsGateway, DeviceService],
  exports: [DeviceService]
})
export class SensorModule {}
