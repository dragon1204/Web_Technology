import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsPositive } from "class-validator";

export class UpdatePriceDto {
    @ApiPropertyOptional({description: "Giá của rau sau khi cập nhật", example: "1500"})
    @IsNumber()
    @IsPositive()
    price : number;
}