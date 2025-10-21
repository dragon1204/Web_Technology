import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewVegetableDto } from './dto/new-vegetable.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { UpdateImportedDto } from './dto/update-imported.dto';
import { UpdateSoldDto } from './dto/update-sold.dto';

@Injectable()
export class VegetableService {
    constructor(private prisma: PrismaService) { }

    async create(payload: NewVegetableDto) {
        await this.prisma.vegetable.create({
            data: {
                name: payload.name,
                imported: payload.imported ?? 0,
                sold: payload.sold ?? 0,
                price: payload.price ?? 0
            }
        })
    }

    async findMany(skip?: number, take?: number) {
        await this.prisma.vegetable.findMany({
            skip: skip ?? 0,
            take: take ?? 10,
            orderBy: {id: 'asc'}
        })
    }

    async updateImported(id: number, dto: UpdateImportedDto) {
        const exist = await this.checkExist(id);
        if (!exist)
            throw new NotFoundException('không tồn tại id này');

        return await this.prisma.vegetable.update({
            where: {
                id: id,
            },
            data: {
                imported: dto.imported,
            }
        })
    }

    async updateSold(id: number, dto: UpdateSoldDto) {
        const exist = await this.checkExist(id);
        if (!exist)
            throw new NotFoundException('không tồn tại id này');

        return this.prisma.vegetable.update({
            where: {
                id: id,
            },
            data: {
                sold: dto.sold,
            }
        })
    }


    async updatePrice(id: number, dto: UpdatePriceDto) {
        const exist = await this.checkExist(id);
        if (!exist)
            throw new NotFoundException('không tồn tại id này');

        return await this.prisma.vegetable.update({
            where: {
                id: id,
            },
            data: {
                price: dto.price,
            }
        })
    }



    async checkExist(id: number) {
        const isExist = await this.prisma.vegetable.findUnique({ where: { id: id } });
        if (!isExist)
            return false;
        return true;
    }

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

        return this.prisma.$queryRawUnsafe(`
            SELECT 
                DATE_TRUNC('${type}', "time") AS period,
                SUM(total) AS totalRevenue,
                SUM(quantity) AS totalQuantity
            FROM "Sale"
            ${Object.keys(where).length ? 'WHERE ' + Object.entries(where).map(([k, v]) => `"${k}" = ${v}`).join(' AND ') : ''}
            GROUP BY period
            ORDER BY period ASC
        `);
    }

    async getTotalRevenue(type: 'day' | 'week' | 'month', gardenId?: number, vegetableId?: number) {
        this.validateType(type);
        const where: any = {};
        if (gardenId) where.gardenId = gardenId;
        if (vegetableId) where.vegetableId = vegetableId;

        const result = await this.prisma.$queryRaw<{ totalRevenue: number }[]>`
        SELECT SUM(total) as totalRevenue
        FROM "Sale"
        WHERE DATE(time) = CURRENT_DATE
    `;

        return result[0] || { totalRevenue: 0 };
    }
}
