import { Controller, Get, Query, Req, UseGuards, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';
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

  @ApiOperation({ summary: 'Get audit logs for current user with filters and pagination' })
  @Get('my-logs')
  @ApiQuery({ name: 'action', required: false, type: String, description: 'Filter by action (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, REGISTER)' })
  @ApiQuery({ name: 'entityType', required: false, type: String, description: 'Filter by entity type (User, Garden, Shop, etc.)' })
  @ApiQuery({ name: 'success', required: false, type: Boolean, description: 'Filter by success status' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO 8601 format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO 8601 format)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in action, entityType, entityId, ipAddress, errorMessage' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50)' })
  async getMyLogs(
    @Req() req,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('success') success?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Luôn filter theo userId của user hiện tại
    const filters: any = {
      userId: req.user.id,
      action,
      entityType,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    };

    if (success !== undefined) {
      filters.success = success === 'true';
    }

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    return this.auditService.findWithFilters(filters);
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

  @ApiOperation({ summary: 'Get audit logs with advanced filters and pagination' })
  @Get('search')
  @ApiQuery({ name: 'action', required: false, type: String, description: 'Filter by action (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, REGISTER)' })
  @ApiQuery({ name: 'entityType', required: false, type: String, description: 'Filter by entity type (User, Garden, Shop, etc.)' })
  @ApiQuery({ name: 'success', required: false, type: Boolean, description: 'Filter by success status' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO 8601 format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO 8601 format)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in action, entityType, entityId, ipAddress, errorMessage' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50)' })
  async search(
    @Req() req,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('success') success?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // USER chỉ có thể xem logs của chính mình
    const userId = req.user.role === Role.ADMIN ? undefined : req.user.id;

    const filters: any = {
      userId,
      action,
      entityType,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    };

    if (success !== undefined) {
      filters.success = success === 'true';
    }

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    return this.auditService.findWithFilters(filters);
  }

  @ApiOperation({ summary: 'Get audit log statistics (ADMIN: all, USER: own logs)' })
  @Get('statistics')
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO 8601 format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO 8601 format)' })
  async getStatistics(
    @Req() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // USER chỉ có thể xem statistics của chính mình
    const userId = req.user.role === Role.ADMIN ? undefined : req.user.id;

    const filters: any = {};
    if (userId) filters.userId = userId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.auditService.getStatistics(userId, filters.startDate, filters.endDate);
  }
}
