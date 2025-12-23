<<<<<<< HEAD
import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, IsPositive, Min } from "class-validator";

export class CreateSaleDto {
    @ApiProperty({ description: "ID của loại rau cần bán", example: 1 })
    @IsInt()
    @IsPositive()
    vegetableId: number;

    @ApiProperty({ description: "Số lượng rau cần bán", example: 10 })
    @IsInt()
    @IsPositive()
    @Min(1)
    quantity: number;

    @ApiProperty({ description: "Giá bán tại thời điểm bán (VNĐ)", example: 15000 })
    @IsNumber()
    @IsPositive()
    priceAtSale: number;
}

=======
import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, IsPositive, Min } from "class-validator";

export class CreateSaleDto {
    @ApiProperty({ description: "ID của loại rau cần bán", example: 1 })
    @IsInt()
    @IsPositive()
    vegetableId: number;

    @ApiProperty({ description: "Số lượng rau cần bán", example: 10 })
    @IsInt()
    @IsPositive()
    @Min(1)
    quantity: number;

    @ApiProperty({ description: "Giá bán tại thời điểm bán (VNĐ)", example: 15000 })
    @IsNumber()
    @IsPositive()
    priceAtSale: number;
}

>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
