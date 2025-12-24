import { Module } from '@nestjs/common';
import { GardenService } from './garden.service';
import { SaleController } from './sale/sale.controller';
import { SaleService } from './sale/sale.service';
import { GardenController } from './garden.controller';

@Module({
  controllers: [GardenController, SaleController],
  providers: [GardenService, SaleService]
})
export class GardenModule {}
