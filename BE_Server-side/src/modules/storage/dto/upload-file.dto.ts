import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({ 
    example: 'avatars', 
    description: 'Thư mục lưu trữ file (avatars, products, documents, etc.)',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  folder?: string;

  @ApiProperty({ 
    example: 'my-custom-file.jpg', 
    description: 'Tên file tùy chỉnh (nếu không có sẽ dùng tên gốc)',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;
}
