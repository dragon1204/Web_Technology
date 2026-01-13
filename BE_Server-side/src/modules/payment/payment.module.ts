import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PayOSService } from './payos.service';
import { OrderModule } from '../order/order.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [OrderModule, PrismaModule, NotificationModule],
  controllers: [PaymentController],
  providers: [PayOSService],
  exports: [PayOSService],
})
export class PaymentModule {}
