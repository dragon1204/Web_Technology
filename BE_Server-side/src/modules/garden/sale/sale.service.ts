import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Đường dẫn tùy project của bạn
import { CreateSaleDto } from './dto/create-sale.dto';
import { Role } from '@prisma/client';

@Injectable()
export class SaleService {
  constructor(private prisma: PrismaService) {}

  /**
   * Thực hiện bán rau: Kiểm tra quyền -> Kiểm tra kho -> Trừ kho -> Tạo hóa đơn
   */
  async sellVegetable(userId: number, gardenId: number, dto: CreateSaleDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra vườn có tồn tại và thuộc quyền sở hữu của User không
      const garden = await tx.garden.findUnique({
        where: { id: gardenId },
      });

      if (!garden) {
        throw new NotFoundException('Không tìm thấy vườn này');
      }

      if (garden.ownerId !== userId) {
        throw new ForbiddenException('Bạn không có quyền bán sản phẩm từ vườn của người khác');
      }

      // 2. Kiểm tra rau có trong vườn này không và số lượng đủ không
      const vegetableInGarden = await tx.vegetableGarden.findFirst({
        where: {
          gardenId: gardenId,
          vegetableId: dto.vegetableId,
        },
      });

      if (!vegetableInGarden || vegetableInGarden.quantity < dto.quantity) {
        throw new BadRequestException(
          `Số lượng rau trong vườn không đủ để bán (Hiện có: ${vegetableInGarden?.quantity || 0})`,
        );
      }

      // 3. Tạo bản ghi Sale
      const sale = await tx.sale.create({
        data: {
          gardenId: gardenId,
          vegetableId: dto.vegetableId,
          quantity: dto.quantity,
          priceAtSale: dto.priceAtSale,
          total: dto.quantity * dto.priceAtSale, // Tính tổng tiền tự động
        },
      });

      // 4. Cập nhật trừ số lượng trong VegetableGarden
      await tx.vegetableGarden.update({
        where: { id: vegetableInGarden.id },
        data: {
          quantity: {
            decrement: dto.quantity,
          },
        },
      });

      return sale;
    });
  }

  /**
   * Lấy danh sách lịch sử bán hàng
   */
  async getSalesByGarden(userId: number, userRole: string, gardenId: number) {
    // Kiểm tra quyền truy cập
    await this.validateGardenAccess(userId, userRole, gardenId);

    return this.prisma.sale.findMany({
      where: { gardenId },
      include: {
        vegetable: {
          select: { name: true }, // Lấy tên rau để hiển thị
        },
      },
      orderBy: { time: 'desc' },
    });
  }

  /**
   * Thống kê doanh thu của vườn
   */
  async getGardenRevenue(userId: number, userRole: string, gardenId: number) {
    // Kiểm tra quyền truy cập
    await this.validateGardenAccess(userId, userRole, gardenId);

    const stats = await this.prisma.sale.aggregate({
      where: { gardenId },
      _sum: {
        total: true,
        quantity: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      gardenId,
      totalRevenue: stats._sum.total || 0,
      totalQuantitySold: stats._sum.quantity || 0,
      totalTransactions: stats._count.id,
    };
  }

  /**
   * Hàm helper kiểm tra xem User có quyền xem dữ liệu của Garden không
   */
  private async validateGardenAccess(userId: number, userRole: string, gardenId: number) {
    const garden = await this.prisma.garden.findUnique({
      where: { id: gardenId },
    });

    if (!garden) {
      throw new NotFoundException('Không tìm thấy vườn');
    }

    // Nếu không phải ADMIN và không phải chủ vườn thì báo lỗi
    if (userRole !== Role.ADMIN && garden.ownerId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem thông tin vườn này');
    }
  }
}
