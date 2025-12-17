import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class TokenDto{ 
    @IsNumber()
    @ApiProperty({description:"id of user", example:"1"})
    id: number;

    @IsString()
    @ApiProperty({description:"email of user", example:"Long1234@gmail.com"})
    email: string;

    @IsOptional()
    @ApiProperty({description:"name of user", example:"Long"})
    name: string | null;

    @IsString()
    @ApiProperty({description:"role of user", example:"USER"})
    @IsEnum(Role)
    role: Role;
}