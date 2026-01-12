import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min, IsBoolean, IsOptional } from 'class-validator';

export class AddProductDto {
  @ApiProperty({ example: 1, description: 'ID của vegetable' })
  @IsInt()
  vegetableId: number;

  @ApiProperty({ example: 1, description: 'ID của garden' })
  @IsInt()
  gardenId: number;

  @ApiProperty({ example: 35000, description: 'Giá bán tại shop (VNĐ)' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100, description: 'Số lượng có sẵn' })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: true, description: 'Có sẵn để bán không', required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
