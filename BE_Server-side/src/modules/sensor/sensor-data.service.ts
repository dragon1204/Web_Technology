import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AlertService } from '../alert/alert.service';

@Injectable()
export class SensorDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alertService: AlertService,
  ) {}

  async create(sensorId: number, value: number) {
    // Lấy thông tin sensor
    const sensor = await this.prisma.sensor.findUnique({
      where: { id: sensorId },
      include: { type: true },
    });

    if (!sensor) {
      // Log warning thay vì throw error để không làm crash MQTT service
      console.warn(`Sensor with ID ${sensorId} not found. Skipping data save.`);
      return null;
    }

    // Lưu dữ liệu vào database
    const sensorData = await this.prisma.sensorData.create({
      data: {
        sensorId,
        value,
      },
    });

    // Kiểm tra và tạo alerts nếu cần
    await this.alertService.checkAndCreateAlert(
      sensorId,
      value,
      sensor.type.name.toLowerCase(),
    );

    return sensorData;
  }

  async findBySensor(
    sensorId: number,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ) {
    const where: any = { sensorId };
    if (startDate || endDate) {
      where.time = {};
      if (startDate) where.time.gte = startDate;
      if (endDate) where.time.lte = endDate;
    }

    return this.prisma.sensorData.findMany({
      where,
      orderBy: { time: 'desc' },
      take: limit,
      include: {
        sensor: {
          include: {
            type: true,
          },
        },
      },
    });
  }

  async getStatistics(sensorId: number, startDate?: Date, endDate?: Date) {
    const where: any = { sensorId };
    if (startDate || endDate) {
      where.time = {};
      if (startDate) where.time.gte = startDate;
      if (endDate) where.time.lte = endDate;
    }

    const data = await this.prisma.sensorData.findMany({
      where,
      select: { value: true },
    });

    if (data.length === 0) {
      return {
        count: 0,
        min: null,
        max: null,
        avg: null,
      };
    }

    const values = data.map((d) => d.value);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: sum / values.length,
    };
  }
}

