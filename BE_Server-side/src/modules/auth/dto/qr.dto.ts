import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class QrDto {
  @IsString()
  @ApiProperty({ description: "otpauth URL to encode as QR", example: "otpauth://totp/WebTechnology:email@example.com?secret=XXXX&period=30&digits=6&algorithm=SHA1&issuer=WebTechnology" })
  otpauthUrl: string;
}
