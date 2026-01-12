import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ShippingService } from './shipping.service';
import { OrderStatus, Role } from '@prisma/client';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shippingService: ShippingService,
    private readonly cartService: CartService,
  ) {}

  // Tạo mã đơn hàng
  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  }

  async createShippingAddress(userId: number, dto: CreateShippingAddressDto) {
    // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
    if (dto.isDefault) {
      await this.prisma.shippingAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.shippingAddress.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async getShippingAddresses(userId: number) {
    return this.prisma.shippingAddress.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async updateShippingAddress(userId: number, addressId: number, dto: Partial<CreateShippingAddressDto>) {
    const address = await this.prisma.shippingAddress.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Không tìm thấy địa chỉ');
    }

    if (address.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật địa chỉ này');
    }

    // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
    if (dto.isDefault) {
      await this.prisma.shippingAddress.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.shippingAddress.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async deleteShippingAddress(userId: number, addressId: number) {
    const address = await this.prisma.shippingAddress.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Không tìm thấy địa chỉ');
    }

    if (address.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa địa chỉ này');
    }

    return this.prisma.shippingAddress.delete({
      where: { id: addressId },
    });
  }

  async checkout(userId: number, dto: CheckoutDto) {
    // Verify shop exists
    const shop = await this.prisma.shop.findUnique({
      where: { id: dto.shopId },
    });

    if (!shop) {
      throw new NotFoundException('Không tìm thấy shop');
    }

    if (!shop.isActive) {
      throw new BadRequestException('Shop này chưa được kích hoạt');
    }

    // Verify shipping address
    const shippingAddress = await this.prisma.shippingAddress.findUnique({
      where: { id: dto.shippingAddressId },
    });

    if (!shippingAddress) {
      throw new NotFoundException('Không tìm thấy địa chỉ giao hàng');
    }

    if (shippingAddress.userId !== userId) {
      throw new ForbiddenException('Địa chỉ này không thuộc về bạn');
    }

    // Get cart
    const cart = await this.cartService.getCart(userId);
    
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng trống');
    }

    // Filter items by shop
    const shopItems = cart.items.filter(
      (item) => item.shopProduct.shopId === dto.shopId
    );

    if (shopItems.length === 0) {
      throw new BadRequestException('Không có sản phẩm nào từ shop này trong giỏ hàng');
    }

    // Verify stock and calculate totals
    let subtotal = 0;
    const orderItems: Array<{
      shopProductId: number;
      quantity: number;
      price: number;
      subtotal: number;
    }> = [];

    for (const cartItem of shopItems) {
      const product = cartItem.shopProduct;

      if (!product.isAvailable) {
        throw new BadRequestException(`Sản phẩm "${product.vegetable.name}" hiện không có sẵn`);
      }

      if (product.stock < cartItem.quantity) {
        throw new BadRequestException(
          `Sản phẩm "${product.vegetable.name}" chỉ còn ${product.stock} sản phẩm trong kho`
        );
      }

      const itemSubtotal = product.price * cartItem.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        shopProductId: product.id,
        quantity: cartItem.quantity,
        price: product.price,
        subtotal: itemSubtotal,
      });
    }

    // Calculate shipping fee
    const shippingFee = this.shippingService.calculateShippingFee({
      subtotal,
      city: shippingAddress.city,
      district: shippingAddress.district || undefined,
    });

    const total = subtotal + shippingFee;

    // Create order in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          customerId: userId,
          shopId: dto.shopId,
          shippingAddressId: dto.shippingAddressId,
          status: OrderStatus.PENDING,
          subtotal,
          shippingFee,
          total,
          notes: dto.notes,
        },
      });

      // Create order items
      await tx.orderItem.createMany({
        data: orderItems.map((item) => ({
          orderId: newOrder.id,
          shopProductId: item.shopProductId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        })),
      });

      // Update stock
      for (const item of orderItems) {
        await tx.shopProduct.update({
          where: { id: item.shopProductId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Remove items from cart
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          shopProductId: {
            in: orderItems.map((item) => item.shopProductId),
          },
        },
      });

      return newOrder;
    });

    // Return order with details
    return this.prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            shopProduct: {
              include: {
                vegetable: true,
                garden: true,
              },
            },
          },
        },
        shippingAddress: true,
        shop: {
          select: {
            id: true,
            name: true,
            owner: {
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

  async getMyOrders(userId: number, status?: OrderStatus) {
    const where: any = { customerId: userId };
    if (status) {
      where.status = status;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            shopProduct: {
              include: {
                vegetable: true,
              },
            },
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: number, userId: number, userRole: Role) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            shopProduct: {
              include: {
                vegetable: true,
                garden: true,
              },
            },
          },
        },
        shippingAddress: true,
        shop: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    // Customer can only see their own orders
    if (userRole === Role.CUSTOMER && order.customerId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }

    // Shop owner can see orders for their shops
    if (userRole === Role.USER && order.shop.ownerId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }

    return order;
  }

  async updateOrderStatus(orderId: number, shopId: number, userId: number, dto: UpdateOrderStatusDto, userRole: Role) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { shop: true },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (order.shopId !== shopId) {
      throw new BadRequestException('Đơn hàng không thuộc shop này');
    }

    // Only shop owner or admin can update status
    if (order.shop.ownerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền cập nhật đơn hàng này');
    }

    // Customer can only cancel pending orders
    if (userRole === Role.CUSTOMER) {
      if (dto.status !== OrderStatus.CANCELLED) {
        throw new ForbiddenException('Bạn chỉ có thể hủy đơn hàng');
      }
      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException('Chỉ có thể hủy đơn hàng đang chờ xử lý');
      }
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
      include: {
        items: {
          include: {
            shopProduct: {
              include: {
                vegetable: true,
              },
            },
          },
        },
        shippingAddress: true,
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getShopOrders(shopId: number, ownerId: number, status?: OrderStatus, userRole?: Role) {
    // Verify shop ownership
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new NotFoundException('Không tìm thấy shop');
    }

    if (shop.ownerId !== ownerId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng của shop này');
    }

    const where: any = { shopId };
    if (status) {
      where.status = status;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            shopProduct: {
              include: {
                vegetable: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
