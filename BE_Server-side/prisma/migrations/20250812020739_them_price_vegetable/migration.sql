/*
  Warnings:

  - You are about to drop the column `price` on the `Sale` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "Vegetable" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0;
