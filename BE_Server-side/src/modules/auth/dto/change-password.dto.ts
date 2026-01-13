import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @IsString()
  @ApiProperty({ 
    description: "Current password", 
    example: "oldPassword123" 
  })
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: "New password must be at least 8 characters long" })
  @ApiProperty({ 
    description: "New password (minimum 8 characters)", 
    example: "newPassword123" 
  })
  newPassword: string;
}
