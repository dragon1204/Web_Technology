import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { AddProductDto } from './dto/add-product.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AtGuard } from '../auth/guard/auth.guards';
import { RolesGuard } from '../auth/guard/roles.guards';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from '@prisma/client';
import { GetCurrentUser } from '../users/decorator/getCurrentUser.decorator';

@ApiTags('Shop')
@Controller('shop')
@ApiBearerAuth('access-token')
@UseGuards(AtGuard, RolesGuard)
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @ApiOperation({ summary: 'Tạo shop mới (USER)' })
  @Post()
  @Roles(Role.USER, Role.ADMIN)
  async createShop(@GetCurrentUser() user: any, @Body() dto: CreateShopDto) {
    return this.shopService.createShop(user.id, dto);
  }

  @ApiOperation({ summary: 'Lấy danh sách shop của tôi (USER)' })
  @Get('my-shops')
  @Roles(Role.USER, Role.ADMIN)
  async getMyShops(@GetCurrentUser() user: any) {
    return this.shopService.findMyShops(user.id);
  }

  @ApiOperation({ summary: 'Lấy tất cả shop đang hoạt động (CUSTOMER, public)' })
  @Get('active')
  @Roles(Role.CUSTOMER, Role.USER, Role.ADMIN)
  async getActiveShops() {
    return this.shopService.getAllActiveShops();
  }

  @ApiOperation({ summary: 'Xem chi tiết shop (CUSTOMER, USER, ADMIN)' })
  @Get(':id')
  @Roles(Role.CUSTOMER, Role.USER, Role.ADMIN)
  async getShop(@Param('id', ParseIntPipe) id: number, @GetCurrentUser() user: any) {
    return this.shopService.findShopById(id, user);
  }

  @ApiOperation({ summary: 'Cập nhật shop (USER - owner, ADMIN)' })
  @Put(':id')
  @Roles(Role.USER, Role.ADMIN)
  async updateShop(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUser() user: any,
    @Body() dto: UpdateShopDto
  ) {
    return this.shopService.updateShop(id, user.id, dto, user);
  }

  @ApiOperation({ summary: 'Thêm sản phẩm vào shop (USER - owner)' })
  @Post(':id/products')
  @Roles(Role.USER, Role.ADMIN)
  async addProduct(
    @Param('id', ParseIntPipe) shopId: number,
    @GetCurrentUser() user: any,
    @Body() dto: AddProductDto
  ) {
    return this.shopService.addProduct(shopId, user.id, dto, user);
  }

  @ApiOperation({ summary: 'Cập nhật sản phẩm trong shop (USER - owner)' })
  @Patch(':shopId/products/:productId')
  @Roles(Role.USER, Role.ADMIN)
  async updateProduct(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @GetCurrentUser() user: any,
    @Body() dto: Partial<AddProductDto>
  ) {
    return this.shopService.updateProduct(shopId, productId, user.id, dto, user);
  }

  @ApiOperation({ summary: 'Xóa sản phẩm khỏi shop (USER - owner)' })
  @Delete(':shopId/products/:productId')
  @Roles(Role.USER, Role.ADMIN)
  async deleteProduct(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @GetCurrentUser() user: any
  ) {
    return this.shopService.deleteProduct(shopId, productId, user.id, user);
  }
}
