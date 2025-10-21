import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { VegetableService } from './vegetable.service';
import { NewVegetableDto } from './dto/new-vegetable.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { UpdateImportedDto } from './dto/update-imported.dto';
import { UpdateSoldDto } from './dto/update-sold.dto';
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
    async getPriceList(@Query() query: RevenueVegetableDto) {
        return this.vegetableService.getPriceList(
            query.type,
            query.gardenId ? Number(query.gardenId) : undefined,
            query.vegetableId ? Number(query.vegetableId) : undefined,
        );
    }

    @ApiOperation({ summary: "Used to get the total revenue vegetable" })
    @Get('revenue/all')
    async getTotalRevenue(@Query() query: RevenueVegetableDto) {
        return this.vegetableService.getTotalRevenue(
            query.type,
            query.gardenId ? Number(query.gardenId) : undefined,
            query.vegetableId ? Number(query.vegetableId) : undefined,
        );
    }
}
