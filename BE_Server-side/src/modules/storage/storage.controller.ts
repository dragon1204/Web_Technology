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
import { UsersService } from '../users/users.service';

@ApiTags('Storage')
@Controller('storage')
@ApiBearerAuth('access-token')
@UseGuards(AtGuard, RolesGuard)
export class StorageController {
  constructor(
    private readonly minioService: MinioService,
    private readonly usersService: UsersService,
  ) {}

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

    // Đặt tên file:
    // - Nếu FE truyền fileName -> dùng đúng
    // - Ngược lại để MinioService tự sinh theo timestamp + originalName
    const effectiveFileName = dto.fileName || undefined;

    // Nếu là upload avatar, cần xử lý xoá avatar cũ (tránh tràn bộ nhớ)
    let previousAvatarPath: string | null = null;
    if (folder === 'avatars' && user?.id) {
      try {
        const existingUser = await this.usersService.findUserById(user.id);
        previousAvatarPath = (existingUser as any)?.avatar || null;
      } catch (e) {
        // Nếu không lấy được user cũ thì bỏ qua, không chặn upload
        previousAvatarPath = null;
      }
    }

    const result = await this.minioService.uploadFile(file, folder, effectiveFileName);

    // Nếu upload avatar, cập nhật trường avatar & xoá file cũ (nếu cần)
    if (folder === 'avatars' && user?.id && result?.fileName) {
      try {
        const newAvatarPath = result.fileName as string;

        // Xoá avatar cũ nếu:
        // - Có previousAvatarPath
        // - Khác với file mới
        // - Là file trong MinIO (không phải URL tuyệt đối)
        if (
          previousAvatarPath &&
          previousAvatarPath !== newAvatarPath &&
          !/^https?:\/\//i.test(previousAvatarPath)
        ) {
          try {
            await this.minioService.deleteFile(previousAvatarPath);
          } catch (deleteErr) {
            console.error('Failed to delete old avatar from MinIO:', deleteErr);
          }
        }

        await this.usersService.updateUser(user.id, {
          avatar: newAvatarPath,
        } as any);
      } catch (error) {
        // Không chặn upload nếu update avatar thất bại, chỉ log lại
        console.error('Failed to update user avatar after upload:', error);
      }
    }

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

  @ApiOperation({ summary: 'Lấy URL của file (backend proxy URL) (CUSTOMER, USER, ADMIN)' })
  @Get('url/*')
  @Roles(Role.CUSTOMER, Role.USER, Role.ADMIN)
  @ApiQuery({ name: 'expiry', description: 'Thời gian hết hạn (giây) - không dùng nữa, giữ lại để tương thích', required: false, type: Number })
  async getFileUrl(
    @Req() req: Request,
    @Query('expiry') expiry?: number
  ) {
    // Extract file path from URL (remove /storage/url/ prefix and query params, then decode)
    const pathMatch = req.url.match(/\/storage\/url\/(.+?)(?:\?|$)/);
    const fileName = pathMatch ? decodeURIComponent(pathMatch[1]) : '';
    
    // Generate backend proxy URL instead of MinIO presigned URL
    // This ensures authentication and doesn't require MinIO to be accessible from browser
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3000';
    const backendUrl = `${protocol}://${host}/storage/view/${encodeURIComponent(fileName)}`;

    return {
      message: 'File URL generated successfully',
      data: {
        url: backendUrl,
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
