# Tài liệu API Module Customer (E-commerce)

## Tổng quan

Module này cho phép khách hàng (CUSTOMER) xem danh sách sản phẩm từ các shop của users, thêm vào giỏ hàng và mua hàng.

## Base URL

```
http://localhost:3000 (hoặc URL của server)
```

## Authentication

Tất cả các API đều yêu cầu Bearer Token trong header:

```
Authorization: Bearer <access_token>
```

## Các Module

### 1. Shop Module

Quản lý shop (dành cho USER role - shop owners)

#### 1.1. Tạo shop mới

**POST** `/shop`

**Role:** USER, ADMIN

**Request Body:**
```json
{
  "name": "Cửa hàng Rau Sạch ABC",
  "description": "Chuyên cung cấp rau sạch, an toàn"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Cửa hàng Rau Sạch ABC",
  "description": "Chuyên cung cấp rau sạch, an toàn",
  "ownerId": 1,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "owner": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "user1@example.com"
  }
}
```

#### 1.2. Lấy danh sách shop của tôi

**GET** `/shop/my-shops`

**Role:** USER, ADMIN

**Response:**
```json
[
  {
    "id": 1,
    "name": "Cửa hàng Rau Sạch ABC",
    "description": "Chuyên cung cấp rau sạch, an toàn",
    "ownerId": 1,
    "isActive": true,
    "products": [...],
    "_count": {
      "products": 3,
      "orders": 5
    }
  }
]
```

#### 1.3. Lấy tất cả shop đang hoạt động

**GET** `/shop/active`

**Role:** CUSTOMER, USER, ADMIN

**Response:**
```json
[
  {
    "id": 1,
    "name": "Cửa hàng Rau Sạch ABC",
    "description": "Chuyên cung cấp rau sạch, an toàn",
    "isActive": true,
    "owner": {
      "id": 1,
      "name": "Nguyễn Văn A"
    },
    "_count": {
      "products": 3
    }
  }
]
```

#### 1.4. Xem chi tiết shop

**GET** `/shop/:id`

**Role:** CUSTOMER, USER, ADMIN

**Response:**
```json
{
  "id": 1,
  "name": "Cửa hàng Rau Sạch ABC",
  "description": "Chuyên cung cấp rau sạch, an toàn",
  "ownerId": 1,
  "isActive": true,
  "products": [
    {
      "id": 1,
      "price": 35000,
      "stock": 50,
      "isAvailable": true,
      "vegetable": {
        "id": 1,
        "name": "Rau Cải Xanh",
        "category": "leafy",
        "description": "Rau cải xanh tươi ngon"
      },
      "garden": {
        "id": 1,
        "name": "Vườn Rau Cải Xanh"
      }
    }
  ]
}
```

#### 1.5. Thêm sản phẩm vào shop

**POST** `/shop/:id/products`

**Role:** USER, ADMIN

**Request Body:**
```json
{
  "vegetableId": 1,
  "gardenId": 1,
  "price": 35000,
  "stock": 50,
  "isAvailable": true
}
```

#### 1.6. Cập nhật sản phẩm trong shop

**PATCH** `/shop/:shopId/products/:productId`

**Role:** USER, ADMIN

**Request Body:**
```json
{
  "price": 38000,
  "stock": 45,
  "isAvailable": true
}
```

#### 1.7. Xóa sản phẩm khỏi shop

**DELETE** `/shop/:shopId/products/:productId`

**Role:** USER, ADMIN

---

### 2. Product Module

Xem và tìm kiếm sản phẩm (dành cho CUSTOMER)

#### 2.1. Tìm kiếm và lọc sản phẩm

**GET** `/product?page=1&limit=10&shopId=1&category=leafy&search=rau cải&sortBy=price&order=asc`

**Role:** CUSTOMER, USER, ADMIN

**Query Parameters:**
- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `shopId` (optional): Lọc theo shop ID
- `category` (optional): Lọc theo category (leafy, root, fruit, herb)
- `search` (optional): Tìm kiếm theo tên sản phẩm
- `sortBy` (optional): Sắp xếp theo field (price, name, createdAt)
- `order` (optional): Thứ tự (asc, desc)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "price": 35000,
      "stock": 50,
      "isAvailable": true,
      "vegetable": {
        "id": 1,
        "name": "Rau Cải Xanh",
        "category": "leafy",
        "description": "Rau cải xanh tươi ngon",
        "image": null
      },
      "garden": {
        "id": 1,
        "name": "Vườn Rau Cải Xanh",
        "owner": {
          "id": 1,
          "name": "Nguyễn Văn A"
        }
      },
      "shop": {
        "id": 1,
        "name": "Cửa hàng Rau Sạch ABC",
        "description": "Chuyên cung cấp rau sạch, an toàn"
      }
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

#### 2.2. Xem chi tiết sản phẩm

**GET** `/product/:id`

**Role:** CUSTOMER, USER, ADMIN

**Response:**
```json
{
  "id": 1,
  "price": 35000,
  "stock": 50,
  "isAvailable": true,
  "vegetable": {
    "id": 1,
    "name": "Rau Cải Xanh",
    "category": "leafy",
    "description": "Rau cải xanh tươi ngon",
    "image": null
  },
  "garden": {
    "id": 1,
    "name": "Vườn Rau Cải Xanh",
    "owner": {
      "id": 1,
      "name": "Nguyễn Văn A"
    }
  },
  "shop": {
    "id": 1,
    "name": "Cửa hàng Rau Sạch ABC",
    "description": "Chuyên cung cấp rau sạch, an toàn",
    "owner": {
      "id": 1,
      "name": "Nguyễn Văn A"
    }
  }
}
```

#### 2.3. Lấy danh sách sản phẩm theo shop

**GET** `/product/shop/:shopId`

**Role:** CUSTOMER, USER, ADMIN

**Response:**
```json
[
  {
    "id": 1,
    "price": 35000,
    "stock": 50,
    "isAvailable": true,
    "vegetable": {
      "id": 1,
      "name": "Rau Cải Xanh",
      "category": "leafy"
    },
    "garden": {
      "id": 1,
      "name": "Vườn Rau Cải Xanh",
      "owner": {
        "id": 1,
        "name": "Nguyễn Văn A"
      }
    }
  }
]
```

---

### 3. Cart Module

Quản lý giỏ hàng (dành cho CUSTOMER)

#### 3.1. Xem giỏ hàng

**GET** `/cart`

**Role:** CUSTOMER

**Response:**
```json
{
  "id": 1,
  "userId": 3,
  "items": [
    {
      "id": 1,
      "quantity": 2,
      "shopProduct": {
        "id": 1,
        "price": 35000,
        "stock": 50,
        "vegetable": {
          "id": 1,
          "name": "Rau Cải Xanh",
          "category": "leafy"
        },
        "garden": {
          "id": 1,
          "name": "Vườn Rau Cải Xanh"
        },
        "shop": {
          "id": 1,
          "name": "Cửa hàng Rau Sạch ABC"
        }
      }
    }
  ],
  "subtotal": 70000,
  "itemCount": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 3.2. Thêm sản phẩm vào giỏ hàng

**POST** `/cart/items`

**Role:** CUSTOMER

**Request Body:**
```json
{
  "shopProductId": 1,
  "quantity": 2
}
```

**Response:**
```json
{
  "id": 1,
  "quantity": 2,
  "shopProduct": {
    "id": 1,
    "price": 35000,
    "stock": 50,
    "vegetable": {
      "id": 1,
      "name": "Rau Cải Xanh"
    },
    "garden": {
      "id": 1,
      "name": "Vườn Rau Cải Xanh"
    },
    "shop": {
      "id": 1,
      "name": "Cửa hàng Rau Sạch ABC"
    }
  }
}
```

#### 3.3. Cập nhật số lượng sản phẩm

**PATCH** `/cart/items/:id`

**Role:** CUSTOMER

**Request Body:**
```json
{
  "quantity": 3
}
```

#### 3.4. Xóa sản phẩm khỏi giỏ hàng

**DELETE** `/cart/items/:id`

**Role:** CUSTOMER

#### 3.5. Xóa toàn bộ giỏ hàng

**DELETE** `/cart/clear`

**Role:** CUSTOMER

---

### 4. Order Module

Quản lý đơn hàng và checkout (dành cho CUSTOMER)

#### 4.1. Tạo địa chỉ giao hàng

**POST** `/order/shipping-address`

**Role:** CUSTOMER

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567",
  "address": "123 Đường ABC, Phường XYZ",
  "ward": "Phường 1",
  "district": "Quận 1",
  "city": "Hồ Chí Minh",
  "isDefault": true
}
```

**Response:**
```json
{
  "id": 1,
  "userId": 3,
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567",
  "address": "123 Đường ABC, Phường XYZ",
  "ward": "Phường 1",
  "district": "Quận 1",
  "city": "Hồ Chí Minh",
  "isDefault": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### 4.2. Lấy danh sách địa chỉ giao hàng

**GET** `/order/shipping-address`

**Role:** CUSTOMER

**Response:**
```json
[
  {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "address": "123 Đường ABC",
    "ward": "Phường 1",
    "district": "Quận 1",
    "city": "Hồ Chí Minh",
    "isDefault": true
  }
]
```

#### 4.3. Cập nhật địa chỉ giao hàng

**PUT** `/order/shipping-address/:id`

**Role:** CUSTOMER

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn B",
  "phone": "0901234568",
  "isDefault": true
}
```

#### 4.4. Xóa địa chỉ giao hàng

**DELETE** `/order/shipping-address/:id`

**Role:** CUSTOMER

#### 4.5. Checkout (Thanh toán)

**POST** `/order/checkout`

**Role:** CUSTOMER

**Request Body:**
```json
{
  "shopId": 1,
  "shippingAddressId": 1,
  "notes": "Giao hàng vào buổi sáng"
}
```

**Response:**
```json
{
  "id": 1,
  "orderNumber": "ORD-1704067200000-123",
  "customerId": 3,
  "shopId": 1,
  "shippingAddressId": 1,
  "status": "PENDING",
  "subtotal": 70000,
  "shippingFee": 20000,
  "total": 90000,
  "notes": "Giao hàng vào buổi sáng",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "items": [
    {
      "id": 1,
      "quantity": 2,
      "price": 35000,
      "subtotal": 70000,
      "shopProduct": {
        "id": 1,
        "vegetable": {
          "id": 1,
          "name": "Rau Cải Xanh"
        },
        "garden": {
          "id": 1,
          "name": "Vườn Rau Cải Xanh"
        }
      }
    }
  ],
  "shippingAddress": {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "address": "123 Đường ABC",
    "city": "Hồ Chí Minh"
  },
  "shop": {
    "id": 1,
    "name": "Cửa hàng Rau Sạch ABC",
    "owner": {
      "id": 1,
      "name": "Nguyễn Văn A"
    }
  }
}
```

**Lưu ý:**
- Chỉ checkout các sản phẩm từ cùng 1 shop
- Sau khi checkout thành công, sản phẩm sẽ tự động bị xóa khỏi giỏ hàng
- Stock sẽ tự động giảm sau khi checkout

#### 4.6. Lấy danh sách đơn hàng của tôi

**GET** `/order/my-orders?status=PENDING`

**Role:** CUSTOMER

**Query Parameters:**
- `status` (optional): Lọc theo trạng thái (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)

**Response:**
```json
[
  {
    "id": 1,
    "orderNumber": "ORD-1704067200000-123",
    "status": "PENDING",
    "subtotal": 70000,
    "shippingFee": 20000,
    "total": 90000,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "items": [
      {
        "id": 1,
        "quantity": 2,
        "price": 35000,
        "subtotal": 70000,
        "shopProduct": {
          "vegetable": {
            "name": "Rau Cải Xanh"
          }
        }
      }
    ],
    "shop": {
      "id": 1,
      "name": "Cửa hàng Rau Sạch ABC"
    },
    "shippingAddress": {
      "fullName": "Nguyễn Văn A",
      "phone": "0901234567",
      "address": "123 Đường ABC",
      "city": "Hồ Chí Minh"
    }
  }
]
```

#### 4.7. Xem chi tiết đơn hàng

**GET** `/order/:id`

**Role:** CUSTOMER, USER, ADMIN

**Response:**
```json
{
  "id": 1,
  "orderNumber": "ORD-1704067200000-123",
  "status": "PENDING",
  "subtotal": 70000,
  "shippingFee": 20000,
  "total": 90000,
  "items": [...],
  "shippingAddress": {...},
  "shop": {...},
  "customer": {
    "id": 3,
    "name": "Lê Văn C",
    "email": "customer1@example.com"
  }
}
```

#### 4.8. Lấy danh sách đơn hàng của shop (dành cho shop owner)

**GET** `/order/shop/:shopId?status=PENDING`

**Role:** USER, ADMIN

**Response:**
```json
[
  {
    "id": 1,
    "orderNumber": "ORD-1704067200000-123",
    "status": "PENDING",
    "total": 90000,
    "customer": {
      "id": 3,
      "name": "Lê Văn C",
      "email": "customer1@example.com"
    },
    "items": [...],
    "shippingAddress": {...}
  }
]
```

#### 4.9. Cập nhật trạng thái đơn hàng (dành cho shop owner)

**PATCH** `/order/:shopId/orders/:orderId/status`

**Role:** USER, ADMIN

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Các trạng thái:**
- `PENDING`: Đang chờ xử lý
- `CONFIRMED`: Đã xác nhận
- `PROCESSING`: Đang xử lý
- `SHIPPED`: Đã giao hàng
- `DELIVERED`: Đã nhận hàng
- `CANCELLED`: Đã hủy

---

## Tính phí vận chuyển (Shipping Fee)

### Công thức tính phí:

1. **Phí cơ bản:** 20,000 VNĐ
2. **Miễn phí ship:** Nếu đơn hàng >= 200,000 VNĐ
3. **Giảm 50% phí ship:** Nếu đơn hàng >= 100,000 VNĐ
4. **Tính theo khoảng cách:** 5,000 VNĐ/km sau 5km đầu tiên (nếu có thông tin khoảng cách)
5. **Giảm 20%:** Nếu ở nội thành (Hà Nội, Hồ Chí Minh, Đà Nẵng)
6. **Phí tối thiểu:** 15,000 VNĐ

### Ví dụ:
- Đơn hàng 50,000 VNĐ → Phí ship: 20,000 VNĐ
- Đơn hàng 150,000 VNĐ → Phí ship: 10,000 VNĐ (giảm 50%)
- Đơn hàng 250,000 VNĐ → Phí ship: 0 VNĐ (miễn phí)

---

## Error Codes

### 400 Bad Request
- Giỏ hàng trống
- Sản phẩm không có đủ số lượng
- Sản phẩm không có sẵn

### 401 Unauthorized
- Token không hợp lệ hoặc đã hết hạn

### 403 Forbidden
- Không có quyền truy cập
- Không phải chủ sở hữu

### 404 Not Found
- Không tìm thấy shop/sản phẩm/đơn hàng

---

## Flow mua hàng

1. **Customer đăng nhập** → Lấy access token
2. **Xem danh sách shop** → `GET /shop/active`
3. **Xem sản phẩm** → `GET /product?shopId=1`
4. **Thêm vào giỏ hàng** → `POST /cart/items`
5. **Xem giỏ hàng** → `GET /cart`
6. **Tạo địa chỉ giao hàng** (nếu chưa có) → `POST /order/shipping-address`
7. **Checkout** → `POST /order/checkout`
8. **Xem đơn hàng** → `GET /order/my-orders`

---

## Lưu ý quan trọng

1. **Mỗi đơn hàng chỉ có thể checkout từ 1 shop**
2. **Sau khi checkout, sản phẩm tự động bị xóa khỏi giỏ hàng**
3. **Stock tự động giảm sau khi checkout thành công**
4. **Customer chỉ có thể hủy đơn hàng ở trạng thái PENDING**
5. **Shop owner có thể cập nhật trạng thái đơn hàng**
6. **Phí ship được tính tự động dựa trên giá trị đơn hàng và địa chỉ**

---

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
