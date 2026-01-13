import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, IsEnum } from 'class-validator';
import { OtpType } from './send-otp.dto';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'OTP code is required' })
  @Length(6, 6, { message: 'OTP code must be 6 digits' })
  code: string;

  @ApiProperty({
    description: 'Type of OTP (REGISTER or FORGOT_PASSWORD)',
    enum: OtpType,
    example: OtpType.REGISTER,
  })
  @IsEnum(OtpType, { message: 'OTP type must be REGISTER or FORGOT_PASSWORD' })
  @IsNotEmpty({ message: 'OTP type is required' })
  type: OtpType;
}
