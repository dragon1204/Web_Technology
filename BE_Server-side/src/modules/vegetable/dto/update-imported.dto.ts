import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsPositive } from "class-validator";

export class UpdateImportedDto {
    @ApiPropertyOptional({description: "Số lượng rau đã nhập", example: "15000"})
    @IsNumber()
    @IsPositive()
    imported : number;
}