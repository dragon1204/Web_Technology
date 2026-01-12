import { PartialType } from '@nestjs/swagger';
import { CreateShopDto } from './create-shop.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateShopDto extends PartialType(CreateShopDto) {
  @ApiProperty({ example: true, description: 'Trạng thái hoạt động của shop', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
