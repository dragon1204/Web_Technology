/*
  Warnings:

  - You are about to drop the column `ownerID` on the `Garden` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Garden` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Garden" DROP CONSTRAINT "Garden_ownerID_fkey";

-- AlterTable
ALTER TABLE "Garden" DROP COLUMN "ownerID",
ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Garden" ADD CONSTRAINT "Garden_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
