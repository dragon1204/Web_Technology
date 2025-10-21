import { Module } from '@nestjs/common';
import { AdminGardenController } from './controler/admin-garden.controller';
import { GardenService } from './garden.service';
import { UserGardenController } from './controler/user-garden.controler';

@Module({
  controllers: [AdminGardenController, UserGardenController],
  providers: [GardenService]
})
export class GardenModule {}
