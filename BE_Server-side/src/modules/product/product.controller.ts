import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { FindProductDto } from './dto/find-product.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AtGuard } from '../auth/guard/auth.guards';
import { RolesGuard } from '../auth/guard/roles.guards';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Product')
@Controller('product')
@ApiBearerAuth('access-token')
@UseGuards(AtGuard, RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Tìm kiếm và lọc sản phẩm (CUSTOMER)' })
  @Get()
  @Roles(Role.CUSTOMER, Role.USER, Role.ADMIN)
  async findProducts(@Query() query: FindProductDto) {
    return this.productService.findProducts(query);
  }

  @ApiOperation({ summary: 'Xem chi tiết sản phẩm (CUSTOMER)' })
  @Get(':id')
  @Roles(Role.CUSTOMER, Role.USER, Role.ADMIN)
  async getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findProductById(id);
  }

  @ApiOperation({ summary: 'Lấy danh sách sản phẩm theo shop (CUSTOMER)' })
  @Get('shop/:shopId')
  @Roles(Role.CUSTOMER, Role.USER, Role.ADMIN)
  async getProductsByShop(@Param('shopId', ParseIntPipe) shopId: number) {
    return this.productService.getProductsByShop(shopId);
  }
}
