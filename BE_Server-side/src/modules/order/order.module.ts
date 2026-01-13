import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ShippingService } from './shipping.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CartModule } from '../cart/cart.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, CartModule, NotificationModule],
  controllers: [OrderController],
  providers: [OrderService, ShippingService],
  exports: [OrderService, ShippingService],
})
export class OrderModule {}
