import { Module } from '@nestjs/common';
import { MqttService } from './mqtt/mqtt.service';
import { WsGateway } from './websocket/websocket.gateway';
import { SensorDataService } from './sensor-data.service';
import { SensorController } from './sensor.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AlertModule } from '../alert/alert.module';

@Module({
  imports: [PrismaModule, AlertModule],
  controllers: [SensorController],
  providers: [MqttService, WsGateway, SensorDataService],
  exports: [SensorDataService],
})
export class SensorModule {}
