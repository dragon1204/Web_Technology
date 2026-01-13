# Hướng dẫn sửa lỗi TypeScript Payment

## Vấn đề
Prisma client chưa được regenerate sau khi thêm payment fields vào schema, dẫn đến TypeScript không nhận ra các field mới.

## Giải pháp

### Bước 1: Dừng backend (nếu đang chạy)
```bash
# Nếu dùng PM2
pm2 stop backend
# hoặc
pm2 stop all

# Nếu chạy trực tiếp
# Nhấn Ctrl+C để dừng
```

### Bước 2: Regenerate Prisma Client
```bash
cd /var/web/Web_Technology/BE_Server-side
npx prisma generate
```

### Bước 3: Restart backend
```bash
# Nếu dùng PM2
pm2 start backend
# hoặc
pm2 restart all

# Nếu chạy trực tiếp
npm run start:prod
```

## Lưu ý
- Lỗi `EPERM` thường xảy ra khi backend đang chạy và giữ lock trên Prisma client files
- Phải dừng backend trước khi chạy `prisma generate`
- Sau khi regenerate, TypeScript sẽ nhận ra tất cả payment fields
