import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ReportTemplateService } from './report-template.service';
import { AtGuard } from 'src/modules/auth/guard/auth.guards';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import {
  RevenueReportDto,
  ProductivityReportDto,
  SensorReportDto,
  CustomReportDto,
} from './dto/analytics.dto';
import { CreateReportTemplateDto } from './dto/create-report-template.dto';
import { UpdateReportTemplateDto } from './dto/update-report-template.dto';

@ApiTags('Analytics & Reports')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(AtGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly reportTemplateService: ReportTemplateService,
  ) {}

  /**
   * Revenue Reports
   */

  @Get('revenue/period')
  @ApiOperation({ summary: 'Doanh thu theo khoảng thời gian' })
  getRevenueByPeriod(@Query() query: RevenueReportDto) {
    return this.analyticsService.getRevenueByPeriod(
      query.period || 'month',
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
      query.gardenId ? +query.gardenId : undefined,
      query.vegetableId ? +query.vegetableId : undefined,
    );
  }

  @Get('revenue/compare-gardens')
  @ApiOperation({ summary: 'So sánh doanh thu giữa các vườn' })
  @ApiQuery({ name: 'gardenIds', required: false, type: String })
  compareRevenueBetweenGardens(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('gardenIds') gardenIds?: string,
  ) {
    const gardenIdsArray = gardenIds
      ? gardenIds.split(',').map((id) => +id)
      : undefined;
    return this.analyticsService.compareRevenueBetweenGardens(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      gardenIdsArray,
    );
  }

  @Get('revenue/top-products')
  @ApiOperation({ summary: 'Top sản phẩm bán chạy' })
  getTopSellingProducts(
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('gardenId') gardenId?: string,
  ) {
    return this.analyticsService.getTopSellingProducts(
      limit ? +limit : 10,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      gardenId ? +gardenId : undefined,
    );
  }

  /**
   * Productivity Reports
   */

  @Get('productivity/by-category')
  @ApiOperation({ summary: 'Năng suất theo loại rau' })
  getProductivityByCategory(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('gardenId') gardenId?: string,
  ) {
    return this.analyticsService.getProductivityByCategory(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      gardenId ? +gardenId : undefined,
    );
  }

  @Get('productivity/sales-inventory-ratio')
  @ApiOperation({ summary: 'Tỷ lệ bán/tồn kho' })
  getSalesToInventoryRatio(@Query('gardenId') gardenId?: string) {
    return this.analyticsService.getSalesToInventoryRatio(
      gardenId ? +gardenId : undefined,
    );
  }

  @Get('productivity/trend')
  @ApiOperation({ summary: 'Xu hướng sản xuất' })
  getProductionTrend(@Query() query: ProductivityReportDto) {
    return this.analyticsService.getProductionTrend(
      query.period || 'month',
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
      query.vegetableId ? +query.vegetableId : undefined,
      query.gardenId ? +query.gardenId : undefined,
    );
  }

  /**
   * Sensor Reports
   */

  @Get('sensor/analysis')
  @ApiOperation({ summary: 'Phân tích dữ liệu sensor' })
  getSensorAnalysis(@Query() query: SensorReportDto) {
    if (!query.sensorId) {
      throw new Error('sensorId is required');
    }
    return this.analyticsService.getSensorAnalysis(
      +query.sensorId,
      query.period || 'day',
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
    );
  }

  @Get('sensor/optimal-conditions')
  @ApiOperation({ summary: 'Điều kiện môi trường tối ưu' })
  getOptimalConditions(
    @Query('vegetableId') vegetableId?: string,
    @Query('gardenId') gardenId?: string,
  ) {
    return this.analyticsService.getOptimalConditions(
      vegetableId ? +vegetableId : undefined,
      gardenId ? +gardenId : undefined,
    );
  }

  /**
   * Custom Reports
   */

  @Post('custom')
  @ApiOperation({ summary: 'Tạo báo cáo tùy chỉnh' })
  generateCustomReport(@Body() body: CustomReportDto) {
    return this.analyticsService.generateCustomReport({
      type: body.type,
      filters: body.filters,
      fields: body.fields,
      groupBy: body.groupBy,
      period: body.period,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });
  }

  /**
   * Report Templates
   */

  @Post('templates')
  @ApiOperation({ summary: 'Tạo report template' })
  createTemplate(
    @Body() createDto: CreateReportTemplateDto,
    @Request() req,
  ) {
    return this.reportTemplateService.create(createDto, req.user.id);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Lấy danh sách report templates' })
  findAllTemplates(@Request() req) {
    return this.reportTemplateService.findAll(req.user.id, req.user.role);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Lấy report template theo ID' })
  findOneTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.reportTemplateService.findOne(id, req.user.id, req.user.role);
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Cập nhật report template' })
  updateTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateReportTemplateDto,
    @Request() req,
  ) {
    return this.reportTemplateService.update(
      id,
      updateDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Xóa report template' })
  removeTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.reportTemplateService.remove(id, req.user.id, req.user.role);
  }
}

