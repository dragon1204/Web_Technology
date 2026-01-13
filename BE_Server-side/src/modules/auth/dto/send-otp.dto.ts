import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';

export enum OtpType {
  REGISTER = 'REGISTER',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
}

export class SendOtpDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Type of OTP (REGISTER or FORGOT_PASSWORD)',
    enum: OtpType,
    example: OtpType.REGISTER,
  })
  @IsEnum(OtpType, { message: 'OTP type must be REGISTER or FORGOT_PASSWORD' })
  @IsNotEmpty({ message: 'OTP type is required' })
  type: OtpType;
}
