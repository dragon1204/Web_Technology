import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AtGuard } from '../auth/guard/auth.guards';
import { RolesGuard } from '../auth/guard/roles.guards';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Audit Logs')
@Controller('audit')
@UseGuards(AtGuard, RolesGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @ApiOperation({ summary: 'Get recent audit logs (ADMIN only)' })
  @Roles(Role.ADMIN)
  @Get('recent')
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecent(@Query('limit') limit?: string) {
    return this.auditService.findRecent(limit ? parseInt(limit) : 100);
  }

  @ApiOperation({ summary: 'Get audit logs for current user' })
  @Get('my-logs')
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyLogs(@Req() req, @Query('limit') limit?: string) {
    return this.auditService.findByUser(req.user.id, limit ? parseInt(limit) : 50);
  }

  @ApiOperation({ summary: 'Get audit logs by entity (ADMIN only)' })
  @Roles(Role.ADMIN)
  @Get('by-entity')
  @ApiQuery({ name: 'entityType', required: true, type: String })
  @ApiQuery({ name: 'entityId', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getByEntity(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findByEntity(entityType, entityId, limit ? parseInt(limit) : 50);
  }

  @ApiOperation({ summary: 'Get audit logs by request ID (ADMIN only)' })
  @Roles(Role.ADMIN)
  @Get('by-request')
  @ApiQuery({ name: 'requestId', required: true, type: String })
  async getByRequest(@Query('requestId') requestId: string) {
    return this.auditService.findByRequestId(requestId);
  }
}
