import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AlertService } from '../alert/alert.service';

@Injectable()
export class SensorDataService {
  private readonly logger = new Logger(SensorDataService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly alertService: AlertService,
  ) {}

  /**
   * Legacy method: Create sensor data using sensorId (for backward compatibility)
   * Note: This is kept for compatibility but the new system uses deviceMac
   */
  async create(sensorId: number, value: number) {
    // Log warning that this is legacy method
    this.logger.warn(
      `Legacy create method called with sensorId=${sensorId}. Consider migrating to device-based approach.`
    );
    
    // Try to find device by sensorId (if mapping exists)
    // For now, just log and return null since we don't have Sensor model anymore
    this.logger.warn(`Sensor with ID ${sensorId} not found. Sensor model has been replaced by Device model.`);
    return null;
  }

  /**
   * New method: Create sensor data using deviceMac (new hardware integration)
   */
  async createByDeviceMac(deviceMac: string, data: {
    temperature?: number;
    humidity?: number;
    soil?: number;
    soilDigital?: number;
    lightDigital?: number;
  }) {
    try {
      // Ensure device exists
      const device = await this.prisma.device.upsert({
        where: { deviceMac },
        update: {},
        create: {
          deviceMac,
          model: 'ESP32_GENERIC',
          name: `Device_${deviceMac.slice(-4)}`,
        },
      });

      // Create sensor data
      const sensorData = await this.prisma.sensorData.create({
        data: {
          deviceMac,
          ...data,
        },
      });

      // Get gardenId from device if exists
      const garden = await this.prisma.garden.findUnique({
        where: { deviceMac },
        select: { id: true },
      });

      // Check alerts for temperature and humidity
      if (data.temperature !== undefined) {
        await this.alertService.checkAndCreateAlert(
          undefined,
          data.temperature,
          'temperature',
          deviceMac,
          garden?.id,
        );
      }

      if (data.humidity !== undefined) {
        await this.alertService.checkAndCreateAlert(
          undefined,
          data.humidity,
          'humidity',
          deviceMac,
          garden?.id,
        );
      }

      return sensorData;
    } catch (error) {
      this.logger.error(`Error creating sensor data for device ${deviceMac}:`, error);
      return null;
    }
  }

  /**
   * Legacy method: Find by sensorId (backward compatibility)
   */
  async findBySensor(
    sensorId: number,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ) {
    this.logger.warn('Legacy findBySensor called. Consider using findByDeviceMac instead.');
    // Return empty array since Sensor model no longer exists
    return [];
  }

  /**
   * New method: Find sensor data by device MAC address
   */
  async findByDeviceMac(
    deviceMac: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ) {
    const where: any = { deviceMac };
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    return this.prisma.sensorData.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        device: true,
      },
    });
  }

  /**
   * Legacy method: Get statistics by sensorId
   */
  async getStatistics(sensorId: number, startDate?: Date, endDate?: Date) {
    this.logger.warn('Legacy getStatistics called. Consider using getDeviceStatistics instead.');
    return {
      count: 0,
      min: null,
      max: null,
      avg: null,
    };
  }

  /**
   * New method: Get statistics by device MAC
   */
  async getDeviceStatistics(deviceMac: string, startDate?: Date, endDate?: Date, field: 'temperature' | 'humidity' | 'soil' = 'temperature') {
    const where: any = { deviceMac };
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const data = await this.prisma.sensorData.findMany({
      where,
      select: { [field]: true },
    });

    if (data.length === 0) {
      return {
        count: 0,
        min: null,
        max: null,
        avg: null,
      };
    }

    const values: number[] = [];
    for (const item of data) {
      const value = item[field];
      if (typeof value === 'number' && !isNaN(value)) {
        values.push(value);
      }
    }
    
    if (values.length === 0) {
      return {
        count: 0,
        min: null,
        max: null,
        avg: null,
      };
    }

    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: sum / values.length,
    };
  }
}

