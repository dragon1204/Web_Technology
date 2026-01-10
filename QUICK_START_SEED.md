# ⚡ Quick Start - Seed Dữ Liệu Test

## 🚀 Chạy Nhanh

```bash
cd BE_Server-side

# 1. QUAN TRỌNG: Chạy migration trước (tạo các trường mới trong DB)
npx prisma migrate dev

# 2. Generate Prisma Client (nếu chưa tự động)
npx prisma generate

# 3. Chạy seed
npm run db:seed
```

**⚠️ Lưu ý:** Nếu gặp lỗi "Unknown argument", hãy chạy `npx prisma migrate dev` trước!

## 📝 Thông Tin Đăng Nhập

Sau khi seed xong, bạn có thể đăng nhập với:

### Admin
- **Email:** `admin@example.com`
- **Password:** `password123`

### User 1
- **Email:** `user1@example.com`
- **Password:** `password123`

### User 2
- **Email:** `user2@example.com`
- **Password:** `password123`

## 🧪 Test Ngay

### 1. Login và lấy token

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

Copy `access_token` từ response.

### 2. Test các API

```bash
# Thay YOUR_TOKEN bằng token vừa lấy
TOKEN="YOUR_TOKEN"

# Xem danh sách vườn
curl -X GET http://localhost:3000/garden \
  -H "Authorization: Bearer $TOKEN"

# Xem danh sách rau củ
curl -X GET http://localhost:3000/vegetable \
  -H "Authorization: Bearer $TOKEN"

# Xem thông báo
curl -X GET http://localhost:3000/notifications \
  -H "Authorization: Bearer $TOKEN"

# Xem alerts
curl -X GET http://localhost:3000/alerts \
  -H "Authorization: Bearer $TOKEN"

# Xem analytics
curl -X GET "http://localhost:3000/analytics/revenue/top-products?limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Dữ Liệu Đã Tạo

- ✅ 3 Users (1 Admin, 2 Users)
- ✅ 3 Gardens
- ✅ 5 Vegetables
- ✅ 4 Sensors
- ✅ 1,080+ Sensor Data records
- ✅ 50 Sales transactions
- ✅ 25 Price History records
- ✅ 3 Alert Rules
- ✅ 2 Alerts
- ✅ 4 Notifications
- ✅ 2 Report Templates

## 🔄 Reset Dữ Liệu

Để reset và seed lại:

```bash
npm run db:seed
```

**Lưu ý:** Script sẽ xóa tất cả dữ liệu cũ trước khi tạo mới.

## ❓ Gặp Vấn Đề?

1. **Lỗi database connection**: Kiểm tra `.env` file có `DATABASE_URL`
2. **Lỗi module not found**: Chạy `npm install`
3. **Lỗi Prisma client**: Chạy `npx prisma generate`

Xem chi tiết trong `SEED_DATA_GUIDE.md`

