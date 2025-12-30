import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReportTemplateService } from './report-template.service';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, ReportTemplateService],
  exports: [AnalyticsService, ReportTemplateService],
})
export class AnalyticsModule {}

