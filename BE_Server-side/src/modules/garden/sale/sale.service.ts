import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Role } from '@prisma/client';

@Injectable()
export class SaleService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Bán rau trong vườn
     * @param userId ID của user thực hiện bán
     * @param gardenId ID của vườn
     * @param saleDto Thông tin bán rau
     * @returns Thông tin giao dịch bán
     */
    async sellVegetable(
        userId: number,
        gardenId: number,
        saleDto: CreateSaleDto,
    ) {
        const garden = await this.prisma.garden.findUnique({
            where: { id: gardenId },
        });

        if (!garden) {
            throw new NotFoundException(`Garden with ID ${gardenId} not found`);
        }

        if (garden.ownerId !== userId) {
            throw new ForbiddenException('You do not have permission to sell vegetables from this garden');
        }

        const vegetable = await this.prisma.vegetable.findUnique({
            where: { id: saleDto.vegetableId },
        });

        if (!vegetable) {
            throw new NotFoundException(`Vegetable with ID ${saleDto.vegetableId} not found`);
        }

        const vegetableGarden = await this.prisma.vegetable_garden.findFirst({
            where: {
                gardenId: gardenId,
                vegetableId: saleDto.vegetableId,
            },
        });

        if (!vegetableGarden) {
            throw new BadRequestException(
                `This garden does not have vegetable with ID ${saleDto.vegetableId}`,
            );
        }

        if (vegetableGarden.quantity < saleDto.quantity) {
            throw new BadRequestException(
                `Not enough vegetables. Available: ${vegetableGarden.quantity}, Requested: ${saleDto.quantity}`,
            );
        }

        const total = saleDto.quantity * saleDto.priceAtSale;

        const result = await this.prisma.$transaction(async (tx) => {
            const sale = await tx.sale.create({
                data: {
                    gardenId: gardenId,
                    vegetableId: saleDto.vegetableId,
                    quantity: saleDto.quantity,
                    priceAtSale: saleDto.priceAtSale,
                    total: total,
                },
                include: {
                    vegetable: true,
                    garden: {
                        include: {
                            owner: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });

            await tx.vegetable_garden.update({
                where: { id: vegetableGarden.id },
                data: {
                    quantity: {
                        decrement: saleDto.quantity,
                    },
                },
            });

            await tx.vegetable.update({
                where: { id: saleDto.vegetableId },
                data: {
                    sold: {
                        increment: saleDto.quantity,
                    },
                },
            });

            return sale;
        });

        console.log(`✅ Sale created: ${saleDto.quantity} ${vegetable.name} sold from garden ${garden.name} for ${total} VNĐ`);

        return result;
    }

    /**
     * Lấy danh sách các giao dịch bán của một vườn
     * @param userId ID của user
     * @param userRole Role của user
     * @param gardenId ID của vườn
     * @returns Danh sách các giao dịch bán
     */
    async getSalesByGarden(
        userId: number,
        userRole: string,
        gardenId: number,
    ) {
        const garden = await this.prisma.garden.findUnique({
            where: { id: gardenId },
        });

        if (!garden) {
            throw new NotFoundException(`Garden with ID ${gardenId} not found`);
        }

        if (userRole !== Role.ADMIN && garden.ownerId !== userId) {
            throw new ForbiddenException('You do not have permission to view sales of this garden');
        }

        return await this.prisma.sale.findMany({
            where: { gardenId: gardenId },
            include: {
                vegetable: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                    },
                },
                garden: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                time: 'desc',
            },
        });
    }

    /**
     * Lấy thống kê doanh thu của một vườn
     * @param userId ID của user
     * @param userRole Role của user
     * @param gardenId ID của vườn
     * @returns Thống kê doanh thu
     */
    async getGardenRevenue(
        userId: number,
        userRole: string,
        gardenId: number,
    ) {
        const garden = await this.prisma.garden.findUnique({
            where: { id: gardenId },
        });

        if (!garden) {
            throw new NotFoundException(`Garden with ID ${gardenId} not found`);
        }

        if (userRole !== Role.ADMIN && garden.ownerId !== userId) {
            throw new ForbiddenException('You do not have permission to view revenue of this garden');
        }

        const sales = await this.prisma.sale.findMany({
            where: { gardenId: gardenId },
            select: {
                total: true,
                quantity: true,
            },
        });

        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
        const saleCount = sales.length;

        return {
            gardenId,
            gardenName: garden.name,
            totalRevenue,
            totalQuantity,
            saleCount,
        };
    }
}

