import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { VegetableService } from './vegetable.service';
import { NewVegetableDto } from './dto/new-vegetable.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { UpdateImportedDto } from './dto/update-imported.dto';
import { UpdateSoldDto } from './dto/update-sold.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindVegetableDto } from './dto/find-vegetable.dto';
import { RevenueVegetableDto } from './dto/revenue-vegetable.dto';
import { GetPriceHistoryDto } from './dto/price-history.dto';
import { AtGuard } from '../auth/guard/auth.guards';
import { RolesGuard } from '../auth/guard/roles.guards';

@ApiTags('Vegetable') 
@Controller('vegetable')
@ApiBearerAuth('access-token')
@UseGuards(AtGuard, RolesGuard)
export class VegetableController {
    constructor(private readonly vegetableService: VegetableService) { }

    @ApiOperation({ summary: "Tạo mới một loại rau củ" })
    @Post('')
    async create(@Body() dto: NewVegetableDto) {
        // Sử dụng hàm createVegetable đã sửa lỗi đệ quy ở Service
        return await this.vegetableService.createVegetable(dto);
    }

    @ApiOperation({ summary: "Lấy danh sách rau củ kèm phân trang, tìm kiếm và sắp xếp" })
    @Get('')
    async findAll(@Query() query: FindVegetableDto) {
     
        return await this.vegetableService.pagination(query);
    }

    @ApiOperation({ summary: "Thay đổi giá sản phẩm" })
    @Patch('price/:id')
    async updatePrice(
        @Param('id', ParseIntPipe) id: number, 
        @Body() dto: UpdatePriceDto,
        @Request() req?: any
    ) {
        return await this.vegetableService.updatePrice(id, dto, req?.user?.id);
    }

    @ApiOperation({ summary: "Cập nhật số lượng nhập kho" })
    @Patch('imported/:id')
    async updateImported(
        @Param('id', ParseIntPipe) id: number, 
        @Body() dto: UpdateImportedDto
    ) {
        return await this.vegetableService.updateImported(id, dto);
    }

    @ApiOperation({ summary: "Cập nhật số lượng đã bán" })
    @Patch('sold/:id')
    async updateSold(
        @Param('id', ParseIntPipe) id: number, 
        @Body() dto: UpdateSoldDto
    ) {
        return await this.vegetableService.updateSold(id, dto);
    }

    @ApiOperation({ summary: "Lấy danh sách doanh thu theo thời gian (ngày/tuần/tháng)" })
    @Get('revenue/list') // Đổi path để tránh trùng lặp
    async getPriceList(@Query() query: RevenueVegetableDto) {
        return this.vegetableService.getPriceList(
            query.type,
            query.gardenId ? Number(query.gardenId) : undefined,
            query.vegetableId ? Number(query.vegetableId) : undefined,
        );
    }

    @ApiOperation({ summary: "Lấy tổng doanh thu hôm nay" })
    @Get('revenue/total') // Đổi path để tránh trùng lặp
    async getTotalRevenue(@Query() query: RevenueVegetableDto) {
        return this.vegetableService.getTotalRevenue(
            query.type,
            query.gardenId ? Number(query.gardenId) : undefined,
            query.vegetableId ? Number(query.vegetableId) : undefined,
        );
    }

    @ApiOperation({ summary: "Xóa rau củ theo ID" })
    @Patch('delete/:id') // Hoặc dùng @Delete() tùy theo thiết kế của bạn
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.vegetableService.deleteById(id);
    }

    @ApiOperation({ summary: "Lấy lịch sử giá của rau củ" })
    @Get('price-history/:id')
    async getPriceHistory(
        @Param('id', ParseIntPipe) id: number,
        @Query() query: GetPriceHistoryDto
    ) {
        const startDate = query.startDate ? new Date(query.startDate) : undefined;
        const endDate = query.endDate ? new Date(query.endDate) : undefined;
        return await this.vegetableService.getPriceHistory(id, startDate, endDate);
    }
}