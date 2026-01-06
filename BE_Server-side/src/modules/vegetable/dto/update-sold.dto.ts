import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min } from "class-validator";

export class UpdateSoldDto {
    @ApiProperty({ description: "Số lượng đã bán", example: 50 })
    @IsNumber()
    @Min(0)
    sold: number;
}

