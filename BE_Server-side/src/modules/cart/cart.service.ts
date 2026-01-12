import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateCart(userId: number) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            shopProduct: {
              include: {
                vegetable: true,
                garden: true,
                shop: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              shopProduct: {
                include: {
                  vegetable: true,
                  garden: true,
                  shop: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    return cart;
  }

  async getCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);
    
    // Calculate totals
    let subtotal = 0;
    for (const item of cart.items) {
      if (!item.shopProduct.isAvailable || item.shopProduct.stock < item.quantity) {
        // Mark unavailable items
        continue;
      }
      subtotal += item.shopProduct.price * item.quantity;
    }

    return {
      ...cart,
      subtotal,
      itemCount: cart.items.length,
    };
  }

  async addToCart(userId: number, dto: AddToCartDto) {
    // Get or create cart
    await this.getOrCreateCart(userId);

    // Verify product exists and is available
    const product = await this.prisma.shopProduct.findUnique({
      where: { id: dto.shopProductId },
      include: {
        shop: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    if (!product.isAvailable) {
      throw new BadRequestException('Sản phẩm hiện không có sẵn');
    }

    if (!product.shop.isActive) {
      throw new BadRequestException('Shop này chưa được kích hoạt');
    }

    if (product.stock < dto.quantity) {
      throw new BadRequestException(`Chỉ còn ${product.stock} sản phẩm trong kho`);
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_shopProductId: {
          cartId: (await this.getOrCreateCart(userId)).id,
          shopProductId: dto.shopProductId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + dto.quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException(`Chỉ còn ${product.stock} sản phẩm trong kho`);
      }

      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          shopProduct: {
            include: {
              vegetable: true,
              garden: true,
              shop: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    }

    // Create new cart item
    const cart = await this.getOrCreateCart(userId);
    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        shopProductId: dto.shopProductId,
        quantity: dto.quantity,
      },
      include: {
        shopProduct: {
          include: {
            vegetable: true,
            garden: true,
            shop: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async updateCartItem(userId: number, itemId: number, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        shopProduct: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    if (item.cartId !== cart.id) {
      throw new BadRequestException('Sản phẩm không thuộc giỏ hàng của bạn');
    }

    if (item.shopProduct.stock < dto.quantity) {
      throw new BadRequestException(`Chỉ còn ${item.shopProduct.stock} sản phẩm trong kho`);
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
      include: {
        shopProduct: {
          include: {
            vegetable: true,
            garden: true,
            shop: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async removeFromCart(userId: number, itemId: number) {
    const cart = await this.getOrCreateCart(userId);
    
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    if (item.cartId !== cart.id) {
      throw new BadRequestException('Sản phẩm không thuộc giỏ hàng của bạn');
    }

    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);
    return this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }
}
