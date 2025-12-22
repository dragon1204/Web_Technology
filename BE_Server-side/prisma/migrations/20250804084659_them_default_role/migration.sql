-- Bước 1: Thêm cột tạm
ALTER TABLE "User" ADD COLUMN "role" "Role";

-- Bước 2: Copy giá trị đầu tiên trong mảng roles sang role mới
UPDATE "User" SET "role" = roles[1];

-- Bước 3: Xoá cột cũ
ALTER TABLE "User" DROP COLUMN "roles";

-- Bước 4: Đổi tên cột mới
ALTER TABLE "User" RENAME COLUMN "role" TO "roles";
