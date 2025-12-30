# ⚠️ Quan Trọng: Setup Trước Khi Seed

## ❌ Lỗi: "Unknown argument `area`"

Lỗi này xảy ra khi Prisma Client chưa được generate sau khi thêm các trường mới vào schema.

## ✅ Giải Pháp - Chạy Theo Thứ Tự

### Bước 1: Chạy Migration

```bash
cd BE_Server-side
npx prisma migrate dev
```

Lệnh này sẽ:
- Tạo migration file cho các thay đổi trong schema
- Áp dụng migration vào database
- Tự động generate Prisma Client

### Bước 2: (Nếu cần) Generate Prisma Client Thủ Công

Nếu migration không tự động generate:

```bash
npx prisma generate
```

### Bước 3: Chạy Seed

```bash
npm run db:seed
```

## 🔄 Hoặc Chạy Tất Cả Cùng Lúc

```bash
cd BE_Server-side

# 1. Migration (quan trọng nhất!)
npx prisma migrate dev

# 2. Generate Prisma Client (nếu chưa tự động)
npx prisma generate

# 3. Seed data
npm run db:seed
```

## 📝 Lưu Ý

- **Luôn chạy migration trước khi seed** nếu có thay đổi schema
- Script `seed.js` đã được cập nhật để tự động generate, nhưng vẫn cần migration trước
- Nếu database đã có dữ liệu, có thể cần reset:

```bash
npx prisma migrate reset
npx prisma migrate dev
npm run db:seed
```

## 🐛 Nếu Vẫn Lỗi

1. **Kiểm tra schema có đúng không:**
   ```bash
   npx prisma validate
   ```

2. **Xem migration status:**
   ```bash
   npx prisma migrate status
   ```

3. **Reset hoàn toàn (xóa tất cả dữ liệu):**
   ```bash
   npx prisma migrate reset
   ```
   ⚠️ Cảnh báo: Lệnh này sẽ xóa TẤT CẢ dữ liệu trong database!

4. **Generate lại Prisma Client:**
   ```bash
   npx prisma generate
   ```

## ✅ Checklist

- [ ] Đã chạy `npx prisma migrate dev`
- [ ] Đã chạy `npx prisma generate` (hoặc tự động)
- [ ] Database đã được tạo và có kết nối
- [ ] File `.env` có `DATABASE_URL` đúng
- [ ] Chạy `npm run db:seed` thành công

