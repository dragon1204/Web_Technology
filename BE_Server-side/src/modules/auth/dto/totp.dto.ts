import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class VerifyTotpDto {
  @IsString()
  @ApiProperty({ description: "6-digit TOTP code", example: "123456" })
  code: string;
}
