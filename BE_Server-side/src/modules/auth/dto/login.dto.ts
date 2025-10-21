

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsString()

    @ApiProperty({description:"email for logining", example:"Long1234@gmail.com"})
    email: string;

    @IsString()

    @ApiProperty({description:"password for logining", example: "1234"})
    password: string;
}
