import { PartialType } from '@nestjs/swagger';
import { CreateAlertRuleDto } from './create-alert-rule.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAlertRuleDto extends PartialType(CreateAlertRuleDto) {
  @ApiProperty({ description: 'Is the rule active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

