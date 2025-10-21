import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsPositive } from "class-validator";

export class UpdateSoldDto {
    @ApiPropertyOptional({description: "Số lượng rau đã bán", example: "1000"})
    @IsNumber()
    @IsPositive()
    sold : number;
}