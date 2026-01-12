import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateShopDto {
  @ApiProperty({ example: 'Cửa hàng Rau Sạch ABC', description: 'Tên cửa hàng' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Chuyên cung cấp rau sạch, an toàn', description: 'Mô tả cửa hàng', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
