import { Body, Controller, Get, Param, Post, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AtGuard } from 'src/modules/auth/guard/auth.guards';
import { RolesGuard } from 'src/modules/auth/guard/roles.guards';
import { SaleService } from './sale.service';

@ApiTags('Sale Section')
@ApiBearerAuth() // Thêm để Swagger hiển thị phần nhập Token
@Controller('garden/:gardenId/sale')
@UseGuards(AtGuard, RolesGuard)
export class SaleController {
    constructor(private readonly saleService: SaleService) {}

    @ApiOperation({ summary: 'Bán rau trong vườn' })
    @Post('')
    async sellVegetable(
        // Sử dụng ParseIntPipe để gardenId tự động ép kiểu về number
        @Param('gardenId', ParseIntPipe) gardenId: number,
        @Body() saleDto: CreateSaleDto,
        @Req() req,
    ) {
        const user = req.user;
        // Truyền user.id để service có thể kiểm tra xem user này có quyền sở hữu vườn này không
        return this.saleService.sellVegetable(Number(user.id), gardenId, saleDto);
    }

    @ApiOperation({ summary: 'Lấy danh sách các giao dịch bán của vườn' })
    @Get('')
    async getSalesByGarden(
        @Param('gardenId', ParseIntPipe) gardenId: number,
        @Req() req,
    ) {
        const user = req.user;
        return this.saleService.getSalesByGarden(Number(user.id), user.role, gardenId);
    }

    @ApiOperation({ summary: 'Lấy thống kê doanh thu của vườn' })
    @Get('revenue')
    async getGardenRevenue(
        @Param('gardenId', ParseIntPipe) gardenId: number,
        @Req() req,
    ) {
        const user = req.user;
        return this.saleService.getGardenRevenue(Number(user.id), user.role, gardenId);
    }
}