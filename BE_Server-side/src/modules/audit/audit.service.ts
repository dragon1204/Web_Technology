import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface AuditLogData {
  action: string;
  entityType?: string;
  entityId?: string;
  userId?: number;
  changes?: any;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          userId: data.userId,
          changes: data.changes || null,
          requestId: data.requestId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          success: data.success ?? true,
          errorMessage: data.errorMessage,
        },
      });
      console.log(`📝 Audit: ${data.action} by user ${data.userId || 'anonymous'}`);
    } catch (error) {
      console.error('❌ Failed to write audit log:', error);
    }
  }

  async logLogin(userId: number, email: string, success: boolean, requestId?: string, ipAddress?: string, userAgent?: string, errorMessage?: string): Promise<void> {
    await this.log({
      action: 'LOGIN',
      entityType: 'User',
      entityId: String(userId),
      userId,
      requestId,
      ipAddress,
      userAgent,
      success,
      errorMessage,
      changes: { email, timestamp: new Date() },
    });
  }

  async logLogout(userId: number, requestId?: string, ipAddress?: string): Promise<void> {
    await this.log({
      action: 'LOGOUT',
      entityType: 'User',
      entityId: String(userId),
      userId,
      requestId,
      ipAddress,
      success: true,
    });
  }

  async logCreate(entityType: string, entityId: string, userId: number, data: any, requestId?: string): Promise<void> {
    await this.log({
      action: 'CREATE',
      entityType,
      entityId,
      userId,
      changes: { after: data },
      requestId,
      success: true,
    });
  }

  async logUpdate(entityType: string, entityId: string, userId: number, before: any, after: any, requestId?: string): Promise<void> {
    await this.log({
      action: 'UPDATE',
      entityType,
      entityId,
      userId,
      changes: { before, after },
      requestId,
      success: true,
    });
  }

  async logDelete(entityType: string, entityId: string, userId: number, data: any, requestId?: string): Promise<void> {
    await this.log({
      action: 'DELETE',
      entityType,
      entityId,
      userId,
      changes: { before: data },
      requestId,
      success: true,
    });
  }

  async findByUser(userId: number, limit: number = 50) {
    const logs = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    return logs.map((log) => ({ ...log, user }));
  }

  async findByEntity(entityType: string, entityId: string, limit: number = 50) {
    const logs = await this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    const userIds = [...new Set(logs.map((log) => log.userId).filter((id): id is number => id !== null && id !== undefined))];
    const users = userIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true, name: true, role: true },
        })
      : [];

    const userMap = new Map(users.map((u) => [u.id, u]));

    return logs.map((log) => ({
      ...log,
      user: log.userId ? userMap.get(log.userId) || null : null,
    }));
  }

  async findByRequestId(requestId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: { requestId },
      orderBy: { timestamp: 'asc' },
    });

    const userIds = [...new Set(logs.map((log) => log.userId).filter((id): id is number => id !== null && id !== undefined))];
    const users = userIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true, name: true, role: true },
        })
      : [];

    const userMap = new Map(users.map((u) => [u.id, u]));

    return logs.map((log) => ({
      ...log,
      user: log.userId ? userMap.get(log.userId) || null : null,
    }));
  }

  async findRecent(limit: number = 100) {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    // Manually join user data
    const userIds = [...new Set(logs.map((log) => log.userId).filter((id): id is number => id !== null && id !== undefined))];
    const users = userIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true, name: true, role: true },
        })
      : [];

    const userMap = new Map(users.map((u) => [u.id, u]));

    return logs.map((log) => ({
      ...log,
      user: log.userId ? userMap.get(log.userId) || null : null,
    }));
  }

  async findWithFilters(filters: {
    userId?: number;
    action?: string;
    entityType?: string;
    success?: boolean;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      userId,
      action,
      entityType,
      success,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 50,
    } = filters;

    const where: any = {};

    if (userId !== undefined) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (success !== undefined) {
      where.success = success;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { entityType: { contains: search, mode: 'insensitive' } },
        { entityId: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { errorMessage: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    // Manually join user data
    const userIds = [...new Set(data.map((log) => log.userId).filter((id): id is number => id !== null && id !== undefined))];
    const users = userIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true, name: true, role: true },
        })
      : [];

    const userMap = new Map(users.map((u) => [u.id, u]));

    const dataWithUsers = data.map((log) => ({
      ...log,
      user: log.userId ? userMap.get(log.userId) || null : null,
    }));

    return {
      data: dataWithUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStatistics(userId?: number, startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [total, byAction, bySuccess, byEntityType] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
      }),
      this.prisma.auditLog.groupBy({
        by: ['success'],
        where,
        _count: { success: true },
      }),
      this.prisma.auditLog.groupBy({
        by: ['entityType'],
        where,
        _count: { entityType: true },
      }),
    ]);

    return {
      total,
      byAction: byAction.map((item) => ({
        action: item.action,
        count: item._count.action,
      })),
      bySuccess: {
        success: bySuccess.find((item) => item.success === true)?._count.success || 0,
        failed: bySuccess.find((item) => item.success === false)?._count.success || 0,
      },
      byEntityType: byEntityType.map((item) => ({
        entityType: item.entityType,
        count: item._count.entityType,
      })),
    };
  }
}
