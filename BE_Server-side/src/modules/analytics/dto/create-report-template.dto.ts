import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject, IsBoolean } from 'class-validator';

export class CreateReportTemplateDto {
  @ApiProperty({ description: 'Tên báo cáo' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Mô tả', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Loại báo cáo',
    enum: ['revenue', 'productivity', 'sensor', 'custom'],
  })
  @IsEnum(['revenue', 'productivity', 'sensor', 'custom'])
  type: 'revenue' | 'productivity' | 'sensor' | 'custom';

  @ApiProperty({ description: 'Cấu hình báo cáo (JSON)', type: Object })
  @IsObject()
  config: any;

  @ApiProperty({ description: 'Có thể chia sẻ công khai', default: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

