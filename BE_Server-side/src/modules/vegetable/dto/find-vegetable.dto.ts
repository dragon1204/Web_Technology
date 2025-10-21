import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';

export class FindVegetableDto {
  @ApiPropertyOptional({ description: 'Số bản ghi bỏ qua', example: 0 })
  @IsOptional()
  @IsNumber()
  skip?: number;

  @ApiPropertyOptional({ description: 'Số bản ghi cần lấy', example: 10 })
  @IsOptional()
  @IsNumber()
  take?: number;
}
