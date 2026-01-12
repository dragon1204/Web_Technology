import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AtGuard } from '../auth/guard/auth.guards';
import { RolesGuard } from '../auth/guard/roles.guards';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role, OrderStatus } from '@prisma/client';
import { GetCurrentUser } from '../users/decorator/getCurrentUser.decorator';

@ApiTags('Order')
@Controller('order')
@ApiBearerAuth('access-token')
@UseGuards(AtGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // Shipping Address endpoints
  @ApiOperation({ summary: 'Tạo địa chỉ giao hàng mới (CUSTOMER)' })
  @Post('shipping-address')
  @Roles(Role.CUSTOMER)
  async createShippingAddress(@GetCurrentUser() user: any, @Body() dto: CreateShippingAddressDto) {
    return this.orderService.createShippingAddress(user.id, dto);
  }

  @ApiOperation({ summary: 'Lấy danh sách địa chỉ giao hàng của tôi (CUSTOMER)' })
  @Get('shipping-address')
  @Roles(Role.CUSTOMER)
  async getShippingAddresses(@GetCurrentUser() user: any) {
    return this.orderService.getShippingAddresses(user.id);
  }

  @ApiOperation({ summary: 'Cập nhật địa chỉ giao hàng (CUSTOMER)' })
  @Put('shipping-address/:id')
  @Roles(Role.CUSTOMER)
  async updateShippingAddress(
    @GetCurrentUser() user: any,
    @Param('id', ParseIntPipe) addressId: number,
    @Body() dto: Partial<CreateShippingAddressDto>
  ) {
    return this.orderService.updateShippingAddress(user.id, addressId, dto);
  }

  @ApiOperation({ summary: 'Xóa địa chỉ giao hàng (CUSTOMER)' })
  @Delete('shipping-address/:id')
  @Roles(Role.CUSTOMER)
  async deleteShippingAddress(@GetCurrentUser() user: any, @Param('id', ParseIntPipe) addressId: number) {
    return this.orderService.deleteShippingAddress(user.id, addressId);
  }

  // Checkout and Orders
  @ApiOperation({ summary: 'Thanh toán đơn hàng (CUSTOMER)' })
  @Post('checkout')
  @Roles(Role.CUSTOMER)
  async checkout(@GetCurrentUser() user: any, @Body() dto: CheckoutDto) {
    return this.orderService.checkout(user.id, dto);
  }

  @ApiOperation({ summary: 'Lấy danh sách đơn hàng của tôi (CUSTOMER)' })
  @Get('my-orders')
  @Roles(Role.CUSTOMER)
  async getMyOrders(
    @GetCurrentUser() user: any,
    @Query('status') status?: OrderStatus
  ) {
    return this.orderService.getMyOrders(user.id, status);
  }

  @ApiOperation({ summary: 'Lấy danh sách đơn hàng của shop (USER - shop owner)' })
  @Get('shop/:shopId')
  @Roles(Role.USER, Role.ADMIN)
  async getShopOrders(
    @Param('shopId', ParseIntPipe) shopId: number,
    @GetCurrentUser() user: any,
    @Query('status') status?: OrderStatus
  ) {
    return this.orderService.getShopOrders(shopId, user.id, status, user.role);
  }

  @ApiOperation({ summary: 'Xem chi tiết đơn hàng (CUSTOMER, USER, ADMIN)' })
  @Get(':id')
  @Roles(Role.CUSTOMER, Role.USER, Role.ADMIN)
  async getOrder(@Param('id', ParseIntPipe) orderId: number, @GetCurrentUser() user: any) {
    return this.orderService.getOrderById(orderId, user.id, user.role);
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng (USER - shop owner, ADMIN)' })
  @Patch(':shopId/orders/:orderId/status')
  @Roles(Role.USER, Role.ADMIN)
  async updateOrderStatus(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
    @GetCurrentUser() user: any,
    @Body() dto: UpdateOrderStatusDto
  ) {
    return this.orderService.updateOrderStatus(orderId, shopId, user.id, dto, user.role);
  }
}
