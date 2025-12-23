import { ApiPropertyOptional } from '@nestjs/swagger';
<<<<<<< HEAD
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
=======
import { IsOptional, IsString } from 'class-validator';
import { BQueryParams } from 'src/base/dto/base.dto';

export class FindVegetableDto extends BQueryParams
 {

  @ApiPropertyOptional({ description: 'Lọc theo tên loại rau' })
  @IsOptional()
  @IsString()
  name?: string;
}
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
