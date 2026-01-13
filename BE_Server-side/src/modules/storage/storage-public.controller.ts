import {
  Controller,
  Get,
  Res,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { MinioService } from './minio.service';

@ApiTags('Storage')
@Controller('storage')
// No authentication guards - URLs are generated only for authenticated users
export class StoragePublicController {
  constructor(private readonly minioService: MinioService) {}

  @ApiOperation({ summary: 'View file inline (for images) - Public access for authenticated URLs' })
  @Get('view/*')
  async viewFile(
    @Req() req: Request,
    @Res() res: Response
  ) {
    // Extract file path from URL (remove /storage/view/ prefix and decode)
    const pathMatch = req.url.match(/\/storage\/view\/(.+?)(?:\?|$)/);
    const fileName = pathMatch ? decodeURIComponent(pathMatch[1]) : '';
    
    // Check if file exists
    const exists = await this.minioService.fileExists(fileName);
    if (!exists) {
      res.status(404).json({ message: 'File not found' });
      return;
    }
    
    const { stream, metaData } = await this.minioService.getFile(fileName);

    res.setHeader('Content-Type', metaData.metaData?.['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Length', metaData.size.toString());
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${metaData.metaData?.['original-name'] || fileName}"`
    );

    stream.pipe(res);
  }
}
