import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID của đơn hàng',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty({ message: 'Order ID is required' })
  orderId: number;

  @ApiProperty({
    description: 'URL redirect sau khi thanh toán thành công',
    example: 'http://localhost:3001/payment/success',
  })
  @IsUrl(
    { require_tld: false },
    { message: 'Return URL must be a valid URL' },
  )
  @IsNotEmpty({ message: 'Return URL is required' })
  returnUrl: string;

  @ApiProperty({
    description: 'URL redirect khi hủy thanh toán',
    example: 'http://localhost:3001/payment/cancel',
    required: false,
  })
  @IsUrl(
    { require_tld: false },
    { message: 'Cancel URL must be a valid URL' },
  )
  @IsOptional()
  cancelUrl?: string;

  @ApiProperty({
    description: 'Thời gian hết hạn payment link (Unix timestamp - seconds)',
    example: 1735689600,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  expiredAt?: number;
}
