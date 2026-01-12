import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { MinioService } from './minio.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [MinioService],
  exports: [MinioService],
})
export class StorageModule {}
