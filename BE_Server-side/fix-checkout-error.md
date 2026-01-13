# Hướng dẫn sửa lỗi 500 khi checkout

## Vấn đề
Backend trả về lỗi 500 khi checkout, có thể do:
1. Prisma client chưa được regenerate sau khi thêm payment fields
2. Database chưa có payment fields (chưa migrate)

## Giải pháp

### Bước 1: Kiểm tra Prisma Client
```bash
cd /var/web/Web_Technology/BE_Server-side

# Regenerate Prisma client
npx prisma generate
```

### Bước 2: Kiểm tra Database Migration
```bash
# Kiểm tra xem migration đã được apply chưa
npx prisma migrate status

# Nếu chưa, apply migration
npx prisma migrate deploy
# Hoặc nếu không có shadow database permission:
psql -U your_user -d your_database -f apply-payment-fields-migration.sql
```

### Bước 3: Kiểm tra Backend Logs
```bash
# Xem logs chi tiết
pm2 logs backend --lines 50

# Hoặc nếu chạy trực tiếp
npm run start:dev
```

### Bước 4: Kiểm tra Database Schema
```sql
-- Kiểm tra xem Order table có payment fields chưa
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Order' 
AND column_name IN ('paymentId', 'paymentStatus', 'paymentMethod', 'paymentLink', 'paymentQrCode', 'paidAt');
```

Nếu không có các columns này, cần chạy migration:
```bash
psql -U your_user -d your_database -f apply-payment-fields-migration.sql
```

### Bước 5: Restart Backend
```bash
pm2 restart backend
# hoặc
pm2 restart all
```

## Lưu ý
- Nếu vẫn lỗi, kiểm tra backend logs để xem lỗi cụ thể
- Đảm bảo PayOS environment variables đã được cấu hình (không cần thiết cho checkout, nhưng cần cho payment)
