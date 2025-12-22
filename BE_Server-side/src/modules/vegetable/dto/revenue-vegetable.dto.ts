import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsOptional } from "class-validator"

export class RevenueVegetableDto {
    @ApiPropertyOptional({description: "Phân loại thời gian", example: "day/week/month"})
    @IsOptional()
    type : 'day' | 'week' | 'month' 

    @ApiPropertyOptional({description: "Id của vườn", example: "1"})
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    gardenId : number

    @ApiPropertyOptional({description: "Id của rau", example: "1"})
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    vegetableId : number

}