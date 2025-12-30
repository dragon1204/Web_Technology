import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { UpdateAlertRuleDto } from './dto/update-alert-rule.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AlertRuleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAlertRuleDto: CreateAlertRuleDto, user: any) {
    // Kiểm tra quyền truy cập vườn
    const garden = await this.prisma.garden.findUnique({
      where: { id: createAlertRuleDto.gardenId },
    });

    if (!garden) {
      throw new ForbiddenException('Vườn không tồn tại');
    }

    if (user.role !== Role.ADMIN && garden.ownerId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền tạo alert rule cho vườn này');
    }

    return this.prisma.alertRule.create({
      data: createAlertRuleDto,
    });
  }

  async findAll(gardenId?: number, user?: any) {
    const where: any = {};
    if (gardenId) {
      where.gardenId = gardenId;
    }

    // Nếu không phải admin, chỉ lấy rules của vườn của user
    if (user && user.role !== Role.ADMIN) {
      const userGardens = await this.prisma.garden.findMany({
        where: { ownerId: user.id },
        select: { id: true },
      });
      where.gardenId = {
        in: userGardens.map((g) => g.id),
      };
    }

    return this.prisma.alertRule.findMany({
      where,
      include: {
        garden: true,
        sensor: {
          include: {
            type: true,
          },
        },
      },
    });
  }

  async findOne(id: number, user: any) {
    const rule = await this.prisma.alertRule.findUnique({
      where: { id },
      include: {
        garden: true,
      },
    });

    if (!rule) {
      throw new ForbiddenException('Alert rule không tồn tại');
    }

    if (user.role !== Role.ADMIN && rule.garden.ownerId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền truy cập alert rule này');
    }

    return rule;
  }

  async update(id: number, updateAlertRuleDto: UpdateAlertRuleDto, user: any) {
    await this.findOne(id, user); // Kiểm tra quyền

    return this.prisma.alertRule.update({
      where: { id },
      data: updateAlertRuleDto,
    });
  }

  async remove(id: number, user: any) {
    await this.findOne(id, user); // Kiểm tra quyền

    return this.prisma.alertRule.delete({
      where: { id },
    });
  }
}


