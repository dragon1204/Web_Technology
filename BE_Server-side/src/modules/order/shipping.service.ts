import { Injectable } from '@nestjs/common';

export interface ShippingFeeParams {
  subtotal: number;
  distance?: number; // km
  city?: string;
  district?: string;
}

@Injectable()
export class ShippingService {
  // Tính phí vận chuyển dựa trên:
  // 1. Khoảng cách (nếu có)
  // 2. Tổng giá trị đơn hàng
  // 3. Khu vực (city/district)
  calculateShippingFee(params: ShippingFeeParams): number {
    const { subtotal, distance, city, district } = params;

    // Phí cơ bản
    let baseFee = 20000; // 20,000 VNĐ

    // Nếu đơn hàng >= 200,000 VNĐ thì miễn phí ship
    if (subtotal >= 200000) {
      return 0;
    }

    // Nếu đơn hàng >= 100,000 VNĐ thì giảm 50% phí ship
    if (subtotal >= 100000) {
      baseFee = baseFee * 0.5;
    }

    // Tính phí theo khoảng cách (nếu có)
    if (distance !== undefined && distance > 0) {
      // 5,000 VNĐ cho mỗi km sau 5km đầu tiên
      if (distance > 5) {
        baseFee += (distance - 5) * 5000;
      }
    }

    // Phí theo khu vực (ví dụ: nội thành vs ngoại thành)
    if (city) {
      const innerCities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'];
      if (innerCities.includes(city)) {
        // Nội thành: giảm 20%
        baseFee = baseFee * 0.8;
      }
    }

    // Phí tối thiểu là 15,000 VNĐ
    return Math.max(15000, Math.round(baseFee));
  }

  // Tính khoảng cách giữa 2 điểm (đơn giản, có thể tích hợp Google Maps API sau)
  // Hiện tại trả về null, sẽ tính dựa trên địa chỉ thực tế
  async calculateDistance(
    fromAddress: string,
    toAddress: string
  ): Promise<number | null> {
    // TODO: Tích hợp Google Maps Distance Matrix API hoặc tương tự
    // Hiện tại trả về null, sẽ dùng phí cơ bản
    return null;
  }
}
