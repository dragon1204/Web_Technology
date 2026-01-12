import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'CONFIRMED', description: 'Trạng thái mới của đơn hàng', enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
