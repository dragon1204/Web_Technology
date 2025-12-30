import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewVegetableDto } from './dto/new-vegetable.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { UpdateImportedDto } from './dto/update-imported.dto';
import { UpdateSoldDto } from './dto/update-sold.dto';
import { PBaseService } from 'src/base/services/base.service';
import { Vegetable } from '@prisma/client';

@Injectable()
export class VegetableService extends PBaseService<Vegetable> {
    private readonly logger = new Logger(VegetableService.name);

    constructor(private readonly prisma: PrismaService) {
        // Khởi tạo Base Service với prisma model tương ứng
        super(prisma.vegetable);
    }

    /**
     * Ghi đè phương thức create để ánh xạ dữ liệu từ DTO
     * Tránh lỗi đệ quy vô hạn của phiên bản cũ
     */
    async createVegetable(payload: NewVegetableDto) {
        return await super.create({
            name: payload.name,
            imported: payload.imported ?? 0,
            sold: payload.sold ?? 0,
            price: payload.price ?? 0,
        });
    }

    /**
     * Sử dụng phương thức updateById từ Base Service 
     * Base Service đã tự động check findById bên trong
     */
    async updateImported(id: number, dto: UpdateImportedDto) {
        return await this.updateById(id, {
            imported: dto.imported,
        });
    }

    async updateSold(id: number, dto: UpdateSoldDto) {
        return await this.updateById(id, {
            sold: dto.sold,
        });
    }

    async updatePrice(id: number, dto: UpdatePriceDto, userId?: number) {
        // Lấy giá cũ trước khi cập nhật
        const vegetable = await this.findById(id);
        const oldPrice = vegetable.price;
        const newPrice = dto.price;

        // Cập nhật giá mới
        const updated = await this.updateById(id, {
            price: newPrice,
        });

        // Lưu lịch sử giá nếu giá thay đổi
        if (oldPrice !== newPrice) {
            await this.prisma.priceHistory.create({
                data: {
                    vegetableId: id,
                    price: newPrice,
                    changedBy: userId,
                },
            });
        }

        return updated;
    }

    /**
     * Các hàm thống kê nâng cao sử dụng Prisma trực tiếp
     */
    private validateType(type: string) {
        if (!['day', 'week', 'month'].includes(type)) {
            throw new BadRequestException('Type must be one of: day, week, month');
        }
    }

    async getPriceList(type: 'day' | 'week' | 'month', gardenId?: number, vegetableId?: number) {
        this.validateType(type);
        this.logger.log(`Getting price list with type: ${type}, gardenId: ${gardenId}, vegetableId: ${vegetableId}`);

        try {
            // Build WHERE conditions using Prisma's where clause
            const where: any = {};
            if (gardenId !== undefined && gardenId !== null) {
                where.gardenId = Number(gardenId);
            }
            if (vegetableId !== undefined && vegetableId !== null) {
                where.vegetableId = Number(vegetableId);
            }

            // Use Prisma's query builder for safer queries
            // First, get all sales with filters
            const sales = await this.prisma.sale.findMany({
                where,
                select: {
                    time: true,
                    total: true,
                    quantity: true,
                },
            });

            // Group by period using JavaScript (more reliable than raw SQL)
            const grouped = sales.reduce((acc, sale) => {
                const date = new Date(sale.time);
                let period: Date;

                switch (type) {
                    case 'day':
                        period = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                        break;
                    case 'week':
                        const weekStart = new Date(date);
                        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
                        period = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
                        break;
                    case 'month':
                        period = new Date(date.getFullYear(), date.getMonth(), 1);
                        break;
                    default:
                        period = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                }

                const periodKey = period.toISOString();
                if (!acc[periodKey]) {
                    acc[periodKey] = {
                        period: period.toISOString(),
                        totalRevenue: 0,
                        totalQuantity: 0,
                    };
                }

                acc[periodKey].totalRevenue += Number(sale.total) || 0;
                acc[periodKey].totalQuantity += Number(sale.quantity) || 0;

                return acc;
            }, {} as Record<string, { period: string; totalRevenue: number; totalQuantity: number }>);

            // Convert to array and sort
            const result = Object.values(grouped).sort((a, b) => 
                new Date(a.period).getTime() - new Date(b.period).getTime()
            );
            
            this.logger.log(`Successfully retrieved ${result.length} revenue records`);
            return result;
        } catch (error) {
            // Log the error for debugging
            this.logger.error('Error in getPriceList:', error);
            this.logger.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            this.logger.error('Query parameters:', { type, gardenId, vegetableId });
            
            // Re-throw BadRequestException as-is
            if (error instanceof BadRequestException) {
                throw error;
            }
            
            // Check if it's a database connection error
            if (error instanceof Error && (
                error.message.includes("Can't reach database") ||
                error.message.includes('P1001') ||
                error.message.includes('connection')
            )) {
                throw new BadRequestException(
                    'Database connection error. Please try again in a few moments.'
                );
            }
            
            // Wrap other errors with more details
            throw new BadRequestException(
                `Failed to fetch revenue list: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    async getTotalRevenue(type: 'day' | 'week' | 'month', gardenId?: number, vegetableId?: number) {
        this.validateType(type);
        
        // Lưu ý: Logic raw query này đang lấy cố định theo CURRENT_DATE 
        // Bạn có thể tùy chỉnh thêm để sử dụng biến 'type' nếu cần
        const result = await this.prisma.$queryRaw<{ totalRevenue: number }[]>`
            SELECT COALESCE(SUM(total), 0) as "totalRevenue"
            FROM "Sale"
            WHERE DATE(time) = CURRENT_DATE
        `;

        return result[0] || { totalRevenue: 0 };
    }

    async getPriceHistory(vegetableId: number, startDate?: Date, endDate?: Date) {
        const where: any = { vegetableId };
        if (startDate || endDate) {
            where.changedAt = {};
            if (startDate) where.changedAt.gte = startDate;
            if (endDate) where.changedAt.lte = endDate;
        }

        return this.prisma.priceHistory.findMany({
            where,
            orderBy: { changedAt: 'desc' },
            include: {
                vegetable: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }
}