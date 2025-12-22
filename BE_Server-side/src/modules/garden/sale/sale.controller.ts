import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AtGuard } from 'src/modules/auth/guard/auth.guards';
import { RolesGuard } from 'src/modules/auth/guard/roles.guards';

@ApiTags('Sale Section')
@Controller('garden/:gardenId/sale')
@UseGuards(AtGuard, RolesGuard)
export class SaleController {
    constructor(private readonly saleService: SaleService) {}

    @ApiOperation({ summary: 'Bán rau trong vườn' })
    @Post('')
    async sellVegetable(
        @Param('gardenId') gardenId: number,
        @Body() saleDto: CreateSaleDto,
        @Req() req,
    ) {
        const user = req.user as { id: number; role: string };
        return this.saleService.sellVegetable(user.id, gardenId, saleDto);
    }

    @ApiOperation({ summary: 'Lấy danh sách các giao dịch bán của vườn' })
    @Get('')
    async getSalesByGarden(
        @Param('gardenId') gardenId: number,
        @Req() req,
    ) {
        const user = req.user as { id: number; role: string };
        return this.saleService.getSalesByGarden(user.id, user.role, gardenId);
    }

    @ApiOperation({ summary: 'Lấy thống kê doanh thu của vườn' })
    @Get('revenue')
    async getGardenRevenue(
        @Param('gardenId') gardenId: number,
        @Req() req,
    ) {
        const user = req.user as { id: number; role: string };
        return this.saleService.getGardenRevenue(user.id, user.role, gardenId);
    }
}

