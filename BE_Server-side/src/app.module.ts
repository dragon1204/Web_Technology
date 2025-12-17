import { MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { EvnCheckMiddleware } from './common/midllewares/evn_check.midleware';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { GardenModule } from './modules/garden/garden.module';
import { VegetableModule } from './modules/vegetable/vegetable.module';
import { SensorModule } from './modules/sensor/sensor.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';


@Module({
  imports: [
    UsersModule, 
    PrismaModule,
    AuthModule,    
    ConfigModule.forRoot({
      isGlobal: true
    }), 
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 60,
    }]),
     GardenModule, VegetableModule, SensorModule],
  controllers: [],
  providers: [ PrismaService, {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  }],
})

export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer){
    consumer.apply(EvnCheckMiddleware).forRoutes('*');
  }
}
