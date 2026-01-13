import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { PayOSService } from './payos.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AtGuard } from '../auth/guard/auth.guards';
import { RolesGuard } from '../auth/guard/roles.guards';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from '@prisma/client';
import { GetCurrentUser } from '../users/decorator/getCurrentUser.decorator';
import { OrderService } from '../order/order.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly payOSService: PayOSService,
    private readonly orderService: OrderService,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  @ApiOperation({ summary: 'Tạo payment link và QR code cho đơn hàng (CUSTOMER)' })
  @Post('create')
  @ApiBearerAuth('access-token')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  async createPayment(
    @GetCurrentUser() user: any,
    @Body() dto: CreatePaymentDto,
  ) {
    // Lấy thông tin đơn hàng
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        customer: true,
        shop: true,
        shippingAddress: true,
        items: {
          include: {
            shopProduct: {
              include: {
                vegetable: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (order.customerId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền thanh toán đơn hàng này');
    }

    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Đơn hàng đã được thanh toán');
    }

    // Tạo order code từ order ID (PayOS yêu cầu int64, unique)
    // Sử dụng order ID * 1000 + timestamp để đảm bảo unique
    const orderCode = parseInt(`${order.id}${Date.now().toString().slice(-6)}`);

    // Chuẩn bị items cho PayOS
    const items = order.items.map((item) => ({
      name: item.shopProduct.vegetable.name,
      quantity: item.quantity,
      price: item.price,
    }));

    // Mô tả thanh toán (PayOS giới hạn tối đa 25 ký tự)
    let description = `DH ${order.orderNumber}`;
    if (description.length > 25) {
      description = description.slice(0, 25);
    }

    // Tạo payment link
    const paymentData = {
      orderCode,
      amount: Math.round(order.total), // PayOS yêu cầu số nguyên (VND)
      description,
      returnUrl: dto.returnUrl,
      cancelUrl: dto.cancelUrl || dto.returnUrl,
      items,
      buyerName: order.shippingAddress.fullName,
      buyerEmail: order.customer.email,
      buyerPhone: order.shippingAddress.phone,
      buyerAddress: `${order.shippingAddress.address}, ${order.shippingAddress.ward || ''}, ${order.shippingAddress.district || ''}, ${order.shippingAddress.city}`,
      expiredAt: dto.expiredAt || Math.floor(Date.now() / 1000) + 15 * 60, // Mặc định 15 phút
    };

    const paymentResponse = await this.payOSService.createPaymentLink(paymentData);

    // Cập nhật order với payment information
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: paymentResponse.paymentLinkId,
        paymentStatus: 'PENDING',
        paymentMethod: 'PAYOS',
        paymentLink: `https://pay.payos.vn/web/${paymentResponse.paymentLinkId}`,
        paymentQrCode: paymentResponse.qrCode,
      },
    });

    return {
      HttpCode: 200,
      success: true,
      message: 'Payment link created successfully',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentLinkId: paymentResponse.paymentLinkId,
        paymentLink: `https://pay.payos.vn/web/${paymentResponse.paymentLinkId}`,
        qrCode: paymentResponse.qrCode,
        amount: paymentResponse.amount,
        orderCode: paymentResponse.orderCode,
        accountNumber: paymentResponse.accountNumber,
        accountName: paymentResponse.accountName,
        bin: paymentResponse.bin,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @ApiOperation({ summary: 'Webhook nhận callback từ PayOS (Public - không cần auth)' })
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description: 'Webhook data from PayOS',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        desc: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            orderCode: { type: 'number' },
            amount: { type: 'number' },
            description: { type: 'string' },
            accountNumber: { type: 'string' },
            reference: { type: 'string' },
            transactionDateTime: { type: 'string' },
            currency: { type: 'string' },
            paymentLinkId: { type: 'string' },
            code: { type: 'string' },
            desc: { type: 'string' },
          },
        },
        signature: { type: 'string' },
      },
    },
  })
  async handleWebhook(@Body() webhookData: any, @Req() req: any) {
    this.logger.log('Received webhook from PayOS:', JSON.stringify(webhookData));

    try {
      // Verify webhook data
      const isValid = await this.payOSService.verifyWebhook(webhookData);
      if (!isValid) {
        this.logger.warn('Invalid webhook data received');
        return {
          code: '00',
          desc: 'SUCCESS',
        };
      }

      const { code, desc, data } = webhookData;

      // Tìm order theo paymentLinkId
      const order = await this.prisma.order.findFirst({
        where: {
          paymentId: data.paymentLinkId,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          shop: {
            select: {
              id: true,
              name: true,
              ownerId: true,
            },
          },
          items: {
            include: {
              shopProduct: {
                select: {
                  id: true,
                  gardenId: true,
                  vegetableId: true,
                  price: true,
                  vegetable: {
                    select: { name: true },
                  },
                  garden: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!order) {
        this.logger.warn(`Order not found for paymentLinkId: ${data.paymentLinkId}`);
        return {
          code: '00',
          desc: 'SUCCESS',
        };
      }

      // Xử lý theo code
      if (code === '00' && desc === 'SUCCESS') {
        // Thanh toán thành công: cập nhật Order, tạo bản ghi doanh thu và thông báo
        await this.prisma.$transaction(async (tx) => {
          // 1. Cập nhật trạng thái đơn hàng
          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'PAID',
              paidAt: new Date(),
              status: 'CONFIRMED', // Chuyển đơn hàng sang trạng thái CONFIRMED
            },
          });

          // 2. Ghi nhận doanh thu vào bảng Sale cho từng item trong đơn
          for (const item of order.items) {
            const shopProduct = item.shopProduct;
            if (!shopProduct?.gardenId || !shopProduct?.vegetableId) {
              continue;
            }

            await tx.sale.create({
              data: {
                gardenId: shopProduct.gardenId,
                vegetableId: shopProduct.vegetableId,
                quantity: item.quantity,
                priceAtSale: item.price,
                total: item.subtotal,
              },
            });
          }
        });

        this.logger.log(`Order ${order.orderNumber} payment confirmed & revenue recorded`);

        // 3. Gửi notification cho khách hàng
        if (order.customer) {
          await this.notificationService.createForUser(
            order.customer.id,
            'Thanh toán thành công',
            `Đơn hàng ${order.orderNumber} đã được thanh toán thành công.`,
            'success',
          );
        }

        // 4. Gửi notification cho chủ shop
        if (order.shop?.ownerId) {
          await this.notificationService.createForUser(
            order.shop.ownerId,
            'Đơn hàng mới đã thanh toán',
            `Khách hàng ${order.customer?.name || ''} đã thanh toán đơn hàng ${order.orderNumber} với số tiền ${order.total.toLocaleString('vi-VN')} VNĐ.`,
            'info',
          );
        }
      } else if (code === '01' || desc === 'CANCELLED') {
        // Thanh toán bị hủy
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'CANCELLED',
          },
        });

        this.logger.log(`Order ${order.orderNumber} payment cancelled`);
      } else {
        // Các trường hợp khác (expired, failed, etc.)
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'EXPIRED',
          },
        });

        this.logger.log(`Order ${order.orderNumber} payment expired/failed`);
      }

      // PayOS yêu cầu trả về format này
      return {
        code: '00',
        desc: 'SUCCESS',
      };
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      // Vẫn trả về success để PayOS không retry
      return {
        code: '00',
        desc: 'SUCCESS',
      };
    }
  }

  @ApiOperation({ summary: 'Lấy thông tin payment link (CUSTOMER)' })
  @Get('link/:paymentLinkId')
  @ApiBearerAuth('access-token')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  async getPaymentLinkInfo(
    @GetCurrentUser() user: any,
    @Param('paymentLinkId') paymentLinkId: string,
  ) {
    const paymentInfo = await this.payOSService.getPaymentLinkInformation(paymentLinkId);

    // Verify order belongs to user
    const order = await this.prisma.order.findFirst({
      where: {
        paymentId: paymentLinkId,
        customerId: user.id,
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy payment link');
    }

    return {
      HttpCode: 200,
      success: true,
      data: {
        paymentInfo,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  @ApiOperation({ summary: 'Kiểm tra trạng thái thanh toán của đơn hàng (CUSTOMER)' })
  @Get('status/:orderId')
  @ApiBearerAuth('access-token')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  async getPaymentStatus(
    @GetCurrentUser() user: any,
    @Param('orderId') orderId: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        paymentId: true,
        paymentStatus: true,
        paymentMethod: true,
        paymentLink: true,
        paymentQrCode: true,
        paidAt: true,
        status: true,
        customerId: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (order.customerId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }

    // Nếu có paymentId, lấy thông tin mới nhất từ PayOS
    let paymentInfo: any = null;
    if (order.paymentId) {
      try {
        paymentInfo = await this.payOSService.getPaymentLinkInformation(order.paymentId);
      } catch (error) {
        this.logger.warn(`Failed to get payment info for ${order.paymentId}:`, error);
      }
    }

    return {
      HttpCode: 200,
      success: true,
      data: {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          paymentLink: order.paymentLink,
          paymentQrCode: order.paymentQrCode,
          paidAt: order.paidAt,
        },
        paymentInfo,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
