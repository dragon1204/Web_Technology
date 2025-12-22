import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class NewVegetableDto{
    @ApiPropertyOptional({description: "Tên loại rau", example: "rau cải xanh"})
    @IsString()
    name : string;

    @ApiPropertyOptional({description: "Số lượng nhập", example: "1000"})
    @IsNumber()
    imported ?: number

    @ApiPropertyOptional({description: "Số lượng đã bán", example: "150"})
    @IsNumber()
    sold ?: number

    @ApiPropertyOptional({description: "giá rau", example: "15000"})
    @IsNumber()
    price ? : number
}