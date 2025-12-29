import { ForbiddenException, Injectable } from "@nestjs/common";
import { Garden, Role } from "@prisma/client";
import { PBaseService } from "src/base/services/base.service";
import { PrismaService } from "src/prisma/prisma.service";
import { GardenDto } from "./dto/garden.dto";
import { BQueryParams } from "src/base/dto/base.dto";

@Injectable()
export class GardenService extends PBaseService<Garden> {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.garden);
    }

    async createGardenForUser(ownerId: number, dto: GardenDto) {
        return this.create({
            ...dto,
            ownerId: ownerId,
        });
    }

    async findGardensSecure(query: BQueryParams, user: any) {
        const relationFilter = user.role === Role.ADMIN 
            ? undefined 
            : { field: 'ownerId', value: user.id };

        return this.pagination(query, relationFilter);
    }

    async findOneSecure(gardenId: number, user: any) {
        const garden = await this.findById(gardenId);
        
        if (user.role !== Role.ADMIN && garden.ownerId !== user.id) {
            throw new ForbiddenException('Bạn không có quyền truy cập khu vườn này');
        }
        return garden;
    }

    async updateGardenSecure(gardenId: number, dto: GardenDto, user: any) {
        await this.findOneSecure(gardenId, user);
        return this.updateById(gardenId, dto);
    }
}