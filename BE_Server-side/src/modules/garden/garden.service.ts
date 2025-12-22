import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GardenDto } from './dto/garden.dto';
import { Garden, Role } from '@prisma/client';
import { PBaseService } from 'src/base/services/base.service';

@Injectable()
export class GardenService extends PBaseService<Garden> {
    constructor(private readonly prisma: PrismaService){
        super(prisma.garden);
    }

    async createGardenForUser(userId : number, payload: GardenDto){
        return await this.prisma.garden.create({
            data: {
                name: payload.name,
                ownerId: userId
            }
        })
    }

    async createOwnGarden(userId : number, payload: GardenDto) {
        return await this.prisma.garden.create({
            data: {
                name: payload.name,
                owner: {   
                    connect: { id : userId }  
                }     
            }
        })
    }


    async findMany(userId : number, userRole : string, skip?: number, take?: number){
        const include: any = {
            vegetables: true,
            sales: true,
            sensors: true,
        };
            const where =  userRole === Role.ADMIN ? undefined : { ownerId: userId}
        if(userRole === Role.ADMIN){
            return await this.prisma.garden.findMany({
                include: {
                    owner: true,
                },
            });
        }
        return await this.prisma.garden.findMany({
            where,
            include,
            skip : skip ?? 0,
            take : take ?? 0,
        });
        
    }

    async showDetail(user : {id : number, role: string}, gardenId: number){
        const garden = await this.findById(gardenId);

        if(user.role === Role.ADMIN || garden.ownerId === user.id) {
            return garden;
        }

        throw new ForbiddenException('This garden is not belong you!');

    }

    async update(user ,gardenId: number, gardenDto: GardenDto){
        const garden = await this.findById(gardenId);

        if(user.role === Role.ADMIN || garden.ownerId === user.id) {
            return await this.prisma.garden.update({
                where: { id : gardenId },
                data: {
                    name: gardenDto.name,
                }
            });
        }

        throw new ForbiddenException('This garden is not belong you!');

    }

    async delete(gardenId : number){
        await this.findById(gardenId);
        await this.prisma.garden.delete({where: {id : gardenId}});
    }

    async checkValidId(id : number){
        try {
            await this.findById(id);
            return true;
        } catch {
            return false;
        }
    }

}
