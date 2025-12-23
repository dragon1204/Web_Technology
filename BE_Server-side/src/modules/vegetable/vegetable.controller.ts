<<<<<<< HEAD
import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
=======
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
import { VegetableService } from './vegetable.service';
import { NewVegetableDto } from './dto/new-vegetable.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { UpdateImportedDto } from './dto/update-imported.dto';
import { UpdateSoldDto } from './dto/update-sold.dto';
<<<<<<< HEAD
import { ApiOperation } from '@nestjs/swagger';
import { FindVegetableDto } from './dto/find-vegetable.dto';
import { RevenueVegetableDto } from './dto/revenue-vegetable.dto';


@Controller('vegetable')
export class VegetableController {
    constructor(private readonly vegetableService: VegetableService) { }

    @ApiOperation({ summary: "Used to create a new vegetable" })
    @Post('')
    async create(@Body() dto: NewVegetableDto) {
        return await this.vegetableService.create(dto);
    }

    @ApiOperation({ summary: "Used to show the list vegetable" })
    @Get('')
    async findAll(@Query() findManyDto: FindVegetableDto) {
        return await this.vegetableService.findMany(findManyDto.skip, findManyDto.take);
    }

    @ApiOperation({ summary: "Used to change the price of vegetable" })
    @Patch('price/:id')
    async updatePrice(@Param('id') id: number, @Body() dto: UpdatePriceDto) {
        return await this.vegetableService.updatePrice(id, dto);
    }

    @ApiOperation({ summary: "Used to change the imported vegetable" })
    @Patch('imported/:id')
    async updateImported(@Param('id') id: number, @Body() dto: UpdateImportedDto) {
        return await this.vegetableService.updateImported(id, dto);
    }

    @ApiOperation({ summary: "Used to the sold vegetable" })
    @Patch('sold/:id')
    async updateSold(@Param('id') id: number, @Body() dto: UpdateSoldDto) {
        return await this.vegetableService.updateSold(id, dto);
    }

    @ApiOperation({ summary: "Used to get the total revenue vegetable" })
    @Get('revenue/all')
=======
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindVegetableDto } from './dto/find-vegetable.dto';
import { RevenueVegetableDto } from './dto/revenue-vegetable.dto';
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
        @Body() dto: UpdatePriceDto
    ) {
        return await this.vegetableService.updatePrice(id, dto);
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
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
    async getPriceList(@Query() query: RevenueVegetableDto) {
        return this.vegetableService.getPriceList(
            query.type,
            query.gardenId ? Number(query.gardenId) : undefined,
            query.vegetableId ? Number(query.vegetableId) : undefined,
        );
    }

<<<<<<< HEAD
    @ApiOperation({ summary: "Used to get the total revenue vegetable" })
    @Get('revenue/all')
=======
    @ApiOperation({ summary: "Lấy tổng doanh thu hôm nay" })
    @Get('revenue/total') // Đổi path để tránh trùng lặp
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
    async getTotalRevenue(@Query() query: RevenueVegetableDto) {
        return this.vegetableService.getTotalRevenue(
            query.type,
            query.gardenId ? Number(query.gardenId) : undefined,
            query.vegetableId ? Number(query.vegetableId) : undefined,
        );
    }
<<<<<<< HEAD
}
=======

    @ApiOperation({ summary: "Xóa rau củ theo ID" })
    @Patch('delete/:id') // Hoặc dùng @Delete() tùy theo thiết kế của bạn
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.vegetableService.deleteById(id);
    }
}
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
