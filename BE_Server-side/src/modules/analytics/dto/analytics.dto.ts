import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  IsString,
  IsArray,
  IsObject,
} from 'class-validator';

export class RevenueReportDto {
  @ApiProperty({
    description: 'Khoảng thời gian',
    enum: ['day', 'week', 'month', 'year'],
    default: 'month',
    required: false,
  })
  @IsEnum(['day', 'week', 'month', 'year'])
  @IsOptional()
  period?: 'day' | 'week' | 'month' | 'year';

  @ApiProperty({ description: 'Ngày bắt đầu (ISO format)', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'Ngày kết thúc (ISO format)', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ description: 'ID vườn', required: false })
  @IsNumber()
  @IsOptional()
  gardenId?: number;

  @ApiProperty({ description: 'ID rau củ', required: false })
  @IsNumber()
  @IsOptional()
  vegetableId?: number;
}

export class ProductivityReportDto {
  @ApiProperty({
    description: 'Khoảng thời gian',
    enum: ['day', 'week', 'month'],
    default: 'month',
    required: false,
  })
  @IsEnum(['day', 'week', 'month'])
  @IsOptional()
  period?: 'day' | 'week' | 'month';

  @ApiProperty({ description: 'Ngày bắt đầu (ISO format)', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'Ngày kết thúc (ISO format)', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ description: 'ID rau củ', required: false })
  @IsNumber()
  @IsOptional()
  vegetableId?: number;

  @ApiProperty({ description: 'ID vườn', required: false })
  @IsNumber()
  @IsOptional()
  gardenId?: number;
}

export class SensorReportDto {
  @ApiProperty({
    description: 'Khoảng thời gian',
    enum: ['hour', 'day', 'week', 'month'],
    default: 'day',
    required: false,
  })
  @IsEnum(['hour', 'day', 'week', 'month'])
  @IsOptional()
  period?: 'hour' | 'day' | 'week' | 'month';

  @ApiProperty({ description: 'Ngày bắt đầu (ISO format)', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'Ngày kết thúc (ISO format)', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class CustomReportDto {
  @ApiProperty({
    description: 'Loại báo cáo',
    enum: ['revenue', 'productivity', 'sensor', 'combined'],
  })
  @IsEnum(['revenue', 'productivity', 'sensor', 'combined'])
  type: 'revenue' | 'productivity' | 'sensor' | 'combined';

  @ApiProperty({
    description: 'Khoảng thời gian',
    enum: ['day', 'week', 'month', 'year'],
    required: false,
  })
  @IsEnum(['day', 'week', 'month', 'year'])
  @IsOptional()
  period?: 'day' | 'week' | 'month' | 'year';

  @ApiProperty({ description: 'Ngày bắt đầu (ISO format)', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'Ngày kết thúc (ISO format)', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ description: 'Filters', required: false, type: Object })
  @IsObject()
  @IsOptional()
  filters?: {
    gardenId?: number;
    vegetableId?: number;
    deviceMac?: string;
  };

  @ApiProperty({ description: 'Fields to include', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fields?: string[];

  @ApiProperty({ description: 'Group by fields', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  groupBy?: string[];
}



