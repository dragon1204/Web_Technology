-- Migration: Thêm payment fields vào Order table
-- Chạy script này trực tiếp trên PostgreSQL database

-- Thêm các cột payment
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentLink" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentQrCode" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);

-- Tạo indexes
CREATE INDEX IF NOT EXISTS "Order_paymentId_idx" ON "Order"("paymentId");
CREATE INDEX IF NOT EXISTS "Order_paymentStatus_idx" ON "Order"("paymentStatus");
