import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Role } from "@prisma/client";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "the email of the user", example: "Long1234@gmail.com" })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "the password of the user", example: "1234" })
  password?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "the name of the user", example: "Long Vu" })
  name?: string;

  @IsOptional()
  @ApiPropertyOptional({ description: "the roles of the user", example: ["ADMIN", "USER"] })
  role?: Role;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "OAuth provider", example: "google" })
  provider?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "Provider ID from OAuth", example: "123456789" })
  providerId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "Avatar URL from OAuth", example: "https://..." })
  avatar?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "Hashed refresh token (internal use)", example: "<hashed>" })
  hashedRt?: string | null;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "TOTP secret for 2FA (internal use)", example: "NB2W45DFOIZA====" })
  totpSecret?: string | null;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: "Whether 2FA is enabled", example: false })
  isTwoFactorEnabled?: boolean;
}
