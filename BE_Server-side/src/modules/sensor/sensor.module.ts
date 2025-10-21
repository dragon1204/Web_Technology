import { Module } from '@nestjs/common';
import { MqttService } from './mqtt/mqtt.service';
import { WsGateway } from './websocket/websocket.gateway';


@Module({
  providers: [MqttService, WsGateway]
})
export class SensorModule {}
