import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReportTemplateDto } from './dto/create-report-template.dto';
import { UpdateReportTemplateDto } from './dto/update-report-template.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ReportTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateReportTemplateDto, userId: number) {
    return this.prisma.reportTemplate.create({
      data: {
        ...createDto,
        userId,
      },
    });
  }

  async findAll(userId: number, userRole: string) {
    const where: any = {
      OR: [
        { isPublic: true },
        { userId },
      ],
    };

    // Admin có thể xem tất cả
    if (userRole === Role.ADMIN) {
      delete where.OR;
    }

    return this.prisma.reportTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number, userRole: string) {
    const template = await this.prisma.reportTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Report template not found');
    }

    // Kiểm tra quyền truy cập
    if (
      userRole !== Role.ADMIN &&
      template.userId !== userId &&
      !template.isPublic
    ) {
      throw new ForbiddenException('You do not have access to this template');
    }

    return template;
  }

  async update(
    id: number,
    updateDto: UpdateReportTemplateDto,
    userId: number,
    userRole: string,
  ) {
    const template = await this.findOne(id, userId, userRole);

    // Chỉ owner hoặc admin mới có thể update
    if (userRole !== Role.ADMIN && template.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this template');
    }

    return this.prisma.reportTemplate.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number, userId: number, userRole: string) {
    const template = await this.findOne(id, userId, userRole);

    // Chỉ owner hoặc admin mới có thể xóa
    if (userRole !== Role.ADMIN && template.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this template');
    }

    return this.prisma.reportTemplate.delete({
      where: { id },
    });
  }
}



