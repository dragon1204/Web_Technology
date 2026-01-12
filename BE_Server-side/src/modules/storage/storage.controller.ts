import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
  Req,
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiConsumes, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { MinioService } from './minio.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { ListFilesDto } from './dto/list-files.dto';
import { AtGuard } from '../auth/guard/auth.guards';
import { RolesGuard } from '../auth/guard/roles.guards';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from '@prisma/client';
import { GetCurrentUser } from '../users/decorator/getCurrentUser.decorator';

@ApiTags('Storage')
@Controller('storage')
@ApiBearerAuth('access-token')
@UseGuards(AtGuard, RolesGuard)
export class StorageController {
  constructor(private readonly minioService: MinioService) {}

  @ApiOperation({ summary: 'Upload một file (CUSTOMER, USER, ADMIN)' })
  @Post('upload')
  @Roles(Role.CUSTOMER, Role.USER, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File cần upload',
        },
        folder: {
          type: 'string',
          description: 'Thư mục lưu trữ (avatars, products, documents)',
          example: 'avatars',
        },
        fileName: {
          type: 'string',
          description: 'Tên file tùy chỉnh',
          example: 'my-file.jpg',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query() dto: UploadFileDto,
    @GetCurrentUser() user: any
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const folder = dto.folder || 'uploads';
    const result = await this.minioService.uploadFile(file, folder, dto.fileName);

    return {
      message: 'File uploaded successfully',
      data: {
        ...result,
        originalName: file.originalname,
        mimeType: file.mimetype,
        uploadedBy: user.id,
        uploadedAt: new Date(),
      },
    };
  }

  @ApiOperation({ summary: 'Upload nhiều files (CUSTOMER, USER, ADMIN)' })
  @Post('upload/multiple')
  @Roles(Role.CUSTOMER, Role.USER, Role.ADMIN)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Danh sách files cần upload (tối đa 10 files)',
        },
        folder: {
          type: 'string',
          description: 'Thư mục lưu trữ',
          example: 'products',
        },
      },
    },
  })
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Query() dto: UploadFileDto,
    @GetCurrentUser() user: any
  ) {
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }

    const folder = dto.folder || 'uploads';
    const results = await this.minioService.uploadMultipleFiles(files, folder);

    return {
      message: `${files.length} files uploaded successfully`,
      data: results.map((result, index) => ({
        ...result,
        originalName: files[index].originalname,
        mimeType: files[index].mimetype,
        uploadedBy: user.id,
        uploadedAt: new Date(),
      })),
    };
  }

  @ApiOperation({ summary: 'Download file (CUSTOMER, USER, ADMIN)' })
  @Get('download/*')
  @Roles(Role.CUSTOMER, Role.USER, Role.ADMIN)
  async downloadFile(
    @Req() req: Request,
    @Res() res: Response
  ) {
    // Extract file path from URL (remove /storage/download/ prefix and decode)
    const pathMatch = req.url.match(/\/storage\/download\/(.+)/);
    const fileName = pathMatch ? decodeURIComponent(pathMatch[1]) : '';
    const { stream, metaData } = await this.minioService.getFile(fileName);

    res.setHeader('Content-Type', metaData.metaData?.['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Length', metaData.size.toString());
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${metaData.metaData?.['original-name'] || fileName}"`
    );

    stream.pipe(res);
  }

  @ApiOperation({ summary: 'Lấy URL của file (presigned URL) (CUSTOMER, USER, ADMIN)' })
  @Get('url/*')
  @Roles(Role.CUSTOMER, Role.USER, Role.ADMIN)
  @ApiQuery({ name: 'expiry', description: 'Thời gian hết hạn (giây)', required: false, type: Number })
  async getFileUrl(
    @Req() req: Request,
    @Query('expiry') expiry?: number
  ) {
    // Extract file path from URL (remove /storage/url/ prefix and query params, then decode)
    const pathMatch = req.url.match(/\/storage\/url\/(.+?)(?:\?|$)/);
    const fileName = pathMatch ? decodeURIComponent(pathMatch[1]) : '';
    const url = await this.minioService.getFileUrl(fileName, expiry || 7 * 24 * 60 * 60);

    return {
      message: 'File URL generated successfully',
      data: {
        url,
        fileName,
        expiry: expiry || 7 * 24 * 60 * 60,
        expiresAt: new Date(Date.now() + (expiry || 7 * 24 * 60 * 60) * 1000),
      },
    };
  }

  @ApiOperation({ summary: 'Xem thông tin file (CUSTOMER, USER, ADMIN)' })
  @Get('info/*')
  @Roles(Role.CUSTOMER, Role.USER, Role.ADMIN)
  async getFileInfo(@Req() req: Request) {
    // Extract file path from URL (remove /storage/info/ prefix and decode)
    const pathMatch = req.url.match(/\/storage\/info\/(.+)/);
    const fileName = pathMatch ? decodeURIComponent(pathMatch[1]) : '';
    const info = await this.minioService.getFileInfo(fileName);

    return {
      message: 'File info retrieved successfully',
      data: {
        fileName: fileName,
        size: info.size,
        contentType: info.metaData?.['content-type'],
        originalName: info.metaData?.['original-name'],
        lastModified: info.lastModified,
        etag: info.etag,
      },
    };
  }

  @ApiOperation({ summary: 'Danh sách files (CUSTOMER, USER, ADMIN)' })
  @Get('list')
  @Roles(Role.CUSTOMER, Role.USER, Role.ADMIN)
  @ApiQuery({ name: 'folder', description: 'Lọc theo thư mục', required: false })
  @ApiQuery({ name: 'recursive', description: 'Tìm kiếm đệ quy', required: false, type: Boolean })
  async listFiles(
    @Query('folder') folder?: string,
    @Query('recursive', new DefaultValuePipe(true), ParseBoolPipe) recursive?: boolean
  ) {
    const files = await this.minioService.listFiles(folder, recursive);

    return {
      message: 'Files listed successfully',
      data: {
        files: files.map(file => ({
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
          isDir: file.prefix !== undefined,
        })),
        total: files.length,
        folder: folder || 'root',
      },
    };
  }

  @ApiOperation({ summary: 'Xóa một file (USER, ADMIN)' })
  @Delete('delete/*')
  @Roles(Role.USER, Role.ADMIN)
  async deleteFile(@Req() req: Request) {
    // Extract file path from URL (remove /storage/delete/ prefix and decode)
    const pathMatch = req.url.match(/\/storage\/delete\/(.+)/);
    const fileName = pathMatch ? decodeURIComponent(pathMatch[1]) : '';
    await this.minioService.deleteFile(fileName);

    return {
      message: 'File deleted successfully',
      data: {
        fileName: fileName,
        deletedAt: new Date(),
      },
    };
  }

  @ApiOperation({ summary: 'Xóa nhiều files (USER, ADMIN)' })
  @Delete('delete/multiple')
  @Roles(Role.USER, Role.ADMIN)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Danh sách tên files cần xóa',
          example: ['uploads/file1.jpg', 'uploads/file2.jpg'],
        },
      },
    },
  })
  async deleteMultipleFiles(@Query('fileNames') fileNames: string | string[]) {
    const files = Array.isArray(fileNames) ? fileNames : [fileNames];
    
    if (files.length === 0) {
      throw new Error('No file names provided');
    }

    await this.minioService.deleteMultipleFiles(files);

    return {
      message: `${files.length} files deleted successfully`,
      data: {
        fileNames: files,
        deletedAt: new Date(),
      },
    };
  }

  @ApiOperation({ summary: 'Kiểm tra file có tồn tại không (CUSTOMER, USER, ADMIN)' })
  @Get('exists/*')
  @Roles(Role.CUSTOMER, Role.USER, Role.ADMIN)
  async fileExists(@Req() req: Request) {
    // Extract file path from URL (remove /storage/exists/ prefix and decode)
    const pathMatch = req.url.match(/\/storage\/exists\/(.+)/);
    const fileName = pathMatch ? decodeURIComponent(pathMatch[1]) : '';
    const exists = await this.minioService.fileExists(fileName);

    return {
      message: 'File existence checked',
      data: {
        fileName: fileName,
        exists,
      },
    };
  }
}
