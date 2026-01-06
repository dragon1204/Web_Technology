import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AlertService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async checkAndCreateAlert(
    sensorId: number | undefined,
    value: number,
    sensorType?: string,
    deviceMac?: string,
    gardenId?: number,
  ) {
    // Build where clause - support both old sensorId and new deviceMac/gardenId approach
    const whereConditions: any[] = [];
    
    if (sensorType) {
      whereConditions.push({ sensorType });
    }
    
    // If gardenId is provided, use it directly
    if (gardenId) {
      whereConditions.push({ gardenId });
    }
    
    // Legacy support: if sensorId provided, try to find by sensorId (may not work with new schema)
    if (sensorId) {
      whereConditions.push({ sensorId });
    }

    // Tìm các alert rules liên quan
    const rules = await this.prisma.alertRule.findMany({
      where: {
        isActive: true,
        OR: whereConditions.length > 0 ? whereConditions : undefined,
      },
      include: {
        garden: {
          include: {
            owner: true,
          },
        },
      },
    });

    const createdAlerts: any[] = [];

    for (const rule of rules) {
      let shouldAlert = false;
      let message = '';

      // Kiểm tra min value
      if (rule.alertOnMin && rule.minValue !== null && value < rule.minValue) {
        shouldAlert = true;
        message = `${sensorType || 'Sensor'} có giá trị ${value} thấp hơn ngưỡng tối thiểu ${rule.minValue}`;
      }

      // Kiểm tra max value
      if (rule.alertOnMax && rule.maxValue !== null && value > rule.maxValue) {
        shouldAlert = true;
        message = `${sensorType || 'Sensor'} có giá trị ${value} cao hơn ngưỡng tối đa ${rule.maxValue}`;
      }

      if (shouldAlert) {
        // Kiểm tra xem đã có alert chưa được giải quyết chưa
        const existingAlert = await this.prisma.alert.findFirst({
          where: {
            ruleId: rule.id,
            sensorId: sensorId,
            isResolved: false,
          },
        });

        // Chỉ tạo alert mới nếu chưa có alert chưa được giải quyết
        if (!existingAlert) {
          const alert = await this.prisma.alert.create({
            data: {
              ruleId: rule.id,
              sensorId: sensorId || null,
              value,
              message,
              severity: rule.severity,
            },
          });

          createdAlerts.push(alert);

          // Tạo notification cho chủ vườn
          if (rule.garden?.owner) {
            await this.notificationService.createForUser(
              rule.garden.owner.id,
              `Cảnh báo ${rule.severity}: ${sensorType || 'Sensor'}`,
              message,
              'alert',
            );
          }
        }
      }
    }

    return createdAlerts;
  }

  async findAll(gardenId?: number, isResolved?: boolean) {
    const where: any = {};
    if (gardenId) {
      where.rule = { gardenId };
    }
    if (isResolved !== undefined) {
      where.isResolved = isResolved;
    }

    return this.prisma.alert.findMany({
      where,
      include: {
        rule: {
          include: {
            garden: true,
          },
        },
        sensor: {
          include: {
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolve(id: number) {
    return this.prisma.alert.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    });
  }

  async getActiveAlertsCount(gardenId?: number) {
    const where: any = { isResolved: false };
    if (gardenId) {
      where.rule = { gardenId };
    }

    return this.prisma.alert.count({ where });
  }
}

