-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hashedRt" TEXT,
ADD COLUMN     "isTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totpSecret" TEXT;
