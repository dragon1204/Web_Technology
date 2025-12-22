import { Module } from '@nestjs/common';
import { AdminGardenController } from './controler/admin-garden.controller';
import { GardenService } from './garden.service';
import { UserGardenController } from './controler/user-garden.controler';
import { SaleController } from './sale/sale.controller';
import { SaleService } from './sale/sale.service';

@Module({
  controllers: [AdminGardenController, UserGardenController, SaleController],
  providers: [GardenService, SaleService]
})
export class GardenModule {}
