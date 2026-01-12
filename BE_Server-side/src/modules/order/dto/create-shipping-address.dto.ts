import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateShippingAddressDto {
  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên người nhận' })
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: '0901234567', description: 'Số điện thoại' })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: '123 Đường ABC, Phường XYZ', description: 'Địa chỉ chi tiết' })
  @IsString()
  @MaxLength(500)
  address: string;

  @ApiProperty({ example: 'Phường 1', description: 'Phường/Xã', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ward?: string;

  @ApiProperty({ example: 'Quận 1', description: 'Quận/Huyện', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiProperty({ example: 'Hồ Chí Minh', description: 'Tỉnh/Thành phố' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: true, description: 'Đặt làm địa chỉ mặc định', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
