-- AlterTable
-- Thêm unique constraint cho ownerId trong bảng Shop
-- Đảm bảo mỗi user chỉ có duy nhất một shop

-- Bước 1: Xóa các shop trùng lặp (giữ lại shop đầu tiên của mỗi user)
-- Lưu ý: Chỉ chạy nếu có dữ liệu trùng lặp
-- DELETE FROM "ShopProduct" WHERE "shopId" IN (
--   SELECT id FROM "Shop" WHERE id NOT IN (
--     SELECT MIN(id) FROM "Shop" GROUP BY "ownerId"
--   )
-- );
-- DELETE FROM "Shop" WHERE id NOT IN (
--   SELECT MIN(id) FROM "Shop" GROUP BY "ownerId"
-- );

-- Bước 2: Xóa index cũ nếu có
DROP INDEX IF EXISTS "Shop_ownerId_idx";

-- Bước 3: Thêm unique constraint
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_ownerId_key" UNIQUE ("ownerId");
