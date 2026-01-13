import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Revenue Reports
   */

  /**
   * Doanh thu theo khoảng thời gian (ngày/tuần/tháng/năm)
   */
  async getRevenueByPeriod(
    period: 'day' | 'week' | 'month' | 'year',
    startDate?: Date,
    endDate?: Date,
    gardenId?: number,
    vegetableId?: number,
  ) {
    try {
      const where: any = {};
      if (gardenId) where.gardenId = gardenId;
      if (vegetableId) where.vegetableId = vegetableId;
      if (startDate || endDate) {
        where.time = {};
        if (startDate) where.time.gte = startDate;
        if (endDate) where.time.lte = endDate;
      }

      const whereClause = this.buildWhereClause(where);

      // Validate period để tránh SQL injection
      const validPeriods = ['day', 'week', 'month', 'year'];
      if (!validPeriods.includes(period)) {
        throw new BadRequestException(`Invalid period: ${period}. Must be one of: ${validPeriods.join(', ')}`);
      }

      const result = await this.prisma.$queryRawUnsafe(`
        SELECT 
          DATE_TRUNC('${period}', "time") AS period,
          SUM(total) AS totalRevenue,
          SUM(quantity) AS totalQuantity,
          COUNT(*) AS saleCount,
          AVG(total) AS avgRevenue
        FROM "Sale"
        ${whereClause}
        GROUP BY period
        ORDER BY period ASC
      `);

      // Format result để frontend dễ xử lý
      return Array.isArray(result) ? result.map((row: any) => ({
        period: row.period,
        totalRevenue: Number(row.totalRevenue || 0),
        totalQuantity: Number(row.totalQuantity || 0),
        saleCount: Number(row.saleCount || 0),
        avgRevenue: Number(row.avgRevenue || 0),
      })) : [];
    } catch (error) {
      console.error('Error in getRevenueByPeriod:', error);
      // Trả về empty array thay vì throw error để frontend không crash
      return [];
    }
  }

  /**
   * So sánh doanh thu giữa các vườn
   */
  async compareRevenueBetweenGardens(
    startDate?: Date,
    endDate?: Date,
    gardenIds?: number[],
  ) {
    const where: any = {};
    if (gardenIds && gardenIds.length > 0) {
      where.gardenId = { in: gardenIds };
    }
    if (startDate || endDate) {
      where.time = {};
      if (startDate) where.time.gte = startDate;
      if (endDate) where.time.lte = endDate;
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        garden: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const gardenStats = sales.reduce((acc, sale) => {
      const gardenId = sale.gardenId;
      if (!acc[gardenId]) {
        acc[gardenId] = {
          gardenId,
          gardenName: sale.garden.name,
          totalRevenue: 0,
          totalQuantity: 0,
          saleCount: 0,
        };
      }
      acc[gardenId].totalRevenue += sale.total;
      acc[gardenId].totalQuantity += sale.quantity;
      acc[gardenId].saleCount += 1;
      return acc;
    }, {} as Record<number, any>);

    return Object.values(gardenStats).sort(
      (a: any, b: any) => b.totalRevenue - a.totalRevenue,
    );
  }

  /**
   * Top sản phẩm bán chạy
   */
  async getTopSellingProducts(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
    gardenId?: number,
  ) {
    const where: any = {};
    if (gardenId) where.gardenId = gardenId;
    if (startDate || endDate) {
      where.time = {};
      if (startDate) where.time.gte = startDate;
      if (endDate) where.time.lte = endDate;
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        vegetable: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    const productStats = sales.reduce((acc, sale) => {
      const vegId = sale.vegetableId;
      if (!acc[vegId]) {
        acc[vegId] = {
          vegetableId: vegId,
          vegetableName: sale.vegetable.name,
          category: sale.vegetable.category,
          totalRevenue: 0,
          totalQuantity: 0,
          saleCount: 0,
        };
      }
      acc[vegId].totalRevenue += sale.total;
      acc[vegId].totalQuantity += sale.quantity;
      acc[vegId].saleCount += 1;
      return acc;
    }, {} as Record<number, any>);

    return Object.values(productStats)
      .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);
  }

  /**
   * Productivity Reports
   */

  /**
   * Năng suất theo loại rau
   */
  async getProductivityByCategory(
    startDate?: Date,
    endDate?: Date,
    gardenId?: number,
  ) {
    const where: any = {};
    if (gardenId) where.gardenId = gardenId;
    if (startDate || endDate) {
      where.time = {};
      if (startDate) where.time.gte = startDate;
      if (endDate) where.time.lte = endDate;
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        vegetable: {
          select: {
            category: true,
          },
        },
      },
    });

    const categoryStats = sales.reduce((acc, sale) => {
      const category = sale.vegetable.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = {
          category,
          totalQuantity: 0,
          totalRevenue: 0,
          saleCount: 0,
        };
      }
      acc[category].totalQuantity += sale.quantity;
      acc[category].totalRevenue += sale.total;
      acc[category].saleCount += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(categoryStats);
  }

  /**
   * Tỷ lệ bán/tồn kho
   */
  async getSalesToInventoryRatio(gardenId?: number) {
    const where: any = {};
    if (gardenId) where.gardenId = gardenId;

    // Lấy tổng số lượng đã bán
    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        vegetable: true,
      },
    });

    const salesByVegetable = sales.reduce((acc, sale) => {
      const vegId = sale.vegetableId;
      if (!acc[vegId]) {
        acc[vegId] = {
          vegetableId: vegId,
          vegetableName: sale.vegetable.name,
          totalSold: 0,
          imported: sale.vegetable.imported,
        };
      }
      acc[vegId].totalSold += sale.quantity;
      return acc;
    }, {} as Record<number, any>);

    // Tính tỷ lệ
    return Object.values(salesByVegetable).map((item: any) => {
      const ratio =
        item.imported > 0 ? (item.totalSold / item.imported) * 100 : 0;
      const remaining = item.imported - item.totalSold;
      return {
        ...item,
        ratio: parseFloat(ratio.toFixed(2)),
        remaining,
        utilizationRate: ratio,
      };
    });
  }

  /**
   * Xu hướng sản xuất (theo thời gian)
   */
  async getProductionTrend(
    period: 'day' | 'week' | 'month',
    startDate?: Date,
    endDate?: Date,
    vegetableId?: number,
    gardenId?: number,
  ) {
    const where: any = {};
    if (vegetableId) where.vegetableId = vegetableId;
    if (gardenId) where.gardenId = gardenId;
    if (startDate || endDate) {
      where.time = {};
      if (startDate) where.time.gte = startDate;
      if (endDate) where.time.lte = endDate;
    }

    const whereClause = this.buildWhereClause(where);

    return this.prisma.$queryRawUnsafe(`
      SELECT 
        DATE_TRUNC('${period}', "time") AS period,
        "vegetableId",
        v.name AS "vegetableName",
        SUM(quantity) AS totalQuantity,
        SUM(total) AS totalRevenue,
        COUNT(*) AS saleCount
      FROM "Sale" s
      JOIN "Vegetable" v ON s."vegetableId" = v.id
      ${whereClause}
      GROUP BY period, "vegetableId", v.name
      ORDER BY period ASC, totalQuantity DESC
    `);
  }

  /**
   * Device/Sensor Data Reports
   */

  /**
   * Phân tích dữ liệu sensor theo deviceMac và thời gian
   */
  async getSensorAnalysis(
    deviceMac: string,
    period: 'hour' | 'day' | 'week' | 'month',
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = { deviceMac };
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const sensorData = await this.prisma.sensorData.findMany({
      where,
      orderBy: { timestamp: 'asc' },
    });

    // Group by period
    const grouped = new Map<string, { temperatures: number[]; humidities: number[]; soils: number[] }>();
    
    sensorData.forEach((data) => {
      const date = new Date(data.timestamp);
      let periodKey: string;
      
      switch (period) {
        case 'hour':
          periodKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
          break;
        case 'day':
          periodKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${date.getMonth()}`;
          break;
      }

      if (!grouped.has(periodKey)) {
        grouped.set(periodKey, { temperatures: [], humidities: [], soils: [] });
      }

      const group = grouped.get(periodKey)!;
      if (data.temperature !== null) group.temperatures.push(data.temperature);
      if (data.humidity !== null) group.humidities.push(data.humidity);
      if (data.soil !== null) group.soils.push(data.soil);
    });

    return Array.from(grouped.entries()).map(([period, data]) => {
      const result: any = { period };
      
      if (data.temperatures.length > 0) {
        result.temperature = {
          min: Math.min(...data.temperatures),
          max: Math.max(...data.temperatures),
          avg: data.temperatures.reduce((a, b) => a + b, 0) / data.temperatures.length,
        };
      }
      
      if (data.humidities.length > 0) {
        result.humidity = {
          min: Math.min(...data.humidities),
          max: Math.max(...data.humidities),
          avg: data.humidities.reduce((a, b) => a + b, 0) / data.humidities.length,
        };
      }
      
      if (data.soils.length > 0) {
        result.soil = {
          min: Math.min(...data.soils),
          max: Math.max(...data.soils),
          avg: data.soils.reduce((a, b) => a + b, 0) / data.soils.length,
        };
      }
      
      result.dataCount = data.temperatures.length + data.humidities.length + data.soils.length;
      return result;
    });
  }

  /**
   * Phân tích điều kiện môi trường tối ưu
   */
  async getOptimalConditions(vegetableId?: number, gardenId?: number) {
    // Lấy top gardens dựa trên doanh thu
    const topProducts = await this.getTopSellingProducts(5, undefined, undefined, gardenId);

    if (topProducts.length === 0) {
      return {
        message: 'Không có dữ liệu đủ để phân tích',
      };
    }

    // Lấy garden IDs từ top products hoặc sử dụng gardenId được truyền vào
    let targetGardenIds: number[] = [];
    if (gardenId) {
      targetGardenIds = [gardenId];
    } else {
      // Lấy garden IDs từ sales của top products
      const sales = await this.prisma.sale.findMany({
        where: {
          vegetableId: vegetableId ? vegetableId : undefined,
        },
        select: {
          gardenId: true,
        },
        distinct: ['gardenId'],
        take: 5,
      });
      targetGardenIds = sales.map((s) => s.gardenId);
    }

    if (targetGardenIds.length === 0) {
      return {
        message: 'Không tìm thấy vườn để phân tích',
      };
    }

    // Get devices for target gardens
    const gardens = await this.prisma.garden.findMany({
      where: {
        id: { in: targetGardenIds },
      },
      select: {
        id: true,
        deviceMac: true,
      },
    });

    const deviceMacs = gardens.map((g) => g.deviceMac).filter((mac) => mac !== null);

    if (deviceMacs.length === 0) {
      return {
        message: 'Không tìm thấy thiết bị để phân tích',
      };
    }

    // Get sensor data from devices
    const sensorDataList = await this.prisma.sensorData.findMany({
      where: {
        deviceMac: { in: deviceMacs },
      },
      take: 1000,
      orderBy: { timestamp: 'desc' },
    });

    // Group by deviceMac and calculate optimal conditions
    const deviceDataMap = new Map<string, any[]>();
    sensorDataList.forEach((data) => {
      if (!deviceDataMap.has(data.deviceMac)) {
        deviceDataMap.set(data.deviceMac, []);
      }
      deviceDataMap.get(data.deviceMac)!.push(data);
    });

    const optimalConditions = Array.from(deviceDataMap.entries())
      .map(([deviceMac, dataList]) => {
        if (dataList.length === 0) return null;

        const temperatures = dataList.map((d) => d.temperature).filter((v) => v !== null && v !== undefined) as number[];
        const humidities = dataList.map((d) => d.humidity).filter((v) => v !== null && v !== undefined) as number[];
        const soils = dataList.map((d) => d.soil).filter((v) => v !== null && v !== undefined) as number[];

        const garden = gardens.find((g) => g.deviceMac === deviceMac);

        const result: any = {
          deviceMac,
          gardenId: garden?.id || null,
          dataPoints: dataList.length,
        };

        if (temperatures.length > 0) {
          const avg = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
          const min = Math.min(...temperatures);
          const max = Math.max(...temperatures);
          result.temperature = {
            min: parseFloat(min.toFixed(2)),
            max: parseFloat(max.toFixed(2)),
            average: parseFloat(avg.toFixed(2)),
          };
        }

        if (humidities.length > 0) {
          const avg = humidities.reduce((a, b) => a + b, 0) / humidities.length;
          const min = Math.min(...humidities);
          const max = Math.max(...humidities);
          result.humidity = {
            min: parseFloat(min.toFixed(2)),
            max: parseFloat(max.toFixed(2)),
            average: parseFloat(avg.toFixed(2)),
          };
        }

        if (soils.length > 0) {
          const avg = soils.reduce((a, b) => a + b, 0) / soils.length;
          const min = Math.min(...soils);
          const max = Math.max(...soils);
          result.soil = {
            min: parseFloat(min.toFixed(2)),
            max: parseFloat(max.toFixed(2)),
            average: parseFloat(avg.toFixed(2)),
          };
        }

        return result;
      })
      .filter(Boolean);

    return {
      analyzedGardens: targetGardenIds,
      optimalConditions,
    };
  }

  /**
   * Custom Reports - Tạo báo cáo tùy chỉnh
   */
  async generateCustomReport(
    config: {
      type: 'revenue' | 'productivity' | 'sensor' | 'combined';
      filters?: any;
      fields?: string[];
      groupBy?: string[];
      period?: 'day' | 'week' | 'month' | 'year';
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    switch (config.type) {
      case 'revenue':
        return this.getRevenueByPeriod(
          config.period || 'month',
          config.startDate,
          config.endDate,
          config.filters?.gardenId,
          config.filters?.vegetableId,
        );

      case 'productivity':
        const productivityPeriod = config.period === 'year' ? 'month' : (config.period || 'month');
        return this.getProductionTrend(
          productivityPeriod as 'day' | 'week' | 'month',
          config.startDate,
          config.endDate,
          config.filters?.vegetableId,
          config.filters?.gardenId,
        );

      case 'sensor':
        if (!config.filters?.deviceMac) {
          throw new BadRequestException('deviceMac is required for sensor reports');
        }
        const sensorPeriod = config.period === 'year' ? 'month' : (config.period || 'day');
        return this.getSensorAnalysis(
          config.filters.deviceMac,
          sensorPeriod as 'hour' | 'day' | 'week' | 'month',
          config.startDate,
          config.endDate,
        );

      case 'combined':
        const combinedProductivityPeriod = config.period === 'year' ? 'month' : (config.period || 'month');
        const combinedSensorPeriod = config.period === 'year' ? 'month' : (config.period || 'day');
        const [revenue, productivity, sensor] = await Promise.all([
          this.getRevenueByPeriod(
            config.period || 'month',
            config.startDate,
            config.endDate,
            config.filters?.gardenId,
            config.filters?.vegetableId,
          ),
          this.getProductionTrend(
            combinedProductivityPeriod as 'day' | 'week' | 'month',
            config.startDate,
            config.endDate,
            config.filters?.vegetableId,
            config.filters?.gardenId,
          ),
          config.filters?.deviceMac
            ? this.getSensorAnalysis(
                config.filters.deviceMac,
                combinedSensorPeriod as 'hour' | 'day' | 'week' | 'month',
                config.startDate,
                config.endDate,
              )
            : Promise.resolve([]),
        ]);

        return {
          revenue,
          productivity,
          sensor,
        };

      default:
        throw new BadRequestException('Invalid report type');
    }
  }

  /**
   * Helper: Build WHERE clause for raw queries
   */
  private buildWhereClause(where: any): string {
    if (!where || Object.keys(where).length === 0) {
      return '';
    }

    const conditions: string[] = [];

    if (where.gardenId) {
      if (typeof where.gardenId === 'object' && where.gardenId.in) {
        conditions.push(`"gardenId" IN (${where.gardenId.in.join(',')})`);
      } else {
        conditions.push(`"gardenId" = ${where.gardenId}`);
      }
    }

    if (where.vegetableId) {
      conditions.push(`"vegetableId" = ${where.vegetableId}`);
    }

    if (where.deviceMac) {
      conditions.push(`"deviceMac" = '${where.deviceMac}'`);
    }

    if (where.time) {
      if (where.time.gte) {
        conditions.push(`"time" >= '${where.time.gte.toISOString()}'`);
      }
      if (where.time.lte) {
        conditions.push(`"time" <= '${where.time.lte.toISOString()}'`);
      }
    }

    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  }
}

