import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID to receive notification' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Notification type',
    enum: ['alert', 'info', 'warning', 'success'],
    default: 'info',
  })
  @IsEnum(['alert', 'info', 'warning', 'success'])
  type: 'alert' | 'info' | 'warning' | 'success';
}


