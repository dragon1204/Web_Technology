<<<<<<< HEAD
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class VerifyTotpDto {
  @IsString()
  @ApiProperty({ description: "6-digit TOTP code", example: "123456" })
  code: string;
}
=======
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class VerifyTotpDto {
  @IsString()
  @ApiProperty({ description: "6-digit TOTP code", example: "123456" })
  code: string;
}
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
