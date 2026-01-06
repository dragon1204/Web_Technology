import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min } from "class-validator";

export class UpdateImportedDto {
    @ApiProperty({ description: "Số lượng nhập kho", example: 100 })
    @IsNumber()
    @Min(0)
    imported: number;
}

