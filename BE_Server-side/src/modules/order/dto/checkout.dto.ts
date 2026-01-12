import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, MaxLength } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ example: 1, description: 'ID của shop' })
  @IsInt()
  shopId: number;

  @ApiProperty({ example: 1, description: 'ID của địa chỉ giao hàng' })
  @IsInt()
  shippingAddressId: number;

  @ApiProperty({ example: 'Giao hàng vào buổi sáng', description: 'Ghi chú cho đơn hàng', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
