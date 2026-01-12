import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 1, description: 'ID của shop product' })
  @IsInt()
  shopProductId: number;

  @ApiProperty({ example: 2, description: 'Số lượng' })
  @IsInt()
  @Min(1)
  quantity: number;
}
