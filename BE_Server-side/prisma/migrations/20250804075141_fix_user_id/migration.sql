/*
  Warnings:

  - You are about to drop the column `UserID` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `UserID` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userID]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userID` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_UserID_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_UserID_fkey";

-- DropIndex
DROP INDEX "Profile_UserID_key";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "UserID",
ADD COLUMN     "userID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "UserID",
ADD COLUMN     "userID" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userID_key" ON "Profile"("userID");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
