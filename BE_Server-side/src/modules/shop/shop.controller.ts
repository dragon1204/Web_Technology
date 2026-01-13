import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { AddProductDto } from './dto/add-product.dto';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
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

  @ApiOperation({ summary: 'Lấy danh sách rau có thể thêm vào shop (USER - owner)' })
  @Get(':id/available-vegetables')
  @Roles(Role.USER, Role.ADMIN)
  async getAvailableVegetables(
    @Param('id', ParseIntPipe) shopId: number,
    @GetCurrentUser() user: any
  ) {
    return this.shopService.getAvailableVegetables(user.id, shopId);
  }

  @ApiOperation({ summary: 'Lấy danh sách sản phẩm trong shop với filter và pagination (USER - owner)' })
  @Get(':id/products')
  @Roles(Role.USER, Role.ADMIN)
  @ApiQuery({ name: 'isAvailable', required: false, type: Boolean, description: 'Lọc theo trạng thái có sẵn' })
  @ApiQuery({ name: 'vegetableId', required: false, type: Number, description: 'Lọc theo ID rau' })
  @ApiQuery({ name: 'gardenId', required: false, type: Number, description: 'Lọc theo ID vườn' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm kiếm theo tên rau hoặc tên vườn' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng mỗi trang (mặc định: 20)' })
  async getShopProducts(
    @Param('id', ParseIntPipe) shopId: number,
    @GetCurrentUser() user: any,
    @Query('isAvailable') isAvailable?: string,
    @Query('vegetableId') vegetableId?: string,
    @Query('gardenId') gardenId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const filters: any = {};
    if (isAvailable !== undefined) {
      filters.isAvailable = isAvailable === 'true';
    }
    if (vegetableId) {
      filters.vegetableId = parseInt(vegetableId, 10);
    }
    if (gardenId) {
      filters.gardenId = parseInt(gardenId, 10);
    }
    if (search) {
      filters.search = search;
    }

    const pagination: any = {};
    if (page) {
      pagination.page = parseInt(page, 10);
    }
    if (limit) {
      pagination.limit = parseInt(limit, 10);
    }

    return this.shopService.getShopProducts(shopId, user.id, filters, pagination, user);
  }
}
