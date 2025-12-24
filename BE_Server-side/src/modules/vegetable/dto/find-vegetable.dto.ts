import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BQueryParams } from 'src/base/dto/base.dto';

export class FindVegetableDto extends BQueryParams
 {

  @ApiPropertyOptional({ description: 'Lọc theo tên loại rau' })
  @IsOptional()
  @IsString()
  name?: string;
}