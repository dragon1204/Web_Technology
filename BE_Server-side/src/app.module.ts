import { MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { EvnCheckMiddleware } from './common/midllewares/evn_check.midleware';
import { GardenModule } from './garden/garden.module';
import { VegetableModule } from './vegetable/vegetable.module';
import { SensorModule } from './sensor/sensor.module';


@Module({
  imports: [
    UsersModule, 
    PrismaModule,
    AuthModule,    
    ConfigModule.forRoot({
      isGlobal: true
    }), 
     GardenModule, VegetableModule, SensorModule],
  controllers: [],
  providers: [ PrismaService],
})

export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer){
    consumer.apply(EvnCheckMiddleware).forRoutes('*');
  }
}
