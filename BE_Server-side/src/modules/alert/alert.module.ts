import { Module } from '@nestjs/common';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { AlertRuleService } from './alert-rule.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [AlertController],
  providers: [AlertService, AlertRuleService],
  exports: [AlertService, AlertRuleService],
})
export class AlertModule {}


