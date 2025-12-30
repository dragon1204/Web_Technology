import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AlertService } from './alert.service';
import { AlertRuleService } from './alert-rule.service';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { UpdateAlertRuleDto } from './dto/update-alert-rule.dto';
import { AtGuard } from 'src/modules/auth/guard/auth.guards';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Alerts')
@ApiBearerAuth()
@Controller('alerts')
@UseGuards(AtGuard)
export class AlertController {
  constructor(
    private readonly alertService: AlertService,
    private readonly alertRuleService: AlertRuleService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all alerts' })
  findAll(@Query('gardenId') gardenId?: string, @Query('isResolved') isResolved?: string) {
    const gardenIdNum = gardenId ? +gardenId : undefined;
    const isResolvedBool = isResolved === 'true' ? true : isResolved === 'false' ? false : undefined;
    return this.alertService.findAll(gardenIdNum, isResolvedBool);
  }

  @Get('active/count')
  @ApiOperation({ summary: 'Get count of active alerts' })
  getActiveCount(@Query('gardenId') gardenId?: string) {
    const gardenIdNum = gardenId ? +gardenId : undefined;
    return this.alertService.getActiveAlertsCount(gardenIdNum);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Resolve an alert' })
  resolve(@Param('id') id: string) {
    return this.alertService.resolve(+id);
  }

  @Post('rules')
  @ApiOperation({ summary: 'Create an alert rule' })
  createRule(@Body() createAlertRuleDto: CreateAlertRuleDto, @Request() req) {
    return this.alertRuleService.create(createAlertRuleDto, req.user);
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get all alert rules' })
  findAllRules(@Query('gardenId') gardenId?: string, @Request() req?: any) {
    const gardenIdNum = gardenId ? +gardenId : undefined;
    return this.alertRuleService.findAll(gardenIdNum, req?.user);
  }

  @Get('rules/:id')
  @ApiOperation({ summary: 'Get an alert rule by ID' })
  findOneRule(@Param('id') id: string, @Request() req) {
    return this.alertRuleService.findOne(+id, req.user);
  }

  @Patch('rules/:id')
  @ApiOperation({ summary: 'Update an alert rule' })
  updateRule(
    @Param('id') id: string,
    @Body() updateAlertRuleDto: UpdateAlertRuleDto,
    @Request() req,
  ) {
    return this.alertRuleService.update(+id, updateAlertRuleDto, req.user);
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: 'Delete an alert rule' })
  removeRule(@Param('id') id: string, @Request() req) {
    return this.alertRuleService.remove(+id, req.user);
  }
}

