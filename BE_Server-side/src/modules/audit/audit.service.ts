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
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async findByEntity(entityType: string, entityId: string, limit: number = 50) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async findByRequestId(requestId: string) {
    return this.prisma.auditLog.findMany({
      where: { requestId },
      orderBy: { timestamp: 'asc' },
    });
  }

  async findRecent(limit: number = 100) {
    return this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
