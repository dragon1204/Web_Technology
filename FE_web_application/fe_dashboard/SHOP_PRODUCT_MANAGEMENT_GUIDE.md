# Shop Product Management - Hướng Dẫn Sử Dụng

## 🎯 Tổng Quan

Module **Shop Product Management** cho phép USER quản lý các sản phẩm rau trong shop của mình với giao diện trực quan và hiện đại.

## 🚀 Tính Năng Chính

### 1. **Quản Lý Shop**
- Xem danh sách tất cả shop của bạn
- Chuyển đổi giữa các shop dễ dàng
- Hiển thị số lượng sản phẩm và trạng thái shop

### 2. **Quản Lý Sản Phẩm**
- ✅ Thêm sản phẩm từ vườn vào shop
- ✅ Cập nhật giá, số lượng, trạng thái
- ✅ Xóa sản phẩm khỏi shop
- ✅ Tìm kiếm và lọc sản phẩm

### 3. **Tìm Kiếm & Lọc**
- Tìm kiếm theo tên rau hoặc tên vườn
- Lọc theo trạng thái (Có sẵn / Không có sẵn)
- Phân trang với số lượng tùy chỉnh

### 4. **Giao Diện Đẹp Mắt**
- Design hiện đại với Material-UI
- Màu sắc chủ đạo: Xanh lá (#4cbe00)
- Responsive trên mọi thiết bị
- Animation mượt mà
- Icons trực quan

## 📂 Cấu Trúc File

```
fe_dashboard/src/
├── services/
│   ├── shopService.js          # API service cho shop
│   └── index.js                # Export tất cả services
├── components/
│   └── Shop/
│       ├── ShopProductManagement.jsx  # Component chính
│       └── index.js
├── styles/
│   └── ShopProductManagement.css     # Styling
└── App.js                      # Routes
```

## 🔧 API Integration

### Endpoints Đã Tích Hợp:

1. **GET** `/shop/my-shops` - Lấy danh sách shop
2. **GET** `/shop/:shopId/available-vegetables` - Lấy rau có thể thêm
3. **GET** `/shop/:shopId/products` - Lấy danh sách sản phẩm (với filter)
4. **POST** `/shop/:shopId/products` - Thêm sản phẩm
5. **PATCH** `/shop/:shopId/products/:productId` - Cập nhật sản phẩm
6. **DELETE** `/shop/:shopId/products/:productId` - Xóa sản phẩm

## 🎨 Giao Diện

### Header Section
- Tiêu đề lớn với icon
- Mô tả ngắn gọn

### Shop Selection
- Dropdown chọn shop
- Hiển thị số lượng sản phẩm
- Chip trạng thái hoạt động

### Filters & Actions
- Thanh tìm kiếm với icon
- Dropdown lọc trạng thái
- Nút "Làm mới" và "Thêm sản phẩm"

### Products Table
| Cột | Mô Tả |
|-----|-------|
| Hình ảnh | Avatar sản phẩm |
| Tên rau | Tên + category |
| Vườn | Tên vườn nguồn |
| Giá bán | Định dạng VNĐ |
| Tồn kho | Chip màu theo số lượng |
| Trạng thái | Có sẵn / Hết hàng |
| Thao tác | Sửa / Xóa |

### Dialogs

#### Thêm Sản Phẩm
- Select loại rau (với hình ảnh)
- Select vườn (hiển thị số lượng)
- Input giá bán
- Input số lượng
- Switch có sẵn/không

#### Sửa Sản Phẩm
- Hiển thị thông tin sản phẩm
- Cập nhật giá
- Cập nhật số lượng
- Toggle trạng thái

## 🎯 Workflow Sử Dụng

### 1. Truy Cập Module
```
Menu → Shop Products
hoặc URL: /shop-products
```

### 2. Chọn Shop
- Chọn shop từ dropdown
- Xem danh sách sản phẩm hiện tại

### 3. Thêm Sản Phẩm
1. Click "Thêm sản phẩm"
2. Chọn loại rau từ danh sách
3. Chọn vườn (nguồn rau)
4. Nhập giá bán
5. Nhập số lượng
6. Toggle trạng thái
7. Click "Thêm sản phẩm"

### 4. Sửa Sản Phẩm
1. Click icon "Sửa" trên hàng sản phẩm
2. Cập nhật thông tin cần thiết
3. Click "Cập nhật"

### 5. Xóa Sản Phẩm
1. Click icon "Xóa"
2. Xác nhận trong popup
3. Sản phẩm được xóa

### 6. Tìm Kiếm & Lọc
- Nhập từ khóa vào ô tìm kiếm
- Chọn trạng thái từ dropdown
- Kết quả tự động cập nhật

## 🎨 Color Scheme

```css
Primary: #4cbe00 (Green)
Dark: #2d8e00
Light: #7dd62f
Background: #f8fcf8
Success: #10b981
Warning: #f59e0b
Error: #dc2626
```

## 📱 Responsive Design

- **Desktop**: Full table với tất cả cột
- **Tablet**: Responsive columns
- **Mobile**: Optimized layout

## ⚡ Performance

- Lazy loading cho hình ảnh
- Debounce cho search input
- Pagination để giảm tải
- Caching cho available vegetables

## 🔐 Phân Quyền

- **USER**: Quản lý shop của mình
- **ADMIN**: Quản lý tất cả shop

## 🐛 Error Handling

- Toast notifications cho mọi action
- Loading states cho async operations
- Error messages rõ ràng
- Confirmation dialogs cho hành động nguy hiểm

## 📊 Features Highlights

### Chip Colors (Tồn Kho)
- 🟢 **Success** (>10): Còn nhiều
- 🟡 **Warning** (1-10): Sắp hết
- 🔴 **Error** (0): Hết hàng

### Button Styles
- **Contained**: Primary actions (Thêm, Cập nhật)
- **Outlined**: Secondary actions (Làm mới, Hủy)
- **Icon**: Quick actions (Sửa, Xóa)

### Animations
- Hover effects trên cards
- Scale animation cho icons
- Smooth transitions
- Gradient backgrounds

## 🚦 Status Messages

```javascript
✅ Success: "Thêm sản phẩm thành công!"
✅ Success: "Cập nhật sản phẩm thành công!"
✅ Success: "Xóa sản phẩm thành công!"
❌ Error: "Không thể tải danh sách shop"
❌ Error: "Vui lòng điền đầy đủ thông tin"
```

## 🔄 Auto Refresh Token

Module tự động làm mới token khi hết hạn thông qua axios interceptor trong `api.js`.

## 📝 Best Practices

1. **Luôn validate input** trước khi submit
2. **Hiển thị loading state** khi gọi API
3. **Xác nhận** trước khi xóa
4. **Toast notification** cho mọi action
5. **Handle errors** gracefully

## 🎯 Next Steps

- [ ] Bulk actions (thêm/xóa nhiều)
- [ ] Export danh sách sản phẩm
- [ ] Import từ Excel
- [ ] Statistics dashboard
- [ ] Product history tracking

## 📚 Related Documentation

- [SHOP_VEGETABLE_API.md](./SHOP_VEGETABLE_API.md) - API documentation
- [API_INTEGRATION_SUMMARY.md](./API_INTEGRATION_SUMMARY.md) - Overall API integration

---

**Version**: 1.0.0  
**Last Updated**: January 13, 2026  
**Author**: Garden IOT Team
