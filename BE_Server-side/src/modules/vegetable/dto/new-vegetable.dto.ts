import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class NewVegetableDto{
    @ApiPropertyOptional({description: "Tên loại rau", example: "rau cải xanh"})
    @IsString()
    name : string;

}