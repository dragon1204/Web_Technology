import {IsNotEmpty, IsString} from "class-validator"
import { Role } from "@prisma/client";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UserDto {
    @IsString()
    @ApiProperty({description: "the email of the user", example: "Long1234@gmail.com"})
    email: string;

    @IsString()
    @ApiProperty({description: "the password of the user", example: "1234"})
    password: string;

    @IsString()
    @ApiPropertyOptional({ description: "the name of the user", example: "Long Vu" })
    name: string;

    @ApiPropertyOptional({ description: "the roles of the user", example: ["ADMIN", "USER"] })
    role: Role;
}

