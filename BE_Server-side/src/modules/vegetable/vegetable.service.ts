import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewVegetableDto } from './dto/new-vegetable.dto';
import { PBaseService } from 'src/base/services/base.service';
import { Vegetable, Prisma } from '@prisma/client';

@Injectable()
export class VegetableService extends PBaseService<Vegetable> {
    constructor(private readonly prisma: PrismaService) {
        // Khởi tạo Base Service với model vegetable
        super(prisma.vegetable);
    }

    /**
     * DÙNG LẠI: Sử dụng super.create từ BaseService
     * Chỉ cần map lại dữ liệu từ DTO
     */
    async createVegetable(payload: NewVegetableDto) {
        return await super.create({
            name: payload.name,
        });
    }

    /**
     * VIẾT MỚI: Thống kê nâng cao (Base Service không hỗ trợ Group By/Raw Query)
     */
    async getPriceList(type: 'day' | 'week' | 'month', gardenId?: number, vegetableId?: number) {
        this.validateType(type);

        // Sử dụng Prisma.sql cho các đoạn code SQL động
        const gardenFilter = gardenId ? Prisma.sql`AND "gardenId" = ${gardenId}` : Prisma.empty;
        const vegetableFilter = vegetableId ? Prisma.sql`AND "vegetableId" = ${vegetableId}` : Prisma.empty;

        return this.prisma.$queryRaw`
        SELECT 
            DATE_TRUNC(${type}, "time") AS period,
            SUM(total)::FLOAT AS "totalRevenue",
            SUM(quantity)::INT AS "totalQuantity"
        FROM "Sale"
        WHERE 1=1
        ${gardenFilter}
        ${vegetableFilter}
        GROUP BY period
        ORDER BY period DESC
    `;
    }

    /**
     * VIẾT MỚI: Thống kê doanh thu kỳ hiện tại
     */
    async getTotalRevenue(type: 'day' | 'week' | 'month', gardenId?: number, vegetableId?: number) {
        this.validateType(type);

        const conditions = [
            Prisma.sql`DATE_TRUNC(${type}, "time") = DATE_TRUNC(${type}, CURRENT_DATE)`
        ];

        if (gardenId) conditions.push(Prisma.sql`"gardenId" = ${gardenId}`);
        if (vegetableId) conditions.push(Prisma.sql`"vegetableId" = ${vegetableId}`);

        const result = await this.prisma.$queryRaw<{ totalRevenue: number }[]>`
            SELECT COALESCE(SUM(total), 0)::FLOAT as "totalRevenue"
            FROM "Sale"
            WHERE ${Prisma.join(conditions, ' AND ')}
        `;

        return result[0] || { totalRevenue: 0 };
    }

    private validateType(type: string) {
        if (!['day', 'week', 'month'].includes(type)) {
            throw new BadRequestException('Type must be one of: day, week, month');
        }
    }
}