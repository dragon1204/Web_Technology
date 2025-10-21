import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { IsString } from "class-validator";

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
    
    @ApiPropertyOptional({ description: "the roles of the user", example: "USER" })
    role: Role;
    
}