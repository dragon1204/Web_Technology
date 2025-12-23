import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Role } from "@prisma/client";
<<<<<<< HEAD
import { IsString } from "class-validator";
=======
import { IsEnum, IsString } from "class-validator";
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb

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
<<<<<<< HEAD
=======
    @IsEnum(Role)
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
    role: Role;
    
}