import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StoragePublicController } from './storage-public.controller';
import { MinioService } from './minio.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ConfigModule, UsersModule],
  controllers: [StorageController, StoragePublicController],
  providers: [MinioService],
  exports: [MinioService],
})
export class StorageModule {}
