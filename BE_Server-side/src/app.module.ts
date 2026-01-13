import { MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { EvnCheckMiddleware } from './common/midllewares/evn_check.midleware';
import { RequestTracingMiddleware } from './common/midllewares/request-tracing.middleware';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { GardenModule } from './modules/garden/garden.module';
import { VegetableModule } from './modules/vegetable/vegetable.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AlertModule } from './modules/alert/alert.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DeviceModule } from './modules/device/device.module';
import { AuditInterceptor } from './common/interceptor/audit.interceptor';
import { ShopModule } from './modules/shop/shop.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { StorageModule } from './modules/storage/storage.module';
import { PaymentModule } from './modules/payment/payment.module';


@Module({
  imports: [
    UsersModule, 
    PrismaModule,
    AuthModule,
    AuditModule,    
    ConfigModule.forRoot({
      isGlobal: true
    }), 
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 60,
    }]),
     GardenModule, VegetableModule, DeviceModule, NotificationModule, AlertModule, AnalyticsModule,
     ShopModule, ProductModule, CartModule, OrderModule, StorageModule, PaymentModule],
  controllers: [],
  providers: [ 
    PrismaService, 
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    }
  ],
})

export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer){
    consumer
      .apply(RequestTracingMiddleware, EvnCheckMiddleware)
      .forRoutes('*');
  }
}
