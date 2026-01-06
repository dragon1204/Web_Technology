import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { IsEnum, IsString } from "class-validator";

export class RegisterDto {
    @IsString()
    @ApiProperty({description:"email for registering", example:"Long1234@gmail.com"})
    email: string;

    @IsString()
    @ApiProperty({description:"password for registering", example: "1234"})
    password: string;

    @IsString()
    @ApiPropertyOptional({ description: "the name of the user", example: "Long Vu" })
    name: string;
}