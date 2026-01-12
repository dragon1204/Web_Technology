import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindProductDto {
  @ApiProperty({ example: 1, description: 'Số trang', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ example: 10, description: 'Số lượng mỗi trang', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiProperty({ example: 1, description: 'Lọc theo shop ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  shopId?: number;

  @ApiProperty({ example: 'leafy', description: 'Lọc theo category', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 'rau cải', description: 'Tìm kiếm theo tên', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: 'price', description: 'Sắp xếp theo field', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ example: 'asc', description: 'Thứ tự sắp xếp (asc/desc)', required: false })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';
}
