import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';

export class CreateAlertRuleDto {
  @ApiProperty({ description: 'Sensor type name (e.g., temperature, humidity, soil)' })
  @IsString()
  @IsOptional()
  sensorType?: string;

  @ApiProperty({ description: 'Minimum value threshold' })
  @IsNumber()
  @IsOptional()
  minValue?: number;

  @ApiProperty({ description: 'Maximum value threshold' })
  @IsNumber()
  @IsOptional()
  maxValue?: number;

  @ApiProperty({ description: 'Alert when value is below minimum' })
  @IsBoolean()
  @IsOptional()
  alertOnMin?: boolean;

  @ApiProperty({ description: 'Alert when value is above maximum' })
  @IsBoolean()
  @IsOptional()
  alertOnMax?: boolean;

  @ApiProperty({
    description: 'Alert severity level',
    enum: ['info', 'warning', 'critical'],
    default: 'warning',
  })
  @IsEnum(['info', 'warning', 'critical'])
  @IsOptional()
  severity?: string;

  @ApiProperty({ description: 'Garden ID' })
  @IsNumber()
  gardenId: number;
}



