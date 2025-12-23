<<<<<<< HEAD
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
=======
import { Module } from '@nestjs/common';
import { GardenService } from './garden.service';
import { SaleController } from './sale/sale.controller';
import { SaleService } from './sale/sale.service';
import { GardenController } from './garden.controler';

@Module({
  controllers: [GardenController, SaleController],
  providers: [GardenService, SaleService]
})
export class GardenModule {}
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
