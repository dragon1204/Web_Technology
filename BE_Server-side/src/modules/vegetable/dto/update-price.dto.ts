import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min } from "class-validator";

export class UpdatePriceDto {
    @ApiProperty({ description: "Giá mới của rau củ", example: 15000 })
    @IsNumber()
    @Min(0)
    price: number;
}

