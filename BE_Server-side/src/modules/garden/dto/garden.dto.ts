import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, IsString, MaxLength } from "class-validator";

export class GardenDto {
    @ApiProperty({description:"tên khu vườn", example:"vườn rau nhiệt đới"})
    @IsString()
    @MaxLength(30)
    name : string;

}