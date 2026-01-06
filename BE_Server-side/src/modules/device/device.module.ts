import { Module } from '@nestjs/common';
import { WsGateway } from './websoket/device.gateway';
import { MqttService } from './mqtt/mqtt.service';
import { DeviceService } from './device.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [MqttService, WsGateway, DeviceService],
  exports: [DeviceService, MqttService, WsGateway]
})
export class DeviceModule {}
