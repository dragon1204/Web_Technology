import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsEnum, IsNumber, IsOptional } from "class-validator"

export class RevenueVegetableDto {
    @ApiProperty({description: "Phân loại thời gian", example: "month", enum: ['day', 'week', 'month']})
    @IsEnum(['day', 'week', 'month'], { message: 'Type must be one of: day, week, month' })
    type: 'day' | 'week' | 'month'

    @ApiPropertyOptional({description: "Id của vườn", example: 1})
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    gardenId?: number

    @ApiPropertyOptional({description: "Id của rau", example: 1})
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    vegetableId?: number

}