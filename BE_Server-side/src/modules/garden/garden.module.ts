import { Module } from '@nestjs/common';
import { GardenService } from './garden.service';
import { GardenController } from './garden.controller';
import { SaleService } from './sale/sale.service';
import { SaleController } from './sale/sale.controller';
import { DeviceModule } from '../device/device.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, DeviceModule],
  controllers: [GardenController, SaleController],
  providers: [GardenService, SaleService],
  exports: [GardenService, SaleService],
})
export class GardenModule {}
