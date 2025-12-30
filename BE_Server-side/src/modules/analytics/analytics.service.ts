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
    const where: any = {};
    if (gardenId) where.gardenId = gardenId;
    if (vegetableId) where.vegetableId = vegetableId;
    if (startDate || endDate) {
      where.time = {};
      if (startDate) where.time.gte = startDate;
      if (endDate) where.time.lte = endDate;
    }

    const whereClause = this.buildWhereClause(where);

    return this.prisma.$queryRawUnsafe(`
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
   * Sensor Reports
   */

  /**
   * Phân tích dữ liệu sensor theo thời gian
   */
  async getSensorAnalysis(
    sensorId: number,
    period: 'hour' | 'day' | 'week' | 'month',
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = { sensorId };
    if (startDate || endDate) {
      where.time = {};
      if (startDate) where.time.gte = startDate;
      if (endDate) where.time.lte = endDate;
    }

    const whereClause = this.buildWhereClause(where);

    return this.prisma.$queryRawUnsafe(`
      SELECT 
        DATE_TRUNC('${period}', time) AS period,
        MIN(value) AS minValue,
        MAX(value) AS maxValue,
        AVG(value) AS avgValue,
        COUNT(*) AS dataCount
      FROM "SensorData"
      ${whereClause}
      GROUP BY period
      ORDER BY period ASC
    `);
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

    const sensors = await this.prisma.sensor.findMany({
      where: {
        gardenId: { in: targetGardenIds },
      },
      include: {
        type: true,
        data: {
          take: 1000,
          orderBy: { time: 'desc' },
        },
      },
    });

    const optimalConditions = sensors
      .map((sensor) => {
        if (sensor.data.length === 0) return null;

        const values = sensor.data.map((d) => d.value);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        return {
          sensorId: sensor.id,
          sensorName: sensor.name,
          sensorType: sensor.type.name,
          unit: sensor.type.unit,
          gardenId: sensor.gardenId,
          optimalRange: {
            min: parseFloat(min.toFixed(2)),
            max: parseFloat(max.toFixed(2)),
            average: parseFloat(avg.toFixed(2)),
          },
          dataPoints: values.length,
        };
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
        if (!config.filters?.sensorId) {
          throw new BadRequestException('sensorId is required for sensor reports');
        }
        const sensorPeriod = config.period === 'year' ? 'month' : (config.period || 'day');
        return this.getSensorAnalysis(
          config.filters.sensorId,
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
          config.filters?.sensorId
            ? this.getSensorAnalysis(
                config.filters.sensorId,
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

    if (where.sensorId) {
      conditions.push(`"sensorId" = ${where.sensorId}`);
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

