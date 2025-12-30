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
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { AtGuard } from 'src/modules/auth/guard/auth.guards';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(AtGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a notification (Admin only)' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  findAll(@Request() req, @Query('isRead') isRead?: string) {
    const isReadBool = isRead === 'true' ? true : isRead === 'false' ? false : undefined;
    return this.notificationService.findAll(req.user.id, isReadBool);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread notification count' })
  getUnreadCount(@Request() req) {
    return this.notificationService.findUnreadCount(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationService.markAsRead(+id, req.user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@Request() req) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  remove(@Param('id') id: string, @Request() req) {
    return this.notificationService.delete(+id, req.user.id);
  }
}

