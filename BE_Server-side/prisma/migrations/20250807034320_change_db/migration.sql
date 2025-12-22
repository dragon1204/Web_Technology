/*
  Warnings:

  - You are about to drop the column `content` on the `Garden` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Vegetable` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Garden" DROP COLUMN "content";

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Vegetable" DROP COLUMN "price";
