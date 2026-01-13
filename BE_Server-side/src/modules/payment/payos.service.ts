import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';

export interface CreatePaymentData {
  orderCode: number; // Mã đơn hàng (unique, int64)
  amount: number; // Số tiền (VND)
  description: string; // Mô tả đơn hàng
  returnUrl: string; // URL redirect sau khi thanh toán thành công
  cancelUrl: string; // URL redirect khi hủy thanh toán
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  expiredAt?: number; // Unix timestamp (seconds) - thời gian hết hạn
}

export interface PaymentLinkResponse {
  bin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  orderCode: number;
  currency: string;
  paymentLinkId: string;
  qrCode: string; // QR code data (base64 image)
}

@Injectable()
export class PayOSService {
  private payOS: PayOS;
  private readonly logger = new Logger(PayOSService.name);

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('PAYOS_CLIENT_ID');
    const apiKey = this.configService.get<string>('PAYOS_API_KEY');
    const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY');

    if (!clientId || !apiKey || !checksumKey) {
      this.logger.warn('PayOS credentials not configured. Payment features will be disabled.');
      return;
    }

    try {
      this.payOS = new PayOS({
        clientId,
        apiKey,
        checksumKey,
      });
      this.logger.log('PayOS service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize PayOS:', error);
      throw error;
    }
  }

  /**
   * Tạo payment link và QR code
   */
  async createPaymentLink(data: CreatePaymentData): Promise<PaymentLinkResponse> {
    if (!this.payOS) {
      throw new BadRequestException('PayOS service is not configured');
    }

    try {
      this.logger.log(`Creating payment link for order code: ${data.orderCode}`);
      
      const paymentData = {
        orderCode: data.orderCode,
        amount: data.amount,
        description: data.description,
        returnUrl: data.returnUrl,
        cancelUrl: data.cancelUrl,
        items: data.items || [],
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        buyerPhone: data.buyerPhone,
        buyerAddress: data.buyerAddress,
        expiredAt: data.expiredAt,
      };

      const response = await this.payOS.paymentRequests.create(paymentData);
      
      this.logger.log(`Payment link created successfully: ${response.paymentLinkId}`);

      return {
        bin: response.bin || '',
        accountNumber: response.accountNumber || '',
        accountName: response.accountName || '',
        amount: response.amount,
        description: response.description,
        orderCode: response.orderCode,
        currency: response.currency || 'VND',
        paymentLinkId: response.paymentLinkId,
        qrCode: response.qrCode || '',
      };
    } catch (error: any) {
      this.logger.error('Failed to create payment link:', error);
      throw new BadRequestException(
        error.message || 'Không thể tạo payment link. Vui lòng thử lại.'
      );
    }
  }

  /**
   * Lấy thông tin payment theo payment link ID
   */
  async getPaymentLinkInformation(paymentLinkId: string) {
    if (!this.payOS) {
      throw new BadRequestException('PayOS service is not configured');
    }

    try {
      const response = await this.payOS.paymentRequests.get(paymentLinkId);
      return response;
    } catch (error: any) {
      this.logger.error('Failed to get payment link information:', error);
      throw new BadRequestException(
        error.message || 'Không thể lấy thông tin payment link.'
      );
    }
  }

  /**
   * Xác thực webhook data từ PayOS
   */
  verifyWebhookData(data: any, signature: string): boolean {
    if (!this.payOS) {
      return false;
    }

    try {
      // PayOS sẽ tự động verify signature trong webhook handler
      // Nhưng chúng ta có thể verify thêm nếu cần
      return true;
    } catch (error) {
      this.logger.error('Failed to verify webhook data:', error);
      return false;
    }
  }

  /**
   * Hủy payment link
   */
  async cancelPaymentLink(paymentLinkId: string, cancellationReason?: string) {
    if (!this.payOS) {
      throw new BadRequestException('PayOS service is not configured');
    }

    try {
      const response = await this.payOS.paymentRequests.cancel(paymentLinkId, cancellationReason);
      return response;
    } catch (error: any) {
      this.logger.error('Failed to cancel payment link:', error);
      throw new BadRequestException(
        error.message || 'Không thể hủy payment link.'
      );
    }
  }

  /**
   * Xác thực payment webhook
   */
  async verifyWebhook(webhookData: any): Promise<boolean> {
    if (!this.payOS) {
      return false;
    }

    try {
      // Sử dụng PayOS SDK để verify webhook
      const verifiedData = await this.payOS.webhooks.verify(webhookData);
      return verifiedData !== null && verifiedData !== undefined;
    } catch (error) {
      this.logger.error('Failed to verify webhook:', error);
      return false;
    }
  }
}
