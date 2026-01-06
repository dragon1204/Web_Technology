import { Module } from '@nestjs/common';
import { GardenService } from './garden.service';
import { GardenController } from './garden.controler';
import { SaleService } from './sale/sale.service';
import { SaleController } from './sale/sale.controller';
import { DeviceService } from '../device/device.service';
import { MqttService } from '../device/mqtt/mqtt.service';
import { WsGateway } from '../device/websoket/device.gateway';

@Module({
  controllers: [GardenController, SaleController],
  providers: [GardenService, SaleService, DeviceService, MqttService, WsGateway]
})
export class GardenModule {}
