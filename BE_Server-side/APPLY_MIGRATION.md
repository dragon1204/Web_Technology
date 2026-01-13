# Hướng dẫn áp dụng Migration: Thêm Unique Constraint cho Shop.ownerId

## Vấn đề
Prisma Migrate không thể tạo shadow database do thiếu quyền. Cần áp dụng migration thủ công.

## Giải pháp

### Cách 1: Chạy SQL trực tiếp (Khuyến nghị)

1. **Kết nối đến PostgreSQL database:**
   ```bash
   psql -h 159.223.61.25 -U webtech_user -d web_technology
   ```

2. **Chạy SQL script:**
   ```sql
   -- Xóa index cũ
   DROP INDEX IF EXISTS "Shop_ownerId_idx";
   
   -- Xóa shop trùng lặp (nếu có)
   DELETE FROM "ShopProduct" 
   WHERE "shopId" IN (
     SELECT id FROM "Shop" 
     WHERE id NOT IN (
       SELECT MIN(id) FROM "Shop" GROUP BY "ownerId"
     )
   );
   
   DELETE FROM "Shop" 
   WHERE id NOT IN (
     SELECT MIN(id) FROM "Shop" GROUP BY "ownerId"
   );
   
   -- Thêm unique constraint
   ALTER TABLE "Shop" ADD CONSTRAINT "Shop_ownerId_key" UNIQUE ("ownerId");
   ```

3. **Hoặc chạy file SQL:**
   ```bash
   psql -h 159.223.61.25 -U webtech_user -d web_technology -f apply-shop-unique-constraint.sql
   ```

### Cách 2: Sử dụng Prisma DB Push (Development)

Nếu đang ở môi trường development, có thể dùng:

```bash
cd BE_Server-side
npx prisma db push
```

**Lưu ý:** `db push` không tạo migration file, chỉ sync schema với database.

### Cách 3: Đánh dấu migration đã chạy

Sau khi chạy SQL thủ công, đánh dấu migration đã được apply:

```bash
cd BE_Server-side
npx prisma migrate resolve --applied 20260113093301_add_unique_shop_owner
```

## Kiểm tra

Sau khi áp dụng, kiểm tra constraint đã được tạo:

```sql
SELECT 
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'Shop'::regclass
AND conname = 'Shop_ownerId_key';
```

Nếu thấy `Shop_ownerId_key` → Migration thành công!

## Lưu ý

- **Backup database** trước khi chạy migration (nếu có dữ liệu quan trọng)
- Nếu có shop trùng lặp, script sẽ xóa các shop cũ, chỉ giữ lại shop đầu tiên của mỗi user
- Sau khi migration, mỗi user chỉ có thể có **1 shop duy nhất**
