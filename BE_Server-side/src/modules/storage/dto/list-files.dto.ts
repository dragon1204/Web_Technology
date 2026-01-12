import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class ListFilesDto {
  @ApiProperty({ 
    example: 'avatars', 
    description: 'Lọc theo thư mục',
    required: false 
  })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiProperty({ 
    example: true, 
    description: 'Tìm kiếm đệ quy trong các thư mục con',
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  recursive?: boolean;
}
