import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class GetPriceHistoryDto {
  @ApiProperty({ description: 'Start date (ISO format)', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'End date (ISO format)', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}


