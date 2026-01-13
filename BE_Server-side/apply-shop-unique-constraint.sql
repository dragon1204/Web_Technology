-- Script để thêm unique constraint cho Shop.ownerId
-- Chạy script này trực tiếp trên PostgreSQL database

-- Bước 1: Xóa index cũ nếu có
DROP INDEX IF EXISTS "Shop_ownerId_idx";

-- Bước 2: Xóa các shop trùng lặp (giữ lại shop đầu tiên của mỗi user)
-- CHỈ CHẠY NẾU CÓ DỮ LIỆU TRÙNG LẶP
-- Nếu không có dữ liệu trùng lặp, bỏ qua bước này

-- Xóa ShopProduct của các shop trùng lặp
DELETE FROM "ShopProduct" 
WHERE "shopId" IN (
  SELECT id FROM "Shop" 
  WHERE id NOT IN (
    SELECT MIN(id) FROM "Shop" GROUP BY "ownerId"
  )
);

-- Xóa các shop trùng lặp (giữ lại shop đầu tiên)
DELETE FROM "Shop" 
WHERE id NOT IN (
  SELECT MIN(id) FROM "Shop" GROUP BY "ownerId"
);

-- Bước 3: Thêm unique constraint
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_ownerId_key" UNIQUE ("ownerId");
