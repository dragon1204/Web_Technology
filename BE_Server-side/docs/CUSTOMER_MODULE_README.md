# Module Customer - E-commerce System

## Tổng quan

Module này đã được tạo để cho phép khách hàng (CUSTOMER) xem danh sách các loại rau ở các shop của users, thêm vào giỏ hàng và mua hàng.

## Các tính năng đã triển khai

### 1. Role CUSTOMER
- ✅ Đã thêm role `CUSTOMER` vào enum Role trong schema
- ✅ Đã cập nhật guards để hỗ trợ CUSTOMER role

### 2. Shop Management (dành cho USER - shop owners)
- ✅ Tạo và quản lý shop
- ✅ Thêm/sửa/xóa sản phẩm vào shop
- ✅ Xem danh sách shop đang hoạt động

### 3. Product Browsing (dành cho CUSTOMER)
- ✅ Xem danh sách sản phẩm với phân trang
- ✅ Tìm kiếm và lọc sản phẩm (theo shop, category, tên)
- ✅ Sắp xếp sản phẩm (theo giá, tên, ngày tạo)
- ✅ Xem chi tiết sản phẩm

### 4. Shopping Cart (dành cho CUSTOMER)
- ✅ Thêm sản phẩm vào giỏ hàng
- ✅ Cập nhật số lượng sản phẩm
- ✅ Xóa sản phẩm khỏi giỏ hàng
- ✅ Xem giỏ hàng với tổng tiền

### 5. Order & Checkout (dành cho CUSTOMER)
- ✅ Quản lý địa chỉ giao hàng
- ✅ Checkout đơn hàng
- ✅ Tính phí vận chuyển tự động
- ✅ Xem lịch sử đơn hàng
- ✅ Hủy đơn hàng (chỉ khi PENDING)

### 6. Order Management (dành cho USER - shop owners)
- ✅ Xem danh sách đơn hàng của shop
- ✅ Cập nhật trạng thái đơn hàng

### 7. Shipping Fee Calculation
- ✅ Tính phí vận chuyển dựa trên:
  - Giá trị đơn hàng
  - Khu vực (nội thành/ngoại thành)
  - Khoảng cách (nếu có)

## Cấu trúc Database

### Models mới được thêm:

1. **Shop**: Cửa hàng của users
2. **ShopProduct**: Sản phẩm có sẵn trong shop (liên kết Vegetable + Garden)
3. **Cart**: Giỏ hàng của customer
4. **CartItem**: Sản phẩm trong giỏ hàng
5. **ShippingAddress**: Địa chỉ giao hàng của customer
6. **Order**: Đơn hàng
7. **OrderItem**: Sản phẩm trong đơn hàng

### Enums mới:
- **OrderStatus**: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED

## Các Module đã tạo

```
src/modules/
├── shop/              # Quản lý shop (USER)
│   ├── shop.controller.ts
│   ├── shop.service.ts
│   ├── shop.module.ts
│   └── dto/
│       ├── create-shop.dto.ts
│       ├── update-shop.dto.ts
│       └── add-product.dto.ts
│
├── product/           # Xem sản phẩm (CUSTOMER)
│   ├── product.controller.ts
│   ├── product.service.ts
│   ├── product.module.ts
│   └── dto/
│       └── find-product.dto.ts
│
├── cart/              # Giỏ hàng (CUSTOMER)
│   ├── cart.controller.ts
│   ├── cart.service.ts
│   ├── cart.module.ts
│   └── dto/
│       ├── add-to-cart.dto.ts
│       └── update-cart-item.dto.ts
│
└── order/             # Đơn hàng & Checkout
    ├── order.controller.ts
    ├── order.service.ts
    ├── shipping.service.ts
    ├── order.module.ts
    └── dto/
        ├── checkout.dto.ts
        ├── create-shipping-address.dto.ts
        └── update-order-status.dto.ts
```

## Cài đặt và chạy

### 1. Cập nhật database schema

```bash
npx prisma generate
npx prisma migrate dev --name add_customer_ecommerce_module
```

### 2. Chạy seed data

```bash
npx prisma db seed
```

Seed sẽ tạo:
- 2 customer users (customer1@example.com, customer2@example.com)
- 2 shops với sản phẩm mẫu
- Địa chỉ giao hàng mẫu

### 3. Khởi động server

```bash
npm run start:dev
```

## API Documentation

Xem file `docs/API_CUSTOMER_MODULE.md` để biết chi tiết về:
- Tất cả các endpoints
- Request/Response examples
- Error handling
- Flow mua hàng

## Test Accounts

Sau khi chạy seed:

**Customer:**
- Email: `customer1@example.com`
- Password: `password123`

**User (Shop Owner):**
- Email: `user1@example.com`
- Password: `password123`

**Admin:**
- Email: `admin@example.com`
- Password: `password123`

## Tính phí vận chuyển

### Công thức:
- **Phí cơ bản:** 20,000 VNĐ
- **Miễn phí:** Đơn hàng >= 200,000 VNĐ
- **Giảm 50%:** Đơn hàng >= 100,000 VNĐ
- **Giảm 20%:** Nội thành (Hà Nội, HCM, Đà Nẵng)
- **Tính theo km:** 5,000 VNĐ/km sau 5km đầu (nếu có)
- **Tối thiểu:** 15,000 VNĐ

## Flow mua hàng

1. Customer đăng nhập
2. Xem danh sách shop → `GET /shop/active`
3. Xem sản phẩm → `GET /product?shopId=1`
4. Thêm vào giỏ hàng → `POST /cart/items`
5. Xem giỏ hàng → `GET /cart`
6. Tạo địa chỉ giao hàng → `POST /order/shipping-address`
7. Checkout → `POST /order/checkout`
8. Xem đơn hàng → `GET /order/my-orders`

## Lưu ý quan trọng

1. ✅ Mỗi đơn hàng chỉ checkout từ 1 shop
2. ✅ Sau khi checkout, sản phẩm tự động xóa khỏi giỏ hàng
3. ✅ Stock tự động giảm sau checkout
4. ✅ Customer chỉ hủy được đơn hàng PENDING
5. ✅ Shop owner quản lý trạng thái đơn hàng
6. ✅ Phí ship tính tự động

## Các tính năng có thể mở rộng

- [ ] Tích hợp Google Maps API để tính khoảng cách chính xác
- [ ] Payment gateway integration
- [ ] Email notifications cho đơn hàng
- [ ] Review và rating sản phẩm
- [ ] Voucher/Discount codes
- [ ] Order tracking real-time
- [ ] Multi-address selection trong checkout
- [ ] Wishlist functionality

## Troubleshooting

### Lỗi migration:
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Lỗi Prisma Client:
```bash
npx prisma generate
```

### Lỗi import modules:
Kiểm tra `app.module.ts` đã import đầy đủ:
- ShopModule
- ProductModule
- CartModule
- OrderModule
