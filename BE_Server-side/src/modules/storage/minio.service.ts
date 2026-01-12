import { Injectable, Logger, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as MinIO from 'minio';
import { Readable } from 'stream';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: MinIO.Client | null = null;
  private readonly bucketName: string;
  private readonly endPoint: string;
  private readonly port: number;
  private readonly useSSL: boolean;
  private readonly accessKey: string;
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.endPoint = this.configService.get<string>('MINIO_ENDPOINT') || 'localhost';
    this.port = parseInt(this.configService.get<string>('MINIO_PORT') || '9000');
    this.useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
    this.accessKey = this.configService.get<string>('MINIO_ACCESS_KEY') || '';
    this.secretKey = this.configService.get<string>('MINIO_SECRET_KEY') || '';
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME') || 'files';
  }

  async onModuleInit() {
    if (!this.accessKey || !this.secretKey) {
      this.logger.warn('MinIO credentials not found. File upload will be disabled.');
      this.logger.warn('Please set MINIO_ACCESS_KEY and MINIO_SECRET_KEY in .env file');
      return;
    }

    try {
      this.minioClient = new MinIO.Client({
        endPoint: this.endPoint,
        port: this.port,
        useSSL: this.useSSL,
        accessKey: this.accessKey,
        secretKey: this.secretKey,
      });

      // Test connection
      await this.minioClient.listBuckets();
      this.logger.log(`✅ Connected to MinIO at ${this.endPoint}:${this.port}`);

      // Initialize bucket
      await this.initializeBucket();
    } catch (error) {
      this.logger.error(`❌ Failed to connect to MinIO: ${error.message}`);
      this.logger.error(`   Endpoint: ${this.endPoint}:${this.port}`);
      this.logger.error(`   Please ensure MinIO is running and credentials are correct`);
      this.minioClient = null;
    }
  }

  private async initializeBucket() {
    if (!this.minioClient) {
      return;
    }

    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`✅ Bucket "${this.bucketName}" created successfully`);
      } else {
        this.logger.log(`✅ Bucket "${this.bucketName}" already exists`);
      }
    } catch (error) {
      this.logger.error(`❌ Error initializing bucket "${this.bucketName}": ${error.message}`);
      this.logger.error(`   Error details: ${JSON.stringify(error)}`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
    customFileName?: string
  ): Promise<{ url: string; fileName: string; size: number }> {
    if (!this.minioClient) {
      throw new BadRequestException('MinIO is not configured or not connected. Please check your MinIO configuration and ensure MinIO server is running.');
    }

    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = customFileName || `${folder}/${timestamp}-${originalName}`;
    
    const metaData = {
      'Content-Type': file.mimetype,
      'Original-Name': file.originalname,
    };

    try {
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        metaData
      );

      const url = await this.getFileUrl(fileName);
      
      return {
        url,
        fileName,
        size: file.size,
      };
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads'
  ): Promise<{ url: string; fileName: string; size: number }[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async getFile(fileName: string): Promise<{ stream: Readable; metaData: MinIO.BucketItemStat }> {
    if (!this.minioClient) {
      throw new BadRequestException('MinIO is not configured or not connected. Please check your MinIO configuration and ensure MinIO server is running.');
    }

    try {
      const stat = await this.minioClient.statObject(this.bucketName, fileName);
      const stream = await this.minioClient.getObject(this.bucketName, fileName);
      
      return {
        stream,
        metaData: stat,
      };
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        throw new NotFoundException(`File "${fileName}" not found`);
      }
      this.logger.error(`Error getting file: ${error.message}`);
      throw new BadRequestException(`Failed to get file: ${error.message}`);
    }
  }

  async getFileUrl(fileName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    if (!this.minioClient) {
      throw new BadRequestException('MinIO is not configured or not connected. Please check your MinIO configuration and ensure MinIO server is running.');
    }

    try {
      // Generate presigned URL (valid for 7 days by default)
      const url = await this.minioClient.presignedGetObject(this.bucketName, fileName, expiry);
      return url;
    } catch (error) {
      this.logger.error(`Error generating file URL: ${error.message}`);
      throw new BadRequestException(`Failed to generate file URL: ${error.message}`);
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    if (!this.minioClient) {
      throw new BadRequestException('MinIO is not configured or not connected. Please check your MinIO configuration and ensure MinIO server is running.');
    }

    try {
      await this.minioClient.removeObject(this.bucketName, fileName);
      this.logger.log(`File "${fileName}" deleted successfully`);
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  async deleteMultipleFiles(fileNames: string[]): Promise<void> {
    if (!this.minioClient) {
      throw new BadRequestException('MinIO is not configured or not connected. Please check your MinIO configuration and ensure MinIO server is running.');
    }

    try {
      await this.minioClient.removeObjects(this.bucketName, fileNames);
      this.logger.log(`${fileNames.length} files deleted successfully`);
    } catch (error) {
      this.logger.error(`Error deleting files: ${error.message}`);
      throw new BadRequestException(`Failed to delete files: ${error.message}`);
    }
  }

  async listFiles(folder?: string, recursive: boolean = true): Promise<MinIO.BucketItem[]> {
    if (!this.minioClient) {
      throw new BadRequestException('MinIO is not configured or not connected. Please check your MinIO configuration and ensure MinIO server is running.');
    }

    try {
      const objectsList: MinIO.BucketItem[] = [];
      const prefix = folder ? `${folder}/` : '';

      const objectsStream = this.minioClient.listObjects(
        this.bucketName,
        prefix,
        recursive
      );

      for await (const obj of objectsStream) {
        objectsList.push(obj);
      }

      return objectsList;
    } catch (error) {
      this.logger.error(`Error listing files: ${error.message}`);
      throw new BadRequestException(`Failed to list files: ${error.message}`);
    }
  }

  async getFileInfo(fileName: string): Promise<MinIO.BucketItemStat> {
    if (!this.minioClient) {
      throw new BadRequestException('MinIO is not configured or not connected. Please check your MinIO configuration and ensure MinIO server is running.');
    }

    try {
      const stat = await this.minioClient.statObject(this.bucketName, fileName);
      return stat;
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        throw new NotFoundException(`File "${fileName}" not found`);
      }
      this.logger.error(`Error getting file info: ${error.message}`);
      throw new BadRequestException(`Failed to get file info: ${error.message}`);
    }
  }

  async fileExists(fileName: string): Promise<boolean> {
    if (!this.minioClient) {
      return false;
    }

    try {
      await this.minioClient.statObject(this.bucketName, fileName);
      return true;
    } catch (error) {
      return false;
    }
  }
}
