import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: createNotificationDto,
    });
  }

  async createForUser(
    userId: number,
    title: string,
    message: string,
    type: 'alert' | 'info' | 'warning' | 'success' = 'info',
  ) {
    return this.create({
      userId,
      title,
      message,
      type,
    });
  }

  async findAll(userId: number, isRead?: boolean) {
    const where: any = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUnreadCount(userId: number) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(id: number, userId: number) {
    return this.prisma.notification.updateMany({
      where: {
        id,
        userId, // Đảm bảo chỉ user sở hữu mới có thể đánh dấu đã đọc
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async delete(id: number, userId: number) {
    return this.prisma.notification.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }
}


