import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewVegetableDto } from './dto/new-vegetable.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { UpdateImportedDto } from './dto/update-imported.dto';
import { UpdateSoldDto } from './dto/update-sold.dto';
import { PBaseService } from 'src/base/services/base.service';
import { Vegetable } from '@prisma/client';

@Injectable()
export class VegetableService extends PBaseService<Vegetable> {
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

    async updatePrice(id: number, dto: UpdatePriceDto) {
        return await this.updateById(id, {
            price: dto.price,
        });
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

        const where: any = {};
        if (gardenId) where.gardenId = gardenId;
        if (vegetableId) where.vegetableId = vegetableId;

        // Xây dựng điều kiện WHERE động cho query raw
        const whereClause = Object.keys(where).length 
            ? 'WHERE ' + Object.entries(where).map(([k, v]) => `"${k}" = ${v}`).join(' AND ') 
            : '';

        return this.prisma.$queryRawUnsafe(`
            SELECT 
                DATE_TRUNC('${type}', "time") AS period,
                SUM(total) AS totalRevenue,
                SUM(quantity) AS totalQuantity
            FROM "Sale"
            ${whereClause}
            GROUP BY period
            ORDER BY period ASC
        `);
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
}