# 🔧 Sửa Lỗi Seed

## ❌ Lỗi: "Cannot read properties of undefined (reading 'deleteMany')"

Lỗi này xảy ra khi Prisma Client chưa được generate sau khi thêm models mới.

## ✅ Giải Pháp

### Bước 1: Generate Prisma Client

```bash
cd BE_Server-side
npx prisma generate
```

### Bước 2: Chạy Migration (nếu chưa chạy)

```bash
npx prisma migrate dev
```

### Bước 3: Chạy Seed

```bash
npm run db:seed
```

## 🔄 Hoặc Chạy Tất Cả Cùng Lúc

```bash
cd BE_Server-side

# Generate Prisma Client
npx prisma generate

# Chạy migration
npx prisma migrate dev

# Chạy seed
npm run db:seed
```

## 📝 Lưu Ý

- Script `seed.js` đã được cập nhật để tự động generate Prisma Client
- Nếu vẫn lỗi, hãy chạy `npx prisma generate` thủ công trước
- Đảm bảo database đã được tạo và `DATABASE_URL` trong `.env` đúng

## 🐛 Nếu Vẫn Lỗi

1. Kiểm tra file `.env` có `DATABASE_URL`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```

2. Kiểm tra database đã được tạo chưa

3. Chạy lại migration:
   ```bash
   npx prisma migrate reset
   npx prisma migrate dev
   npx prisma generate
   npm run db:seed
   ```

