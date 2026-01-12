import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AtGuard } from '../auth/guard/auth.guards';
import { RolesGuard } from '../auth/guard/roles.guards';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from '@prisma/client';
import { GetCurrentUser } from '../users/decorator/getCurrentUser.decorator';

@ApiTags('Cart')
@Controller('cart')
@ApiBearerAuth('access-token')
@UseGuards(AtGuard, RolesGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Xem giỏ hàng của tôi (CUSTOMER)' })
  @Get()
  @Roles(Role.CUSTOMER)
  async getCart(@GetCurrentUser() user: any) {
    return this.cartService.getCart(user.id);
  }

  @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ hàng (CUSTOMER)' })
  @Post('items')
  @Roles(Role.CUSTOMER)
  async addToCart(@GetCurrentUser() user: any, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(user.id, dto);
  }

  @ApiOperation({ summary: 'Cập nhật số lượng sản phẩm trong giỏ hàng (CUSTOMER)' })
  @Patch('items/:id')
  @Roles(Role.CUSTOMER)
  async updateCartItem(
    @GetCurrentUser() user: any,
    @Param('id', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto
  ) {
    return this.cartService.updateCartItem(user.id, itemId, dto);
  }

  @ApiOperation({ summary: 'Xóa sản phẩm khỏi giỏ hàng (CUSTOMER)' })
  @Delete('items/:id')
  @Roles(Role.CUSTOMER)
  async removeFromCart(@GetCurrentUser() user: any, @Param('id', ParseIntPipe) itemId: number) {
    return this.cartService.removeFromCart(user.id, itemId);
  }

  @ApiOperation({ summary: 'Xóa toàn bộ giỏ hàng (CUSTOMER)' })
  @Delete('clear')
  @Roles(Role.CUSTOMER)
  async clearCart(@GetCurrentUser() user: any) {
    return this.cartService.clearCart(user.id);
  }
}
