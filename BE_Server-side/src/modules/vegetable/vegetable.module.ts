import { Module } from '@nestjs/common';
import { VegetableController } from './vegetable.controller';
import { VegetableService } from './vegetable.service';

@Module({
  controllers: [VegetableController],
  providers: [VegetableService]
})
export class VegetableModule {}
