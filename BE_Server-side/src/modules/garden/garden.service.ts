import { ForbiddenException, Injectable } from "@nestjs/common";
import { Garden, Role } from "@prisma/client";
import { PBaseService } from "src/base/services/base.service";
import { PrismaService } from "src/prisma/prisma.service";
import { GardenDto } from "./dto/garden.dto";
import { BQueryParams } from "src/base/dto/base.dto";
import { DeviceService } from "../device/device.service";

@Injectable()
export class GardenService extends PBaseService<Garden> {
    constructor(private readonly prisma: PrismaService,
        private readonly deviceService: DeviceService
    ) {
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

    async updateSensorData(mac: string, data: any) {
        const { temperature, humidity, soil, soilDigital, lightDigital } = data;
        return await this.prisma.$transaction([
            this.prisma.sensorData.create({
                data: {
                    deviceMac: mac,
                    temperature,
                    humidity,
                    soil,
                    soilDigital,
                    lightDigital,
                },
            }),
            this.prisma.garden.updateMany({
                where: { deviceMac: mac },
                data: { temperature, humidity, soil, timestamp: new Date() },
            }),
        ]);
    }

    async pairDevice(mac: string, data: any) {
        return await this.prisma.device.upsert({
            where: { deviceMac: mac },
            update: { model: data.model, name: data.name },
            create: {
                deviceMac: mac,
                model: data.model || 'ESP32_GENERIC',
                name: data.name || `Garden_${mac.slice(-4)}`,
            },
        });
    }

    async updatePumpStatusInDb(mac: string, action: string) {
        const pumpControl = action === 'ON' ? 'MANUAL_ON' : action === 'OFF' ? 'MANUAL_OFF' : 'AUTO';
        await this.prisma.garden.updateMany({
            where: { deviceMac: mac },
            data: { pumpControl: pumpControl as any },
        });
    }
}