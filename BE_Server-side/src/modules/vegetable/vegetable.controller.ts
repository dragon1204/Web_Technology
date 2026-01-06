import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { VegetableService } from './vegetable.service';
import { NewVegetableDto } from './dto/new-vegetable.dto';
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
        return await this.vegetableService.createVegetable(dto);
    }

    @ApiOperation({ summary: "Lấy danh sách rau củ kèm phân trang, tìm kiếm và sắp xếp" })
    @Get('')
    async findAll(@Query() query: FindVegetableDto) {
        // Dùng thẳng hàm pagination từ BaseService thông qua VegetableService
        return await this.vegetableService.pagination(query);
    }

    @ApiOperation({ summary: "Cập nhật thông tin rau củ " })
    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number, 
        @Body() dto: NewVegetableDto
    ) {
        // Tận dụng hàm updateById từ BaseService, truyền thẳng DTO vào
        return await this.vegetableService.updateById(id, dto);
    }

    @ApiOperation({ summary: "Lấy chi tiết một loại rau củ" })
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        // Dùng hàm findById từ BaseService
        return await this.vegetableService.findById(id);
    }

    @ApiOperation({ summary: "Xóa rau củ theo ID" })
    @Delete(':id') 
    async remove(@Param('id', ParseIntPipe) id: number) {
        // Dùng hàm deleteById từ BaseService
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