

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class LoginDto {
    @IsString()

    @ApiProperty({description:"email for logining", example:"Long1234@gmail.com"})
    email: string;

    @IsString()

    @ApiProperty({description:"password for logining", example: "1234"})
    password: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: "TOTP code if 2FA is enabled", example: "123456" })
    totpCode?: string;
}
